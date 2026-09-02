package com.aiassistantapp.notifications

import android.app.Notification
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

class ReminderAlertService : Service() {
  private var player: MediaPlayer? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var currentAlert: ReminderAlertStore.Alert? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopSelfSafely()
      return START_NOT_STICKY
    }

    val alert = ReminderAlertStore.fromIntent(intent) ?: run {
      stopSelfSafely()
      return START_NOT_STICKY
    }

    if (ReminderAlertStore.isDismissed(this, alert.reminderId)) {
      stopSelfSafely()
      return START_NOT_STICKY
    }

    if (
      currentAlert?.reminderId == alert.reminderId &&
      player?.isPlaying == true
    ) {
      return START_NOT_STICKY
    }

    currentAlert = alert
    ReminderAlertStore.save(this, alert)
    ReminderNotificationHelper.ensureChannels(this)

    val notification = ReminderNotificationHelper.buildAlertNotification(this, alert)
    startAsForeground(alert, notification)
    startSound(alert.type)
    startVibration()
    BuddyNotificationModule.emitAlert(alert)
    return START_NOT_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onDestroy() {
    stopSound()
    stopVibration()
    releaseWakeLock()
    currentAlert?.let { ReminderNotificationHelper.dismiss(this, it.reminderId) }
    super.onDestroy()
  }

  private fun startAsForeground(alert: ReminderAlertStore.Alert, notification: Notification) {
    val notificationId = ReminderAlertStore.notificationId(alert.reminderId)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        notificationId,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
      )
    } else {
      startForeground(notificationId, notification)
    }
    acquireWakeLock()
  }

  private fun startSound(type: String) {
    stopSound()
    val ringtoneType =
      if (type == ReminderAlertStore.TYPE_CALL) {
        RingtoneManager.TYPE_RINGTONE
      } else {
        RingtoneManager.TYPE_ALARM
      }
    val uri = RingtoneManager.getDefaultUri(ringtoneType)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    val usage =
      if (type == ReminderAlertStore.TYPE_CALL) {
        AudioAttributes.USAGE_NOTIFICATION_RINGTONE
      } else {
        AudioAttributes.USAGE_ALARM
      }

    try {
      player = MediaPlayer().apply {
        setDataSource(this@ReminderAlertService, uri)
        isLooping = true
        setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(usage)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build(),
        )
        setOnErrorListener { _, _, _ ->
          stopSound()
          true
        }
        prepare()
        start()
      }
    } catch (_: Exception) {
      stopSound()
    }
  }

  private fun startVibration() {
    val vibrator = vibrator()
    val pattern = longArrayOf(0, 700, 400, 700, 400)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
    } else {
      @Suppress("DEPRECATION")
      vibrator?.vibrate(pattern, 0)
    }
  }

  private fun stopVibration() {
    vibrator()?.cancel()
  }

  private fun vibrator(): Vibrator? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      getSystemService(VibratorManager::class.java)?.defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Vibrator::class.java)
    }

  private fun stopSound() {
    try {
      player?.setOnErrorListener(null)
      if (player?.isPlaying == true) {
        player?.stop()
      }
    } catch (_: Exception) {
    }
    try {
      player?.reset()
    } catch (_: Exception) {
    }
    player?.release()
    player = null
  }

  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) {
      return
    }
    val powerManager = getSystemService(PowerManager::class.java) ?: return
    wakeLock = powerManager.newWakeLock(
      PowerManager.PARTIAL_WAKE_LOCK,
      "$packageName:BuddyReminderAlert",
    ).apply {
      setReferenceCounted(false)
      acquire(10 * 60 * 1000L)
    }
  }

  private fun releaseWakeLock() {
    if (wakeLock?.isHeld == true) {
      wakeLock?.release()
    }
    wakeLock = null
  }

  private fun stopSelfSafely() {
    stopSound()
    stopVibration()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      stopForeground(STOP_FOREGROUND_REMOVE)
    } else {
      @Suppress("DEPRECATION")
      stopForeground(true)
    }
    stopSelf()
  }

  companion object {
    const val ACTION_STOP = "com.aiassistantapp.notifications.STOP_ALERT"

    fun start(context: Context, alert: ReminderAlertStore.Alert) {
      val intent = ReminderAlertStore.putExtras(
        Intent(context, ReminderAlertService::class.java),
        alert,
      )
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      val intent = Intent(context, ReminderAlertService::class.java).setAction(ACTION_STOP)
      try {
        context.startService(intent)
      } catch (_: Exception) {
        context.stopService(Intent(context, ReminderAlertService::class.java))
      }
    }
  }
}
