package com.aiassistantapp

import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.WindowInsetsController
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
    setTheme(R.style.AppTheme)
    super.onCreate(savedInstanceState)
    applyReadableStatusBar()
    captureReminderIntent(intent)
  }

  override fun onResume() {
    super.onResume()
    applyReadableStatusBar()
  }

  private fun applyReadableStatusBar() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.insetsController?.setSystemBarsAppearance(
        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
      )
    }
    @Suppress("DEPRECATION")
    window.statusBarColor = Color.parseColor("#F7F7F7")
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
