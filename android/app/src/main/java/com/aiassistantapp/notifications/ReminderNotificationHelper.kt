package com.aiassistantapp.notifications

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import android.media.AudioAttributes
import android.os.Build
import com.aiassistantapp.MainActivity
import com.aiassistantapp.R

object ReminderNotificationHelper {
  const val REMINDER_CHANNEL_ID = "buddy_reminders"
  const val ALARM_CHANNEL_ID = "buddy_reminder_alarms_v2"
  const val CALL_CHANNEL_ID = "buddy_reminder_calls_v2"

  fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val manager = context.getSystemService(NotificationManager::class.java) ?: return
    val alarmAttrs = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()
    val callAttrs = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    manager.createNotificationChannel(
      NotificationChannel(
        REMINDER_CHANNEL_ID,
        "Buddy reminders",
        NotificationManager.IMPORTANCE_HIGH,
      ).apply {
        description = "Reminder notifications from Buddy"
        enableVibration(true)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        setShowBadge(true)
      },
    )
    manager.createNotificationChannel(
      NotificationChannel(
        ALARM_CHANNEL_ID,
        "Buddy reminder alarms",
        NotificationManager.IMPORTANCE_HIGH,
      ).apply {
        description = "Alarm-style reminder alerts from Buddy"
        enableVibration(true)
        setSound(null, alarmAttrs)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        setShowBadge(true)
      },
    )
    manager.createNotificationChannel(
      NotificationChannel(
        CALL_CHANNEL_ID,
        "Buddy AI calls",
        NotificationManager.IMPORTANCE_HIGH,
      ).apply {
        description = "Incoming Buddy reminder calls"
        enableVibration(true)
        setSound(null, callAttrs)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        setShowBadge(true)
      },
    )
  }

  fun show(
    context: Context,
    title: String,
    body: String,
    reminderId: String?,
    type: String?,
    callId: String? = null,
  ) {
    ensureChannels(context)
    val alert = ReminderAlertStore.Alert(
      reminderId = reminderId.orEmpty(),
      title = title.ifBlank { "Buddy" },
      message = body,
      type = type?.ifBlank { ReminderAlertStore.TYPE_NOTIFICATION }
        ?: ReminderAlertStore.TYPE_NOTIFICATION,
      action = ReminderAlertStore.ACTION_INCOMING,
      callId = callId.orEmpty(),
      autoAnswer = false,
    )

    if (ReminderAlertStore.isDismissed(context, alert.reminderId)) {
      return
    }

    if (
      alert.type == ReminderAlertStore.TYPE_ALARM ||
      alert.type == ReminderAlertStore.TYPE_CALL
    ) {
      ReminderAlertService.start(context, alert)
      return
    }

    postSimpleNotification(context, alert)
  }

  fun dismiss(context: Context, reminderId: String) {
    context.getSystemService(NotificationManager::class.java)
      ?.cancel(ReminderAlertStore.notificationId(reminderId))
  }

  fun suppress(context: Context, reminderId: String) {
    ReminderAlertStore.markDismissed(context, reminderId)
    ReminderAlertService.stop(context)
    dismiss(context, reminderId)
    cancelSnooze(context, reminderId)
    ReminderAlertStore.clear(context)
  }

  fun cancelSnooze(context: Context, reminderId: String) {
    val intent = Intent(context, ReminderAlertReceiver::class.java)
      .setAction(ReminderAlertReceiver.ACTION_FIRE)
    val pending = pendingBroadcast(context, reminderId.hashCode() + 91, intent)
    context.getSystemService(AlarmManager::class.java)?.cancel(pending)
    pending.cancel()
  }

  fun scheduleSnooze(context: Context, alert: ReminderAlertStore.Alert, minutes: Int) {
    ReminderAlertStore.clearDismissed(context, alert.reminderId)
    val fireAt = System.currentTimeMillis() + minutes * 60_000L
    val intent = ReminderAlertStore.putExtras(
      Intent(context, ReminderAlertReceiver::class.java).setAction(ReminderAlertReceiver.ACTION_FIRE),
      alert.copy(action = ReminderAlertStore.ACTION_FIRE, autoAnswer = false),
    )
    val pending = pendingBroadcast(context, alert.reminderId.hashCode() + 91, intent)
    val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pending)
    } else {
      @Suppress("DEPRECATION")
      alarmManager.set(AlarmManager.RTC_WAKEUP, fireAt, pending)
    }
  }

  fun buildAlertNotification(context: Context, alert: ReminderAlertStore.Alert): Notification {
    ensureChannels(context)
    val channelId = channelFor(alert.type)
    val openAlert = alert.copy(action = ReminderAlertStore.ACTION_OPEN)
    val contentIntent = pendingActivity(context, alert.reminderId.hashCode(), openAlert)
    val builder = notificationBuilder(context, channelId)
      .setSmallIcon(R.drawable.ic_stat_buddy_mic)
      .setContentTitle(alert.title)
      .setContentText(alert.message)
      .setStyle(Notification.BigTextStyle().bigText(alert.message))
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .setAutoCancel(false)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setCategory(
        if (alert.type == ReminderAlertStore.TYPE_CALL) {
          Notification.CATEGORY_CALL
        } else {
          Notification.CATEGORY_ALARM
        },
      )
      .setDefaults(0)

    if (alert.type == ReminderAlertStore.TYPE_CALL) {
      val answeredAlert = alert.copy(
        action = ReminderAlertStore.ACTION_ANSWER,
        autoAnswer = true,
      )
      builder
        .addAction(
          notificationAction(
            context,
            "Reject",
            pendingBroadcast(
              context,
              alert.reminderId.hashCode() + 11,
              actionIntent(context, alert, ReminderAlertStore.ACTION_REJECT),
            ),
          ),
        )
        .addAction(
          notificationAction(
            context,
            "Answer",
            pendingActivity(context, alert.reminderId.hashCode() + 12, answeredAlert),
          ),
        )
    } else {
      builder
        .addAction(
          R.drawable.ic_stat_buddy_mic,
          "Stop",
          pendingBroadcast(
            context,
            alert.reminderId.hashCode() + 21,
            actionIntent(context, alert, ReminderAlertStore.ACTION_STOP),
          ),
        )
        .addAction(
          R.drawable.ic_stat_buddy_mic,
          "Snooze ${ReminderAlertStore.SNOOZE_MINUTES} min",
          pendingBroadcast(
            context,
            alert.reminderId.hashCode() + 22,
            actionIntent(context, alert, ReminderAlertStore.ACTION_SNOOZE),
          ),
        )
        .setFullScreenIntent(
          pendingActivity(
            context,
            alert.reminderId.hashCode() + 23,
            alert.copy(action = ReminderAlertStore.ACTION_INCOMING),
          ),
          true,
        )
    }

    return builder.build()
  }

  private fun postSimpleNotification(context: Context, alert: ReminderAlertStore.Alert) {
    val contentIntent = pendingActivity(
      context,
      alert.reminderId.hashCode(),
      alert.copy(action = ReminderAlertStore.ACTION_OPEN),
    )
    val builder = notificationBuilder(context, REMINDER_CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_buddy_mic)
      .setContentTitle(alert.title)
      .setContentText(alert.message)
      .setStyle(Notification.BigTextStyle().bigText(alert.message))
      .setAutoCancel(true)
      .setContentIntent(contentIntent)
      .setCategory(Notification.CATEGORY_REMINDER)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setDefaults(Notification.DEFAULT_ALL)

    context.getSystemService(NotificationManager::class.java)
      ?.notify(ReminderAlertStore.notificationId(alert.reminderId), builder.build())
  }

  private fun channelFor(type: String): String =
    when (type) {
      ReminderAlertStore.TYPE_CALL -> CALL_CHANNEL_ID
      ReminderAlertStore.TYPE_ALARM -> ALARM_CHANNEL_ID
      else -> REMINDER_CHANNEL_ID
    }

  private fun notificationBuilder(context: Context, channelId: String): Notification.Builder =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, channelId)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(context)
    }

  private fun notificationAction(
    context: Context,
    title: String,
    pendingIntent: PendingIntent,
  ): Notification.Action {
    val builder =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Notification.Action.Builder(
          Icon.createWithResource(context, R.drawable.ic_stat_buddy_mic),
          title,
          pendingIntent,
        )
      } else {
        @Suppress("DEPRECATION")
        Notification.Action.Builder(R.drawable.ic_stat_buddy_mic, title, pendingIntent)
      }
    return builder.build()
  }

  private fun actionIntent(
    context: Context,
    alert: ReminderAlertStore.Alert,
    action: String,
  ): Intent =
    ReminderAlertStore.putExtras(
      Intent(context, ReminderAlertReceiver::class.java).setAction(action),
      alert.copy(
        action = action,
        autoAnswer = action == ReminderAlertStore.ACTION_ANSWER,
      ),
    )

  private fun pendingBroadcast(context: Context, requestCode: Int, intent: Intent): PendingIntent {
    val flags =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
    return PendingIntent.getBroadcast(context, requestCode, intent, flags)
  }

  private fun pendingActivity(
    context: Context,
    requestCode: Int,
    alert: ReminderAlertStore.Alert,
  ): PendingIntent {
    val intent = ReminderAlertStore.putExtras(
      Intent(context, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_NEW_TASK
      },
      alert,
    )
    val flags =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
    return PendingIntent.getActivity(context, requestCode, intent, flags)
  }
}
