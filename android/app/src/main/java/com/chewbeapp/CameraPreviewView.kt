 package dev.ingenius.chewbe

import android.annotation.SuppressLint
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.camera.view.PreviewView
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext

@SuppressLint("ViewConstructor")
class CameraPreviewView(context: ReactContext) : FrameLayout(context), LifecycleEventListener {

    private val TAG = "CameraPreviewView"
    val previewView: PreviewView = PreviewView(context)

    init {
        // Add the PreviewView to this custom FrameLayout
        previewView.layoutParams = LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        addView(previewView)
        context.addLifecycleEventListener(this)
        Log.d(TAG, "CameraPreviewView initialized")
    }

    // React Native lifecycle events
    override fun onHostResume() {
        Log.d(TAG, "onHostResume - informing module")
        // No need to explicitly start camera here, module will handle binding
    }

    override fun onHostPause() {
        Log.d(TAG, "onHostPause - informing module")
        // No need to explicitly stop camera here, module will handle unbinding
    }

    override fun onHostDestroy() {
        Log.d(TAG, "onHostDestroy - informing module")
        // Clean up lifecycle listener
        (context as ReactContext).removeLifecycleEventListener(this)
        // ChewDetectionModule will handle camera shutdown
    }
}