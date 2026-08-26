package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Page Object for the Login screen (/login).
 */
public class LoginPage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    // ── Locators ──────────────────────────────────────────────
    private final By emailInput    = By.cssSelector("input[type='email'], input[name='email'], input[placeholder*='email' i]");
    private final By passwordInput = By.cssSelector("input[type='password']");
    private final By loginButton   = By.cssSelector("button[type='submit'], button.btn-primary");
    private final By errorMessage  = By.cssSelector(".text-error, [class*='error'], [class*='Error']");
    private final By signUpLink    = By.cssSelector("a[href='/register'], a[href*='register']");
    private final By forgotPwdLink = By.cssSelector("a[href*='forgot']");
    private final By pageHeading   = By.cssSelector("h1, h2");

    public LoginPage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/login");
    }

    public boolean isDisplayed() {
        return wait.isVisible(pageHeading) &&
               driver.findElement(pageHeading).getText().toLowerCase().contains("sign");
    }

    public void enterEmail(String email) {
        WebElement el = wait.forVisible(emailInput);
        el.clear();
        el.sendKeys(email);
    }

    public void enterPassword(String password) {
        WebElement el = wait.forVisible(passwordInput);
        el.clear();
        el.sendKeys(password);
    }

    public void clickLogin() {
        wait.forClickable(loginButton).click();
    }

    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickLogin();
    }

    public String getErrorMessage() {
        return wait.forVisible(errorMessage).getText();
    }

    public boolean hasErrorMessage() {
        return wait.isVisible(errorMessage);
    }

    public void clickSignUp() {
        wait.forClickable(signUpLink).click();
    }

    public void clickForgotPassword() {
        wait.forClickable(forgotPwdLink).click();
    }

    /** Returns true when the URL has changed away from /login (successful login). */
    public boolean loginSucceeded() {
        return wait.forUrlNotContaining("/login");
    }
}
