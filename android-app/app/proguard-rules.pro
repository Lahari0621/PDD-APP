# Add project specific ProGuard rules here.
-keep class com.aidebatepartner.app.data.model.** { *; }
-keep class com.aidebatepartner.app.domain.model.** { *; }
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn okhttp3.**
-dontwarn retrofit2.**
