package com.aiassistantapp.voice

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BuddyListeningModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "BuddyListeningService"

  @ReactMethod
  fun start(title: String?, message: String?, promise: Promise) {
    try {
      val intent = Intent(reactContext, BuddyListeningForegroundService::class.java).apply {
        putExtra(BuddyListeningForegroundService.EXTRA_TITLE, title)
        putExtra(BuddyListeningForegroundService.EXTRA_MESSAGE, message)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(intent)
      } else {
        reactContext.startService(intent)
      }

      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_LISTENING_SERVICE_START_FAILED", error)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      val intent = Intent(reactContext, BuddyListeningForegroundService::class.java)
      reactContext.stopService(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("BUDDY_LISTENING_SERVICE_STOP_FAILED", error)
    }
  }
}
