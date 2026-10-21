package com.aiassistantapp.callsync

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class CallSyncBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == Intent.ACTION_BOOT_COMPLETED &&
      CallSyncStore(context).getWhitelist().isNotEmpty()) {
      CallSyncScheduler.enqueue(context.applicationContext, delaySeconds = 15)
    }
  }
}
