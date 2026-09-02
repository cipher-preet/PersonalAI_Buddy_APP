package com.aiassistantapp

import android.content.Intent
import android.os.Build
import android.os.Bundle
import com.aiassistantapp.notifications.BuddyNotificationModule
import com.aiassistantapp.notifications.ReminderAlertStore
import com.aiassistantapp.notifications.ReminderNotificationHelper
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "AIAssistantApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    captureReminderIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    captureReminderIntent(intent)
  }

  private fun captureReminderIntent(intent: Intent?) {
    val alert = ReminderAlertStore.fromIntent(intent) ?: return
    if (alert.action == ReminderAlertStore.ACTION_REJECT) {
      ReminderNotificationHelper.suppress(this, alert.reminderId)
      BuddyNotificationModule.emitAlert(alert)
      return
    }
    if (alert.action == ReminderAlertStore.ACTION_ANSWER) {
      ReminderNotificationHelper.suppress(this, alert.reminderId)
    }
    ReminderAlertStore.save(this, alert)
    BuddyNotificationModule.emitAlert(alert)
    if (
      alert.type == ReminderAlertStore.TYPE_CALL ||
      alert.type == ReminderAlertStore.TYPE_ALARM
    ) {
      turnScreenOn()
    }
  }

  private fun turnScreenOn() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }
  }
}
