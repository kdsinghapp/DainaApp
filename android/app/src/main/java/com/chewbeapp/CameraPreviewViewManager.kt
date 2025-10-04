 package dev.ingenius.chewbe

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import android.util.Log

class CameraPreviewViewManager : SimpleViewManager<CameraPreviewView>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): CameraPreviewView {
        Log.d("CameraPreviewViewMgr", "Creating CameraPreviewView instance")
        return CameraPreviewView(reactContext)
    }

    // You can add custom props here if needed, e.g., to control camera facing
    // @ReactProp(name = "cameraFacing")
    // fun setCameraFacing(view: CameraPreviewView, facing: String?) {
    //     // Implement logic to tell ChewDetectionModule which camera to use
    // }

    companion object {
        const val REACT_CLASS = "CameraPreviewView"
    }
}