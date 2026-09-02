package com.aiassistantapp.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.aiassistantapp.MainActivity

class ReminderAlertReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val alert = ReminderAlertStore.fromIntent(intent) ?: return
    when (intent?.action) {
      ACTION_FIRE,
      ReminderAlertStore.ACTION_FIRE -> {
        if (ReminderAlertStore.isDismissed(context, alert.reminderId)) {
          ReminderNotificationHelper.dismiss(context, alert.reminderId)
          return
        }
        ReminderAlertService.start(
          context,
          alert.copy(action = ReminderAlertStore.ACTION_INCOMING, autoAnswer = false),
        )
      }
      ReminderAlertStore.ACTION_ANSWER -> {
        ReminderNotificationHelper.suppress(context, alert.reminderId)
        val answered = alert.copy(
          action = ReminderAlertStore.ACTION_ANSWER,
          autoAnswer = true,
        )
        ReminderAlertStore.save(context, answered)
        BuddyNotificationModule.emitAlert(answered)
        openApp(context, answered)
      }
      ReminderAlertStore.ACTION_REJECT,
      ReminderAlertStore.ACTION_STOP -> {
        ReminderNotificationHelper.suppress(context, alert.reminderId)
        val dismissed = alert.copy(
          action = intent.action ?: ReminderAlertStore.ACTION_STOP,
          autoAnswer = false,
        )
        BuddyNotificationModule.emitAlert(dismissed)
      }
      ReminderAlertStore.ACTION_SNOOZE -> {
        ReminderAlertService.stop(context)
        ReminderNotificationHelper.dismiss(context, alert.reminderId)
        ReminderNotificationHelper.scheduleSnooze(
          context,
          alert,
          ReminderAlertStore.SNOOZE_MINUTES,
        )
        BuddyNotificationModule.emitAlert(alert.copy(action = ReminderAlertStore.ACTION_SNOOZE))
      }
    }
  }

  private fun openApp(context: Context, alert: ReminderAlertStore.Alert) {
    val launch = ReminderAlertStore.putExtras(
      Intent(context, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_CLEAR_TOP
      },
      alert,
    )
    context.startActivity(launch)
  }

  companion object {
    const val ACTION_FIRE = "com.aiassistantapp.notifications.FIRE_ALERT"
  }
}
