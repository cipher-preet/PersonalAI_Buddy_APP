package com.aiassistantapp.callsync

import android.content.Context
import android.net.Uri
import android.provider.Settings
import com.aiassistantapp.BuildConfig
import java.io.BufferedOutputStream
import java.net.HttpURLConnection
import java.net.URL

object AudioUploader {
  data class UploadResult(val successful: Boolean, val remoteUrl: String? = null, val retryable: Boolean = true)

  fun isConfigured() = BuildConfig.CALL_SYNC_UPLOAD_URL.isNotBlank()

  fun upload(context: Context, uri: Uri, fileName: String, mimeType: String, phoneNumber: String, callTimestamp: Long, phoneAccountId: String?): UploadResult {
    if (BuildConfig.CALL_SYNC_UPLOAD_URL.isBlank()) return UploadResult(false, retryable = false)
    val boundary = "BuddyCallSync${System.currentTimeMillis()}"
    val connection = (URL(BuildConfig.CALL_SYNC_UPLOAD_URL).openConnection() as HttpURLConnection).apply {
      requestMethod = "POST"
      connectTimeout = 20_000
      readTimeout = 60_000
      doOutput = true
      setChunkedStreamingMode(256 * 1024)
      setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
      setRequestProperty("Accept", "application/json")
      setRequestProperty("x-phone-number", phoneNumber)
      setRequestProperty("x-call-timestamp", callTimestamp.toString())
      setRequestProperty("x-device-id", Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown")
      phoneAccountId?.let { setRequestProperty("x-phone-account-id", it) }
    }

    return try {
      BufferedOutputStream(connection.outputStream).use { output ->
        fun text(value: String) = output.write(value.toByteArray(Charsets.UTF_8))
        text("--$boundary\r\n")
        text("Content-Disposition: form-data; name=\"audio\"; filename=\"${fileName.replace("\"", "")}\"\r\n")
        text("Content-Type: $mimeType\r\n\r\n")
        context.contentResolver.openInputStream(uri)?.use { input -> input.copyTo(output, 256 * 1024) }
          ?: throw IllegalStateException("Recording is no longer readable")
        text("\r\n--$boundary--\r\n")
      }
      val status = connection.responseCode
      val body = (if (status in 200..299) connection.inputStream else connection.errorStream)
        ?.bufferedReader()?.use { it.readText().take(65_536) }
      val remoteUrl = body?.let { Regex("\"(?:remote_url|url)\"\\s*:\\s*\"([^\"]+)\"").find(it)?.groupValues?.get(1) }
      UploadResult(status == 200 || status == 201, remoteUrl, status == 408 || status == 429 || status >= 500)
    } finally {
      connection.disconnect()
    }
  }
}
