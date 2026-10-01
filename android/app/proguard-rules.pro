# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Voice listening uses a custom React Native bridge plus Nitro hybrid objects.
# Release minification can otherwise strip/rename classes resolved from JS/JNI.
-keep class com.aiassistantapp.voice.** { *; }
-keep class com.margelo.nitro.** { *; }
-keep class com.margelo.nitro.audiorecorderplayer.** { *; }
-keep class com.facebook.proguard.annotations.DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class * { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# React Native core / Hermes / JNI entry points.
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Reanimated + Worklets (resolved from native C++).
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# Razorpay checkout (required by Razorpay docs; payment screen crashes without it).
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** { *; }
-optimizations !method/inlining/*
-keepclasseswithmembers class * {
    public void onPayment*(...);
}

# Keep readable stack traces in crash reports.
-keepattributes SourceFile,LineNumberTable
