import Foundation
import AVFoundation

@objc(PrecisionAudioModule)
class PrecisionAudioModule: RCTEventEmitter {
  
  private var audioEngine: AVAudioEngine?
  private var outputFile: AVAudioFile?
  private var hasListeners = false
  private var lastMeteringTime: TimeInterval = 0

  override static func requiresMainQueueSetup() -> Bool { return false }

  override func supportedEvents() -> [String]! {
    return ["PrecisionAudioMetering"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc
  func startRecording(_ gainMultiplier: Float, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let audioSession = AVAudioSession.sharedInstance()
    do {
      // Set mode to .measurement to disable system background speech cancellation
      try audioSession.setCategory(.record, mode: .measurement, options: [.allowBluetooth])
      try audioSession.setActive(true)

      audioEngine = AVAudioEngine()
      guard let audioEngine = audioEngine else {
        reject("INIT_FAIL", "Could not create AVAudioEngine", nil)
        return
      }

      let inputNode = audioEngine.inputNode
      let inputFormat = inputNode.outputFormat(forBus: 0)
      
      let filePath = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        .appendingPathComponent("buddy_precision_\(Int(Date().timeIntervalSince1970 * 1000)).wav")
      outputFile = try AVAudioFile(
        forWriting: filePath,
        settings: inputFormat.settings,
        commonFormat: inputFormat.commonFormat,
        interleaved: inputFormat.isInterleaved
      )

      // Install tap to apply digital gain boost directly on PCM buffers
      inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { (buffer, time) in
        let frameLength = Int(buffer.frameLength)
        var sum: Double = 0

        if let channels = buffer.floatChannelData {
          for channelIndex in 0..<Int(buffer.format.channelCount) {
            let channelData = channels[channelIndex]
            for i in 0..<frameLength {
              let originalSample = channelData[i]
              sum += Double(originalSample * originalSample)
              channelData[i] = max(-1.0, min(1.0, originalSample * gainMultiplier))
            }
          }
        }

        try? self.outputFile?.write(from: buffer)

        let now = Date().timeIntervalSince1970
        if self.hasListeners && now - self.lastMeteringTime >= 0.1 {
          let sampleCount = max(1, frameLength * Int(buffer.format.channelCount))
          let rms = max(sqrt(sum / Double(sampleCount)), 0.0000001)
          let metering = max(-160.0, min(0.0, 20.0 * log10(rms)))
          self.sendEvent(withName: "PrecisionAudioMetering", body: ["metering": metering])
          self.lastMeteringTime = now
        }
      }

      audioEngine.prepare()
      try audioEngine.start()
      resolve(filePath.path)
    } catch {
      reject("RECORDING_ERROR", error.localizedDescription, error)
    }
  }

  @objc
  func stopRecording(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    audioEngine?.inputNode.removeTap(onBus: 0)
    audioEngine?.stop()
    audioEngine = nil
    outputFile = nil
    try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    resolve(true)
  }
}
