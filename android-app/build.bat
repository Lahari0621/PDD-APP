@echo off
REM ============================================================
REM  AI Debate Partner - Android Build Script
REM  Run this from the android-app directory
REM ============================================================

REM Set Java from Android Studio JBR
SET "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
SET "ANDROID_HOME=C:\Users\chara\AppData\Local\Android\Sdk"
SET "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo ============================================================
echo  AI Debate Partner Android Build
echo ============================================================
echo  JAVA_HOME  : %JAVA_HOME%
echo  ANDROID_HOME: %ANDROID_HOME%
echo ============================================================
echo.

REM Verify Java
IF NOT EXIST "%JAVA_HOME%\bin\java.exe" (
    echo ERROR: Java not found at %JAVA_HOME%
    echo Please update JAVA_HOME in this script
    pause
    exit /b 1
)

REM Verify SDK
IF NOT EXIST "%ANDROID_HOME%\platforms" (
    echo ERROR: Android SDK not found at %ANDROID_HOME%
    echo Please update ANDROID_HOME in this script
    pause
    exit /b 1
)

"%JAVA_HOME%\bin\java.exe" -version
echo.

REM Run Gradle
echo Building debug APK...
call gradlew.bat assembleDebug %*

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo  BUILD SUCCESSFUL
    echo  APK: app\build\outputs\apk\debug\app-debug.apk
    echo ============================================================
) ELSE (
    echo.
    echo ============================================================
    echo  BUILD FAILED - Check errors above
    echo ============================================================
)
