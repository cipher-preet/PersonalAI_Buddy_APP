package com.aiassistantapp.callsync

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager

class CallStateReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return
    val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
    val prefs = context.getSharedPreferences("call_sync_state", Context.MODE_PRIVATE)
    val previous = prefs.getString("phone_state", null)
    prefs.edit().putString("phone_state", state).apply()
    if (state == TelephonyManager.EXTRA_STATE_IDLE && previous == TelephonyManager.EXTRA_STATE_OFFHOOK) {
      CallSyncScheduler.enqueue(context.applicationContext)
    }
  }
}
