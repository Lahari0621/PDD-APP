package com.pddapp.config;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.time.Duration;

/**
 * AppiumConfig – central driver factory.
 *
 * Capabilities assume:
 *   • Appium Server 2.x running on localhost:4723
 *   • Android emulator / device with the PDD web app open in Chrome
 *     (or the packaged PWA/WebView app)
 *
 * For a web app tested via Chrome on Android, set the chromedriver
 * path in APPIUM_HOME or pass it via the capability below.
 */
public class AppiumConfig {

    private static final Logger log = LoggerFactory.getLogger(AppiumConfig.class);

    // ── Read from system properties / env so CI can override ──
    public static final String APPIUM_URL   = System.getProperty("appium.url",   "http://localhost:4723");
    public static final String DEVICE_NAME  = System.getProperty("device.name",  "emulator-5554");
    public static final String PLATFORM_VER = System.getProperty("platform.ver", "13.0");
    public static final String APP_URL      = System.getProperty("app.url",
            "http://10.0.2.2:5173"); // 10.0.2.2 = host machine from Android emulator

    /** Default implicit wait (seconds). */
    public static final int IMPLICIT_WAIT = 10;
    /** Default explicit wait (seconds). */
    public static final int EXPLICIT_WAIT = 20;
    /** Default page-load timeout (seconds). */
    public static final int PAGE_LOAD_TIMEOUT = 30;

    /**
     * Build and return a ready-to-use AndroidDriver pointing at Chrome
     * so the web app can be driven exactly like Selenium but on a real
     * Android device / emulator.
     */
    public static AndroidDriver createAndroidDriver() throws Exception {
        UiAutomator2Options options = new UiAutomator2Options()
                .setDeviceName(DEVICE_NAME)
                .setPlatformVersion(PLATFORM_VER)
                .setAutomationName("UiAutomator2")
                // Drive the app through Chrome browser (web app)
                .withBrowserName("Chrome")
                .setChromedriverExecutableDir(
                        System.getProperty("chromedriver.dir", "/usr/local/bin"))
                .setNoReset(false)
                .setNewCommandTimeout(Duration.ofSeconds(120));

        log.info("Connecting to Appium at {} with device '{}'", APPIUM_URL, DEVICE_NAME);
        AndroidDriver driver = new AndroidDriver(new URL(APPIUM_URL + "/wd/hub"), options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(IMPLICIT_WAIT));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(PAGE_LOAD_TIMEOUT));
        return driver;
    }
}
