package com.pddapp.utils;

import com.pddapp.base.BaseTest;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * General test utilities: screenshot capture, login helper, etc.
 */
public class TestUtils {

    private static final Logger log = LoggerFactory.getLogger(TestUtils.class);
    private static final String SCREENSHOT_DIR = "test-output/screenshots/";

    /** Capture a screenshot and return the file path. */
    public static String captureScreenshot(String testName) {
        try {
            AndroidDriver driver = BaseTest.getDriver();
            if (driver == null) return "";

            Path dir = Paths.get(SCREENSHOT_DIR);
            Files.createDirectories(dir);

            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName  = testName + "_" + timestamp + ".png";
            Path   filePath  = dir.resolve(fileName);

            File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Files.copy(screenshot.toPath(), filePath);
            log.info("Screenshot saved: {}", filePath.toAbsolutePath());
            return filePath.toAbsolutePath().toString();
        } catch (IOException e) {
            log.error("Screenshot capture failed: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Navigate to login page and perform login.
     * Shared across test classes that need an authenticated session.
     */
    public static void loginAs(AndroidDriver driver, WaitUtils wait,
                               String email, String password) {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/login");
        try {
            driver.findElement(
                org.openqa.selenium.By.cssSelector("input[type='email']")).sendKeys(email);
            driver.findElement(
                org.openqa.selenium.By.cssSelector("input[type='password']")).sendKeys(password);
            driver.findElement(
                org.openqa.selenium.By.cssSelector("button[type='submit']")).click();
            // Wait for redirect away from /login
            wait.forUrlNotContaining("/login");
            log.info("Logged in as {}", email);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            throw new RuntimeException("Could not log in as " + email, e);
        }
    }

    /** Generate a unique email for registration tests. */
    public static String uniqueEmail() {
        return "test_" + System.currentTimeMillis() + "@pddapp.com";
    }

    /** Generate a unique username for registration tests. */
    public static String uniqueUsername() {
        return "user_" + System.currentTimeMillis();
    }
}
