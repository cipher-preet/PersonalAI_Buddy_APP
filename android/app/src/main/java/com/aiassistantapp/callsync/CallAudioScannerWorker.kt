package com.aiassistantapp.callsync

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.CallLog
import android.provider.MediaStore
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import java.security.MessageDigest
import kotlin.math.abs

class CallAudioScannerWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
  override suspend fun doWork(): Result {
    setForeground(createForegroundInfo())
    val scheduledUser = inputData.getString(KEY_USER_ID) ?: return Result.success()
    if (CallSyncStore(applicationContext).activeUserId() != scheduledUser) return Result.success()
    val result = scanAndUpload(applicationContext, inputData.getLong(KEY_CALL_ENDED_AT, System.currentTimeMillis()))
    return when {
      result.retryableFailure -> Result.retry()
      result.recordingPending && runAttemptCount < MAX_INDEX_ATTEMPTS -> Result.retry()
      else -> Result.success()
    }
  }

  private fun createForegroundInfo(): ForegroundInfo {
    val manager = applicationContext.getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Call recording sync", NotificationManager.IMPORTANCE_LOW))
    val notification = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
      .setSmallIcon(com.aiassistantapp.R.drawable.ic_stat_buddy_mic).setContentTitle("Syncing call recording")
      .setContentText("Checking for a completed recording").setOngoing(true).setPriority(NotificationCompat.PRIORITY_LOW).build()
    return if (Build.VERSION.SDK_INT >= 29) ForegroundInfo(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC) else ForegroundInfo(NOTIFICATION_ID, notification)
  }

  data class ScanResult(val scanned: Int, val uploaded: Int, val failed: Int = 0, val retryableFailure: Boolean = false, val recordingPending: Boolean = false, val errorCode: String? = null)
  data class RecentCall(val number: String, val timestamp: Long, val phoneAccountId: String?)
  data class AudioFile(val uri: Uri, val name: String, val size: Long, val timestamp: Long, val mimeType: String)

  companion object {
    const val KEY_CALL_ENDED_AT = "call_ended_at"
    const val KEY_USER_ID = "user_id"
    private const val CHANNEL_ID = "buddy_call_sync"
    private const val NOTIFICATION_ID = 7302
    private const val MAX_INDEX_ATTEMPTS = 3
    private const val CALL_LOOKBACK_MS = 12 * 60 * 60 * 1000L
    private const val CALL_TOLERANCE_MS = 90_000L
    private const val FILE_BEFORE_CALL_END_MS = 30_000L
    private const val FILE_AFTER_CALL_END_MS = 120_000L
    private val OEM_PATHS = listOf("recordings/call", "miui/sound_recorder/call_rec", "recordings/call recordings")

    fun scanAndUpload(context: Context, endedAt: Long = System.currentTimeMillis()): ScanResult {
      val store = CallSyncStore(context)
      if (store.activeUserId() == null) return ScanResult(0, 0, errorCode = "NO_ACTIVE_USER")
      if (!AudioUploader.isConfigured()) return ScanResult(0, 0, failed = 1, errorCode = "UPLOAD_NOT_CONFIGURED")
      if (!hasPermission(context, Manifest.permission.READ_CALL_LOG) || !hasAudioPermission(context)) return ScanResult(0, 0, errorCode = "PERMISSION_MISSING")
      val call = findRecentCall(context, endedAt) ?: return ScanResult(0, 0)
      if (!store.isWhitelisted(call.number)) return ScanResult(0, 0)
      val file = findBestRecording(context, call) ?: return ScanResult(0, 0, recordingPending = true)
      val hash = sha256("${file.uri}|${file.size}|${file.timestamp}")
      if (store.wasUploaded(hash)) return ScanResult(1, 0)
      store.record(hash, call.number, file.name, file.size, call.timestamp, "PENDING")
      return try {
        val upload = AudioUploader.upload(context, file.uri, file.name, file.mimeType, call.number, call.timestamp, call.phoneAccountId)
        if (upload.successful) {
          store.record(hash, call.number, file.name, file.size, call.timestamp, "SUCCESS", upload.remoteUrl)
          ScanResult(1, 1)
        } else {
          store.record(hash, call.number, file.name, file.size, call.timestamp, "FAILED")
          ScanResult(1, 0, failed = 1, retryableFailure = upload.retryable, errorCode = "UPLOAD_FAILED")
        }
      } catch (_: Exception) {
        store.record(hash, call.number, file.name, file.size, call.timestamp, "FAILED")
        ScanResult(1, 0, failed = 1, retryableFailure = true, errorCode = "UPLOAD_FAILED")
      }
    }

    private fun findRecentCall(context: Context, endedAt: Long): RecentCall? {
      val projection = arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.DATE, CallLog.Calls.DURATION, CallLog.Calls.PHONE_ACCOUNT_ID)
      val selection = "${CallLog.Calls.DATE} BETWEEN ? AND ?"
      val args = arrayOf((endedAt - CALL_LOOKBACK_MS).toString(), (endedAt + CALL_TOLERANCE_MS).toString())
      var best: RecentCall? = null
      var bestDelta = Long.MAX_VALUE
      context.contentResolver.query(CallLog.Calls.CONTENT_URI, projection, selection, args, "${CallLog.Calls.DATE} DESC")?.use { cursor ->
        val numberIndex = cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER)
        val dateIndex = cursor.getColumnIndexOrThrow(CallLog.Calls.DATE)
        val durationIndex = cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION)
        val accountIndex = cursor.getColumnIndex(CallLog.Calls.PHONE_ACCOUNT_ID)
        while (cursor.moveToNext()) {
          val number = CallSyncStore.normalize(cursor.getString(numberIndex)) ?: continue
          val completedAt = cursor.getLong(dateIndex) + cursor.getLong(durationIndex) * 1000
          val delta = abs(completedAt - endedAt)
          if (delta <= CALL_TOLERANCE_MS && delta < bestDelta) {
            best = RecentCall(number, completedAt, accountIndex.takeIf { it >= 0 && !cursor.isNull(it) }?.let(cursor::getString))
            bestDelta = delta
          }
        }
      }
      return best
    }

    private fun findBestRecording(context: Context, call: RecentCall): AudioFile? {
      val projection = mutableListOf(MediaStore.Audio.Media._ID, MediaStore.Audio.Media.DISPLAY_NAME, MediaStore.Audio.Media.SIZE, MediaStore.Audio.Media.DATE_ADDED, MediaStore.Audio.Media.DATE_MODIFIED, MediaStore.Audio.Media.MIME_TYPE)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) projection += MediaStore.Audio.Media.RELATIVE_PATH
      val lower = (call.timestamp - FILE_BEFORE_CALL_END_MS) / 1000
      val upper = (call.timestamp + FILE_AFTER_CALL_END_MS) / 1000
      val selection = "(${MediaStore.Audio.Media.DATE_ADDED} BETWEEN ? AND ?) OR (${MediaStore.Audio.Media.DATE_MODIFIED} BETWEEN ? AND ?)"
      val args = arrayOf(lower.toString(), upper.toString(), lower.toString(), upper.toString())
      val candidates = mutableListOf<AudioFile>()
      context.contentResolver.query(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, projection.toTypedArray(), selection, args, "${MediaStore.Audio.Media.DATE_MODIFIED} DESC")?.use { cursor ->
        while (cursor.moveToNext()) {
          val path = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) cursor.string(MediaStore.Audio.Media.RELATIVE_PATH) else cursor.string(MediaStore.Audio.Media.DATA)
          if (path == null || OEM_PATHS.none { path.lowercase().contains(it) }) continue
          val id = cursor.long(MediaStore.Audio.Media._ID)
          val added = cursor.long(MediaStore.Audio.Media.DATE_ADDED) * 1000
          val modified = cursor.long(MediaStore.Audio.Media.DATE_MODIFIED) * 1000
          val timestamp = listOf(added, modified).filter { it in (call.timestamp - FILE_BEFORE_CALL_END_MS)..(call.timestamp + FILE_AFTER_CALL_END_MS) }.minByOrNull { abs(it - call.timestamp) } ?: continue
          candidates += AudioFile(Uri.withAppendedPath(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id.toString()), cursor.string(MediaStore.Audio.Media.DISPLAY_NAME) ?: "call-$id.m4a", cursor.long(MediaStore.Audio.Media.SIZE), timestamp, cursor.string(MediaStore.Audio.Media.MIME_TYPE) ?: "audio/*")
        }
      }
      val key = CallSyncStore.matchKey(call.number)
      return candidates.minWithOrNull(compareBy<AudioFile>({ if (it.name.filter(Char::isDigit).contains(key)) 0 else 1 }, { abs(it.timestamp - call.timestamp) }))
    }

    private fun Cursor.string(column: String) = getColumnIndex(column).takeIf { it >= 0 && !isNull(it) }?.let(::getString)
    private fun Cursor.long(column: String) = getColumnIndex(column).takeIf { it >= 0 && !isNull(it) }?.let(::getLong) ?: 0L
    private fun sha256(value: String) = MessageDigest.getInstance("SHA-256").digest(value.toByteArray()).joinToString("") { "%02x".format(it) }
    private fun hasPermission(context: Context, permission: String) = ActivityCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    private fun hasAudioPermission(context: Context) = if (Build.VERSION.SDK_INT >= 33) hasPermission(context, Manifest.permission.READ_MEDIA_AUDIO) else hasPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE)
  }
}
