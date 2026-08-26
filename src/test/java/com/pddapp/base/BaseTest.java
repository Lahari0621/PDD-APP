package com.pddapp.base;

import com.pddapp.config.AppiumConfig;
import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;

import java.lang.reflect.Method;

/**
 * BaseTest – every test class extends this.
 *
 * Lifecycle:
 *   BeforeSuite  → nothing (extent report listener handles it)
 *   BeforeMethod → create fresh driver, open app URL
 *   AfterMethod  → quit driver
 *   AfterSuite   → flush extent report
 */
public class BaseTest {

    protected static final Logger log = LoggerFactory.getLogger(BaseTest.class);

    // Thread-local so parallel tests don't share a driver
    private static final ThreadLocal<AndroidDriver> driverHolder = new ThreadLocal<>();
    protected WaitUtils wait;

    // ── Credentials used across tests ─────────────────────────
    protected static final String TEST_EMAIL    = System.getProperty("test.email",    "testuser@pddapp.com");
    protected static final String TEST_PASSWORD = System.getProperty("test.password", "Test@1234");
    protected static final String TEST_USERNAME = System.getProperty("test.username", "pdd_tester");

    @BeforeSuite(alwaysRun = true)
    public void suiteSetup() {
        log.info("===== PDD App Appium Suite Starting =====");
    }

    @BeforeMethod(alwaysRun = true)
    public void methodSetup(Method method) {
        log.info("--- Starting test: {} ---", method.getName());
        try {
            AndroidDriver driver = AppiumConfig.createAndroidDriver();
            driverHolder.set(driver);
            wait = new WaitUtils(driver);
            // Navigate to the web app
            driver.get(AppiumConfig.APP_URL);
            log.info("Navigated to {}", AppiumConfig.APP_URL);
        } catch (Exception e) {
            log.error("Driver setup failed: {}", e.getMessage(), e);
            throw new RuntimeException("Appium driver could not be initialised", e);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void methodTeardown(ITestResult result) {
        log.info("--- Finished test: {} — {} ---",
                result.getMethod().getMethodName(),
                result.isSuccess() ? "PASSED" : "FAILED");
        AndroidDriver driver = getDriver();
        if (driver != null) {
            try { driver.quit(); } catch (Exception ignored) {}
            driverHolder.remove();
        }
    }

    @AfterSuite(alwaysRun = true)
    public void suiteTeardown() {
        log.info("===== PDD App Appium Suite Finished =====");
    }

    /** Return the driver for the current thread. */
    public static AndroidDriver getDriver() {
        return driverHolder.get();
    }
}
