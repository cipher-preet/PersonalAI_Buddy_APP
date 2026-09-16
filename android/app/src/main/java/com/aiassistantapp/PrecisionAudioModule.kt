package com.aiassistantapp

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.audiofx.AutomaticGainControl
import android.media.audiofx.NoiseSuppressor
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.RandomAccessFile
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.log10
import kotlin.math.sqrt

class PrecisionAudioModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val SAMPLE_RATE = 16000
        private const val CHANNEL_COUNT = 1
        private const val BITS_PER_SAMPLE = 16
        private const val WAV_HEADER_SIZE = 44
        private const val METERING_INTERVAL_MS = 100L
    }

    private var audioRecord: AudioRecord? = null
    @Volatile private var isRecording = false
    private var recordingThread: Thread? = null

    override fun getName(): String = "PrecisionAudioModule"

    @ReactMethod
    fun startRecording(gainMultiplier: Float, promise: Promise) {
        if (isRecording) {
            promise.reject("RECORDING_ERROR", "Recording already in progress")
            return
        }

        val minimumBufferSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
        )
        if (minimumBufferSize <= 0) {
            promise.reject("RECORDING_INIT_FAILED", "Unable to determine an audio buffer size")
            return
        }

        try {
            val recorder = AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                minimumBufferSize * 2,
            )
            if (recorder.state != AudioRecord.STATE_INITIALIZED) {
                recorder.release()
                promise.reject("RECORDING_INIT_FAILED", "AudioRecord could not be initialized")
                return
            }

            audioRecord = recorder
            val sessionId = recorder.audioSessionId
            if (AutomaticGainControl.isAvailable()) {
                AutomaticGainControl.create(sessionId)?.enabled = true
            }
            if (NoiseSuppressor.isAvailable()) {
                NoiseSuppressor.create(sessionId)?.enabled = false
            }

            val outputFile = File(
                reactApplicationContext.cacheDir,
                "buddy_precision_${System.currentTimeMillis()}.wav",
            )
            recorder.startRecording()
            isRecording = true
            recordingThread = Thread(
                { processAndSaveAudio(outputFile, minimumBufferSize, gainMultiplier.coerceAtLeast(0f)) },
                "PrecisionAudioRecorder",
            ).apply { start() }

            promise.resolve(outputFile.absolutePath)
        } catch (error: Exception) {
            isRecording = false
            audioRecord?.release()
            audioRecord = null
            promise.reject("RECORDING_INIT_FAILED", error.message, error)
        }
    }

    private fun processAndSaveAudio(outputFile: File, bufferSize: Int, baseGain: Float) {
        val buffer = ShortArray(bufferSize / 2)
        var dataSize = 0L
        var lastMeteringAt = 0L

        RandomAccessFile(outputFile, "rw").use { output ->
            output.setLength(0)
            output.write(ByteArray(WAV_HEADER_SIZE))

            while (isRecording) {
                val readCount = audioRecord?.read(buffer, 0, buffer.size) ?: break
                if (readCount <= 0) continue

                var sum = 0.0
                for (index in 0 until readCount) {
                    val sample = buffer[index].toDouble()
                    sum += sample * sample
                }
                val rms = sqrt(sum / readCount).coerceAtLeast(1.0)
                val meteringDb = (20.0 * log10(rms / Short.MAX_VALUE)).coerceIn(-160.0, 0.0)
                val dynamicMultiplier = if (rms < 300.0) baseGain * 2.5f else baseGain

                val byteBuffer = ByteBuffer.allocate(readCount * 2).order(ByteOrder.LITTLE_ENDIAN)
                for (index in 0 until readCount) {
                    val boosted = (buffer[index] * dynamicMultiplier).toInt()
                    byteBuffer.putShort(
                        boosted.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort(),
                    )
                }
                output.write(byteBuffer.array())
                dataSize += readCount * 2L

                val now = System.currentTimeMillis()
                if (now - lastMeteringAt >= METERING_INTERVAL_MS) {
                    emitMetering(meteringDb)
                    lastMeteringAt = now
                }
            }

            output.seek(0)
            output.write(createWavHeader(dataSize))
        }
    }

    private fun createWavHeader(dataSize: Long): ByteArray =
        ByteBuffer.allocate(WAV_HEADER_SIZE).order(ByteOrder.LITTLE_ENDIAN).apply {
            put("RIFF".toByteArray(Charsets.US_ASCII))
            putInt((36L + dataSize).coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
            put("WAVE".toByteArray(Charsets.US_ASCII))
            put("fmt ".toByteArray(Charsets.US_ASCII))
            putInt(16)
            putShort(1.toShort())
            putShort(CHANNEL_COUNT.toShort())
            putInt(SAMPLE_RATE)
            putInt(SAMPLE_RATE * CHANNEL_COUNT * BITS_PER_SAMPLE / 8)
            putShort((CHANNEL_COUNT * BITS_PER_SAMPLE / 8).toShort())
            putShort(BITS_PER_SAMPLE.toShort())
            put("data".toByteArray(Charsets.US_ASCII))
            putInt(dataSize.coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
        }.array()

    private fun emitMetering(meteringDb: Double) {
        val payload = Arguments.createMap().apply { putDouble("metering", meteringDb) }
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("PrecisionAudioMetering", payload)
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        if (!isRecording) {
            promise.reject("RECORDING_ERROR", "Not currently recording")
            return
        }

        isRecording = false
        try {
            audioRecord?.stop()
        } catch (_: IllegalStateException) {
            // The recorder may have already stopped after an OS audio interruption.
        }
        recordingThread?.join(2000)
        audioRecord?.release()
        audioRecord = null
        recordingThread = null
        promise.resolve(true)
    }

    @ReactMethod
    fun addListener(eventName: String) = Unit

    @ReactMethod
    fun removeListeners(count: Int) = Unit
}
