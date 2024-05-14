package com.foodmlkit

import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.io.IOException

class TextDetectionModule internal constructor(context: ReactApplicationContext?) : ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "TextDetectionModule"
    }

    @ReactMethod
    fun recognizeImage(url: String, promise: Promise) {
        Log.d("TextRecognitionModule", "Url: $url")
        val uri = Uri.parse(url)
        val image: InputImage
        try {
            image = InputImage.fromFilePath(reactApplicationContext, uri)
            // When using Latin script library
            val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
            recognizer.process(image)
                    .addOnSuccessListener { result ->
                        val response = Arguments.createMap()
                        val blocks = Arguments.createArray()
                        for (block in result.textBlocks) {
                            val blockObject = Arguments.createMap()
                            blockObject.putString("text", block.text)
                            blocks.pushMap(blockObject)
                        }
                        response.putArray("blocks", blocks)
                        promise.resolve(response)
                    }
                    .addOnFailureListener { e -> promise.reject("Create Event Error", e) }
        } catch (e: IOException) {
            e.printStackTrace()
        }
    }
}