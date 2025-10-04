package dev.ingenius.chewbe

import android.content.Context
import android.graphics.*
import android.hardware.Camera
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream
import java.io.IOException
import android.view.SurfaceHolder
import android.view.SurfaceView
class ChewDetectionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    Camera.PreviewCallback,
    SurfaceHolder.Callback {

    private var reactContext: ReactApplicationContext = reactContext
    private var camera: Camera? = null
    private var detectionActive = false
    private var chewCount = 0
    private var surfaceHolder: SurfaceHolder? = null

    override fun getName(): String = "ChewDetectionModule"

    @ReactMethod
    fun startDetection() {
        Log.d("ChewDetection", "Starting chew detection")
        detectionActive = true
        chewCount = 0
        startCameraPreview()
    }

    @ReactMethod
    fun stopDetection() {
        Log.d("ChewDetection", "Stopping chew detection")
        detectionActive = false
        stopCameraPreview()
    }

    @ReactMethod
    fun saveChewData(videoPath: String, chewCount: Int, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("ChewData", Context.MODE_PRIVATE)
            val editor = prefs.edit()
            editor.putInt("chewCount_${System.currentTimeMillis()}", chewCount)
            editor.putString("videoPath_${System.currentTimeMillis()}", videoPath)
            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SAVE_ERROR", "Failed to save chew data: ${e.message}")
        }
    }

    @ReactMethod
    fun getChewStats(promise: Promise) {
        try {
            val result = Arguments.createMap()
            result.putInt("totalChews", chewCount)
            result.putBoolean("isDetecting", detectionActive)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("STATS_ERROR", "Failed to get chew stats: ${e.message}")
        }
    }

    private fun startCameraPreview() {
        try {
            camera = Camera.open(Camera.CameraInfo.CAMERA_FACING_FRONT)
            val params = camera?.parameters
            val previewSize = CameraConfig.getOptimalPreviewSize(params?.supportedPreviewSizes!!, 640, 480)
            params.setPreviewSize(previewSize.width, previewSize.height)
            camera?.parameters = params

            if (surfaceHolder != null) {
                camera?.setPreviewDisplay(surfaceHolder)
            }

            camera?.setPreviewCallback(this)
            camera?.startPreview()
        } catch (e: Exception) {
            Log.e("ChewDetection", "Camera start failed: ${e.message}")
            sendErrorEvent("CAMERA_ERROR", "Failed to start camera: ${e.message}")
        }
    }

    private fun stopCameraPreview() {
        try {
            camera?.setPreviewCallback(null)
            camera?.stopPreview()
            camera?.release()
            camera = null
        } catch (e: Exception) {
            Log.e("ChewDetection", "Camera stop failed: ${e.message}")
        }
    }

    override fun onPreviewFrame(data: ByteArray, camera: Camera) {
        if (!detectionActive) return

        try {
            val params = camera.parameters
            val width = params.previewSize.width
            val height = params.previewSize.height

            val yuvImage = YuvImage(data, params.previewFormat, width, height, null)
            val out = ByteArrayOutputStream()
            yuvImage.compressToJpeg(Rect(0, 0, width, height), 50, out)
            val bitmap = BitmapFactory.decodeByteArray(out.toByteArray(), 0, out.size())
            
            // Rotate for front camera
            val matrix = Matrix()
            matrix.postRotate(270f) // Front camera typically needs 270
            val rotatedBitmap = Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)

            processFrame(rotatedBitmap)

        } catch (e: Exception) {
            Log.e("ChewDetection", "Frame processing error: ${e.message}")
        }
    }

    private fun processFrame(bitmap: Bitmap) {
        // Mock chew detection logic
        val currentTime = System.currentTimeMillis()
        val detectChew = (currentTime % 2000 < 100) // Detect every 2 seconds

        if (detectChew) {
            chewCount++
            sendChewDetectedEvent(chewCount)
            Log.d("ChewDetection", "Chew detected! Total: $chewCount")
        }
    }

    private fun sendChewDetectedEvent(count: Int) {
        try {
            val params = Arguments.createMap().apply {
                putInt("chewCount", count)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onChewDetected", params)
        } catch (e: Exception) {
            Log.e("ChewDetection", "Error sending event: ${e.message}")
        }
    }

    private fun sendErrorEvent(code: String, message: String) {
        try {
            val params = Arguments.createMap().apply {
                putString("code", code)
                putString("message", message)
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onChewDetectionError", params)
        } catch (e: Exception) {
            Log.e("ChewDetection", "Error sending error event: ${e.message}")
        }
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        surfaceHolder = holder
        try {
            camera?.setPreviewDisplay(holder)
        } catch (e: IOException) {
            Log.e("ChewDetection", "Surface created error: ${e.message}")
        }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {}

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        stopDetection()
    }

    @ReactMethod
    fun addListener(eventName: String) {}
    @ReactMethod
    fun removeListeners(count: Int) {}
}

class CameraConfig {
    companion object {
        fun getOptimalPreviewSize(sizes: List<Camera.Size>, width: Int, height: Int): Camera.Size {
            val aspectTolerance = 0.1
            val targetRatio = width.toDouble() / height
            var optimalSize: Camera.Size? = null

            for (size in sizes) {
                val ratio = size.width.toDouble() / size.height
                if (Math.abs(ratio - targetRatio) > aspectTolerance) continue
                if (optimalSize == null || size.width > optimalSize.width) optimalSize = size
            }

            return optimalSize ?: sizes[0]
        }
    }
}
