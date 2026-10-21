package com.aiassistantapp.callsync

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import java.util.concurrent.TimeUnit

object CallSyncScheduler {
  fun enqueue(context: Context, callEndedAt: Long = System.currentTimeMillis(), delaySeconds: Long = 4) {
    val userId = CallSyncStore(context).activeUserId() ?: return
    val request = OneTimeWorkRequestBuilder<CallAudioScannerWorker>()
      .setInitialDelay(delaySeconds, TimeUnit.SECONDS)
      .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
      .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
      .setInputData(workDataOf(CallAudioScannerWorker.KEY_CALL_ENDED_AT to callEndedAt, CallAudioScannerWorker.KEY_USER_ID to userId))
      .build()
    WorkManager.getInstance(context).enqueueUniqueWork("call-sync-$callEndedAt", ExistingWorkPolicy.KEEP, request)
  }
}
