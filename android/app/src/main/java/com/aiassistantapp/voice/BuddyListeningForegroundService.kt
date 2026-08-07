package com.aiassistantapp.voice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import com.aiassistantapp.R

class BuddyListeningForegroundService : Service() {
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val title = intent?.getStringExtra(EXTRA_TITLE) ?: DEFAULT_TITLE
    val message = intent?.getStringExtra(EXTRA_MESSAGE) ?: DEFAULT_MESSAGE
    val notification = buildNotification(title, message)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE,
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }

    acquireWakeLock()

    return START_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onDestroy() {
    releaseWakeLock()
    super.onDestroy()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_LOW,
    ).apply {
      description = CHANNEL_DESCRIPTION
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      setShowBadge(false)
    }

    getSystemService(NotificationManager::class.java)
      ?.createNotificationChannel(channel)
  }

  private fun buildNotification(title: String, message: String): Notification {
    val launchIntent = packageManager
      .getLaunchIntentForPackage(packageName)
      ?.apply {
        flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }
      ?: Intent()
    val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }
    val contentIntent = PendingIntent.getActivity(
      this,
      0,
      launchIntent,
      pendingIntentFlags,
    )

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      Notification.Builder(this)
    }

    return builder
      .setSmallIcon(R.drawable.ic_stat_buddy_mic)
      .setContentTitle(title)
      .setContentText(message)
      .setStyle(Notification.BigTextStyle().bigText(message))
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setCategory(Notification.CATEGORY_SERVICE)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .build()
  }

  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) {
      return
    }

    val powerManager = getSystemService(PowerManager::class.java) ?: return
    wakeLock = powerManager.newWakeLock(
      PowerManager.PARTIAL_WAKE_LOCK,
      "$packageName:BuddyListeningWakeLock",
    ).apply {
      setReferenceCounted(false)
      acquire()
    }
  }

  private fun releaseWakeLock() {
    val lock = wakeLock
    if (lock?.isHeld == true) {
      lock.release()
    }
    wakeLock = null
  }

  companion object {
    const val CHANNEL_ID = "buddy_listening"
    const val CHANNEL_NAME = "Buddy listening"
    const val CHANNEL_DESCRIPTION = "Shows when Buddy is listening in the background."
    const val EXTRA_TITLE = "extra_title"
    const val EXTRA_MESSAGE = "extra_message"
    private const val NOTIFICATION_ID = 4210
    private const val DEFAULT_TITLE = "Buddy is listening"
    private const val DEFAULT_MESSAGE = "Recording continues in the background."
  }
}
