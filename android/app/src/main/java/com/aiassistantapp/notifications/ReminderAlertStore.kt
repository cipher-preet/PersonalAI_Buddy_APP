package com.aiassistantapp.notifications

import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

object ReminderAlertStore {
  const val EXTRA_REMINDER_ID = "reminderId"
  const val EXTRA_TITLE = "reminderTitle"
  const val EXTRA_MESSAGE = "reminderMessage"
  const val EXTRA_TYPE = "reminderType"
  const val EXTRA_ACTION = "reminderAction"
  const val EXTRA_CALL_ID = "callId"
  const val EXTRA_AUTO_ANSWER = "autoAnswer"

  const val TYPE_NOTIFICATION = "reminder_notification"
  const val TYPE_ALARM = "reminder_alarm"
  const val TYPE_CALL = "ai_reminder_call"

  const val ACTION_INCOMING = "incoming"
  const val ACTION_ANSWER = "answer"
  const val ACTION_REJECT = "reject"
  const val ACTION_STOP = "stop"
  const val ACTION_SNOOZE = "snooze"
  const val ACTION_OPEN = "open"
  const val ACTION_FIRE = "fire"

  private const val PREFS = "buddy_reminder_alerts"
  private const val DISMISSED_PREFS = "buddy_reminder_dismissed"
  const val SNOOZE_MINUTES = 5
  private const val DISMISSED_TTL_MS = 15 * 60 * 1000L

  data class Alert(
    val reminderId: String,
    val title: String,
    val message: String,
    val type: String,
    val action: String,
    val callId: String,
    val autoAnswer: Boolean,
  ) {
    fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putString("reminderId", reminderId)
        putString("title", title)
        putString("message", message)
        putString("type", type)
        putString("action", action)
        putString("callId", callId)
        putBoolean("autoAnswer", autoAnswer)
      }
  }

  fun fromIntent(intent: Intent?): Alert? {
    if (intent == null) {
      return null
    }
    val type = intent.getStringExtra(EXTRA_TYPE).orEmpty()
    if (type.isBlank() && intent.getStringExtra(EXTRA_REMINDER_ID).isNullOrBlank()) {
      return null
    }
    return Alert(
      reminderId = intent.getStringExtra(EXTRA_REMINDER_ID).orEmpty(),
      title = intent.getStringExtra(EXTRA_TITLE).orEmpty().ifBlank { "Buddy" },
      message = intent.getStringExtra(EXTRA_MESSAGE).orEmpty(),
      type = type.ifBlank { TYPE_NOTIFICATION },
      action = intent.getStringExtra(EXTRA_ACTION).orEmpty().ifBlank { ACTION_OPEN },
      callId = intent.getStringExtra(EXTRA_CALL_ID).orEmpty(),
      autoAnswer = intent.getStringExtra(EXTRA_AUTO_ANSWER) == "true" ||
        intent.getBooleanExtra(EXTRA_AUTO_ANSWER, false),
    )
  }

  fun putExtras(intent: Intent, alert: Alert): Intent =
    intent.apply {
      putExtra(EXTRA_REMINDER_ID, alert.reminderId)
      putExtra(EXTRA_TITLE, alert.title)
      putExtra(EXTRA_MESSAGE, alert.message)
      putExtra(EXTRA_TYPE, alert.type)
      putExtra(EXTRA_ACTION, alert.action)
      putExtra(EXTRA_CALL_ID, alert.callId)
      putExtra(EXTRA_AUTO_ANSWER, if (alert.autoAnswer) "true" else "false")
    }

  fun save(context: Context, alert: Alert) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
      .putString(EXTRA_REMINDER_ID, alert.reminderId)
      .putString(EXTRA_TITLE, alert.title)
      .putString(EXTRA_MESSAGE, alert.message)
      .putString(EXTRA_TYPE, alert.type)
      .putString(EXTRA_ACTION, alert.action)
      .putString(EXTRA_CALL_ID, alert.callId)
      .putString(EXTRA_AUTO_ANSWER, if (alert.autoAnswer) "true" else "false")
      .apply()
  }

  fun load(context: Context): Alert? {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val type = prefs.getString(EXTRA_TYPE, "").orEmpty()
    if (type.isBlank()) {
      return null
    }
    return Alert(
      reminderId = prefs.getString(EXTRA_REMINDER_ID, "").orEmpty(),
      title = prefs.getString(EXTRA_TITLE, "Buddy").orEmpty(),
      message = prefs.getString(EXTRA_MESSAGE, "").orEmpty(),
      type = type,
      action = prefs.getString(EXTRA_ACTION, ACTION_OPEN).orEmpty(),
      callId = prefs.getString(EXTRA_CALL_ID, "").orEmpty(),
      autoAnswer = prefs.getString(EXTRA_AUTO_ANSWER, "false") == "true",
    )
  }

  fun clear(context: Context) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
  }

  fun markDismissed(context: Context, reminderId: String) {
    val key = dismissedKey(reminderId)
    context.getSharedPreferences(DISMISSED_PREFS, Context.MODE_PRIVATE).edit()
      .putLong(key, System.currentTimeMillis())
      .apply()
  }

  fun isDismissed(context: Context, reminderId: String): Boolean {
    val prefs = context.getSharedPreferences(DISMISSED_PREFS, Context.MODE_PRIVATE)
    val key = dismissedKey(reminderId)
    val dismissedAt = prefs.getLong(key, 0L)
    if (dismissedAt <= 0L) {
      return false
    }
    if (System.currentTimeMillis() - dismissedAt > DISMISSED_TTL_MS) {
      prefs.edit().remove(key).apply()
      return false
    }
    return true
  }

  fun clearDismissed(context: Context, reminderId: String) {
    context.getSharedPreferences(DISMISSED_PREFS, Context.MODE_PRIVATE).edit()
      .remove(dismissedKey(reminderId))
      .apply()
  }

  fun notificationId(reminderId: String): Int {
    val hashed = reminderId.hashCode()
    return if (hashed == 0) 4310 else kotlin.math.abs(hashed)
  }

  private fun dismissedKey(reminderId: String): String =
    reminderId.ifBlank { "_empty" }
}
