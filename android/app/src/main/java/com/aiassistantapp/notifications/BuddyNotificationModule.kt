package com.aiassistantapp.notifications

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class BuddyNotificationModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  init {
    moduleContext = reactContext
  }

  override fun getName(): String = "BuddyNotifications"

  override fun getConstants(): Map<String, Any> =
    mapOf("SNOOZE_MINUTES" to ReminderAlertStore.SNOOZE_MINUTES)

  @ReactMethod
  fun addListener(eventName: String?) {
  }

  @ReactMethod
  fun removeListeners(count: Int) {
  }

  @ReactMethod
  fun ensureChannels(promise: Promise) {
    try {
      ReminderNotificationHelper.ensureChannels(reactContext)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_NOTIFICATION_CHANNEL_FAILED", error)
    }
  }

  @ReactMethod
  fun showReminder(
    title: String?,
    body: String?,
    reminderId: String?,
    type: String?,
    callId: String?,
    promise: Promise,
  ) {
    try {
      ReminderNotificationHelper.show(
        reactContext,
        title ?: "Buddy",
        body ?: "",
        reminderId,
        type,
        callId,
      )
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_NOTIFICATION_SHOW_FAILED", error)
    }
  }

  @ReactMethod
  fun stopAlert(promise: Promise) {
    try {
      val activeId = ReminderAlertStore.load(reactContext)?.reminderId.orEmpty()
      ReminderNotificationHelper.suppress(reactContext, activeId)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_NOTIFICATION_STOP_FAILED", error)
    }
  }

  @ReactMethod
  fun snoozeAlert(
    reminderId: String?,
    title: String?,
    message: String?,
    type: String?,
    minutes: Int,
    promise: Promise,
  ) {
    try {
      val alert = ReminderAlertStore.Alert(
        reminderId = reminderId.orEmpty(),
        title = title ?: "Buddy",
        message = message.orEmpty(),
        type = type ?: ReminderAlertStore.TYPE_ALARM,
        action = ReminderAlertStore.ACTION_SNOOZE,
        callId = "",
        autoAnswer = false,
      )
      ReminderAlertStore.clearDismissed(reactContext, alert.reminderId)
      ReminderAlertService.stop(reactContext)
      ReminderNotificationHelper.dismiss(reactContext, alert.reminderId)
      ReminderNotificationHelper.scheduleSnooze(
        reactContext,
        alert,
        if (minutes > 0) minutes else ReminderAlertStore.SNOOZE_MINUTES,
      )
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_NOTIFICATION_SNOOZE_FAILED", error)
    }
  }

  @ReactMethod
  fun getPendingAlert(promise: Promise) {
    try {
      val pending = ReminderAlertStore.load(reactContext)
      if (pending == null) {
        promise.resolve(null)
        return
      }
      ReminderAlertStore.clear(reactContext)
      promise.resolve(pending.toWritableMap())
    } catch (error: Exception) {
      promise.reject("BUDDY_NOTIFICATION_PENDING_FAILED", error)
    }
  }

  @ReactMethod
  fun clearPendingAlert(promise: Promise) {
    try {
      ReminderAlertStore.clear(reactContext)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_NOTIFICATION_CLEAR_FAILED", error)
    }
  }

  companion object {
    @Volatile
    private var moduleContext: ReactApplicationContext? = null

    fun emitAlert(alert: ReminderAlertStore.Alert) {
      val context = moduleContext ?: return
      val dismissOnly =
        alert.action == ReminderAlertStore.ACTION_REJECT ||
          alert.action == ReminderAlertStore.ACTION_STOP
      if (dismissOnly) {
        ReminderAlertStore.clear(context)
      }
      if (!context.hasActiveReactInstance()) {
        if (!dismissOnly) {
          ReminderAlertStore.save(context, alert)
        }
        return
      }
      try {
        context
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("BuddyReminderAlert", alert.toWritableMap())
      } catch (_: Exception) {
        if (!dismissOnly) {
          ReminderAlertStore.save(context, alert)
        }
      }
    }
  }
}
