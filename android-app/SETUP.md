# AI Debate Partner — Android App Setup Guide

## ✅ Build Status: WORKING
- APK builds successfully
- Tested on real Android device
- Backend connectivity confirmed

---

## Quick Start

### Option A — Android Studio (Recommended)

1. Open **Android Studio**
2. **File → Open** → select `ai-debate-partner/android-app/`
3. Android Studio will auto-detect `local.properties`
4. Wait for Gradle sync to complete
5. Click **Run ▶** to build and install

> **If you see "SDK location not found":**
> Android Studio → File → Project Structure → SDK Location
> Set it to: `C:\Users\YOUR_NAME\AppData\Local\Android\Sdk`
> This auto-updates `local.properties`

---

### Option B — Command Line

```bat
cd ai-debate-partner\android-app
build.bat
```

The `build.bat` script automatically sets `JAVA_HOME` and `ANDROID_HOME`.

---

## local.properties

This file tells Gradle where your Android SDK is. It uses **forward slashes**:

```properties
sdk.dir=C:/Users/YOUR_NAME/AppData/Local/Android/Sdk
```

**Common SDK locations:**
| OS | Path |
|----|------|
| Windows | `C:/Users/YOUR_NAME/AppData/Local/Android/Sdk` |
| Mac | `/Users/YOUR_NAME/Library/Android/sdk` |
| Linux | `/home/YOUR_NAME/Android/Sdk` |

---

## Backend Connection

### For Android Emulator:
```kotlin
// app/build.gradle.kts — already set:
buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:5000/api/\"")
```

### For Real Physical Device:
```kotlin
// Change to your PC's local IP:
buildConfigField("String", "BASE_URL", "\"http://172.23.18.210:5000/api/\"")
```

Find your PC IP: run `ipconfig` → look for IPv4 Address

**Start the backend first:**
```bash
cd ai-debate-partner/backend
node server.js
```

---

## Gradle Requirements

| Component | Version |
|-----------|---------|
| AGP | 8.7.3 |
| Gradle | 8.9 |
| Kotlin | 2.0.21 |
| KSP | 2.0.21-1.0.25 |
| compileSdk | 35 |
| minSdk | 26 (Android 8.0+) |
| Java | 17+ (Android Studio JBR) |

---

## Troubleshooting

### "SDK location not found"
→ Open Android Studio → File → Project Structure → SDK Location → set path
→ OR manually edit `local.properties`:
```
sdk.dir=C:/Users/YOUR_NAME/AppData/Local/Android/Sdk
```

### "Minimum supported Gradle version is 8.9"
→ Already fixed in `gradle/wrapper/gradle-wrapper.properties`

### "JVM GC thrashing / out of memory"
→ Already fixed in `gradle.properties` with `-Xmx4096m`

### "Cannot connect to server" on device
→ Make sure backend is running: `node server.js`
→ Check your PC's firewall allows port 5000
→ Update `BASE_URL` in `app/build.gradle.kts` with your PC's IP

### Gradle sync fails in Android Studio
→ File → Invalidate Caches → Restart
→ Then File → Sync Project with Gradle Files

---

## APK Location

After successful build:
```
app/build/outputs/apk/debug/app-debug.apk
```

Install manually:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
