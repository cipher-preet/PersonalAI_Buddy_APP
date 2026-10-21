package com.aiassistantapp.callsync

import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.Executors

class CallSyncBridgeModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val executor = Executors.newSingleThreadExecutor()
  private val store by lazy { CallSyncStore(context) }
  override fun getName() = "CallSyncBridge"

  @ReactMethod fun setActiveUser(userId: String?, promise: Promise) = executor.execute {
    try { store.setActiveUser(userId); promise.resolve(true) } catch (error: Exception) { promise.reject("CALL_SYNC_USER_FAILED", error) }
  }

  @ReactMethod fun getWhitelistedNumbers(promise: Promise) = executor.execute {
    try { promise.resolve(Arguments.fromList(store.getWhitelist())) } catch (error: Exception) { promise.reject("CALL_SYNC_READ_FAILED", error) }
  }

  @ReactMethod fun addNumberToWhitelist(number: String, promise: Promise) = executor.execute {
    try { promise.resolve(store.addNumber(number)) } catch (error: Exception) { promise.reject("CALL_SYNC_ADD_FAILED", error) }
  }

  @ReactMethod fun removeNumberFromWhitelist(number: String, promise: Promise) = executor.execute {
    try { promise.resolve(store.removeNumber(number)) } catch (error: Exception) { promise.reject("CALL_SYNC_REMOVE_FAILED", error) }
  }

  @ReactMethod fun triggerManualSync(promise: Promise) = executor.execute {
    try {
      val result = CallAudioScannerWorker.scanAndUpload(context)
      if (result.retryableFailure || result.recordingPending) {
        CallSyncScheduler.enqueue(context.applicationContext, delaySeconds = 30)
      }
      if (result.errorCode == "UPLOAD_NOT_CONFIGURED") {
        promise.reject("CALL_SYNC_NOT_CONFIGURED", "Call recording upload URL is not configured")
      } else if (result.errorCode == "PERMISSION_MISSING") {
        promise.reject("CALL_SYNC_PERMISSION_MISSING", "Required call sync permissions are missing")
      } else {
        promise.resolve(Arguments.createMap().apply {
          putInt("scanned", result.scanned); putInt("uploaded", result.uploaded); putInt("failed", result.failed)
          putBoolean("recordingPending", result.recordingPending); putString("errorCode", result.errorCode)
        })
      }
    } catch (error: Exception) { promise.reject("CALL_SYNC_MANUAL_FAILED", error) }
  }

  @ReactMethod fun checkOemCompatibility(promise: Promise) {
    val manufacturer = Build.MANUFACTURER.orEmpty()
    val supported = listOf("samsung", "xiaomi", "redmi", "poco", "oppo", "vivo", "oneplus", "realme").any { manufacturer.lowercase().contains(it) }
    promise.resolve(Arguments.createMap().apply { putBoolean("isSupported", supported); putString("manufacturer", manufacturer); putBoolean("isConfigured", AudioUploader.isConfigured()) })
  }

  override fun invalidate() { executor.shutdown(); super.invalidate() }
}
