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
