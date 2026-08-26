package com.pddapp.utils;

import com.pddapp.config.AppiumConfig;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Centralised wait helpers so test classes stay readable.
 */
public class WaitUtils {

    private final AndroidDriver driver;
    private final WebDriverWait defaultWait;
    private final WebDriverWait longWait;

    public WaitUtils(AndroidDriver driver) {
        this.driver      = driver;
        this.defaultWait = new WebDriverWait(driver, Duration.ofSeconds(AppiumConfig.EXPLICIT_WAIT));
        this.longWait    = new WebDriverWait(driver, Duration.ofSeconds(60)); // for AI responses
    }

    /** Wait until element is visible and return it. */
    public WebElement forVisible(By locator) {
        return defaultWait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    /** Wait until element is clickable and return it. */
    public WebElement forClickable(By locator) {
        return defaultWait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    /** Wait until element disappears (for loading spinners etc.). */
    public boolean forInvisible(By locator) {
        try {
            return defaultWait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
        } catch (Exception e) {
            return true; // already gone
        }
    }

    /** Quick check — is the element currently visible (no wait)? */
    public boolean isVisible(By locator) {
        try {
            return driver.findElement(locator).isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    /** Wait (up to 60 s) for element visible — used for AI response waits. */
    public WebElement forVisibleLong(By locator) {
        return longWait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    /** Wait until current URL does NOT contain the given fragment. */
    public boolean forUrlNotContaining(String urlFragment) {
        return defaultWait.until(driver -> !driver.getCurrentUrl().contains(urlFragment));
    }

    /** Wait until current URL contains the given fragment. */
    public boolean forUrlContaining(String urlFragment) {
        return defaultWait.until(driver -> driver.getCurrentUrl().contains(urlFragment));
    }

    /** Pause for a fixed number of milliseconds (use sparingly). */
    public void sleep(long millis) {
        try { Thread.sleep(millis); } catch (InterruptedException ignored) {}
    }
}
