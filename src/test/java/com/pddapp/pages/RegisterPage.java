package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Page Object for the Register screen (/register).
 */
public class RegisterPage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    private final By usernameInput  = By.cssSelector("input[name='username'], input[placeholder*='username' i]");
    private final By emailInput     = By.cssSelector("input[type='email'], input[name='email']");
    private final By passwordInput  = By.cssSelector("input[type='password'][name='password'], input[placeholder*='password' i]:not([placeholder*='confirm' i])");
    private final By confirmPwdInput= By.cssSelector("input[name='confirmPassword'], input[placeholder*='confirm' i]");
    private final By registerButton = By.cssSelector("button[type='submit']");
    private final By errorMessage   = By.cssSelector(".text-error, [class*='error']");
    private final By loginLink      = By.cssSelector("a[href='/login'], a[href*='login']");

    public RegisterPage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/register");
    }

    public void enterUsername(String username) {
        WebElement el = wait.forVisible(usernameInput);
        el.clear(); el.sendKeys(username);
    }

    public void enterEmail(String email) {
        WebElement el = wait.forVisible(emailInput);
        el.clear(); el.sendKeys(email);
    }

    public void enterPassword(String password) {
        WebElement el = wait.forVisible(passwordInput);
        el.clear(); el.sendKeys(password);
    }

    public void enterConfirmPassword(String password) {
        WebElement el = wait.forVisible(confirmPwdInput);
        el.clear(); el.sendKeys(password);
    }

    public void clickRegister() {
        wait.forClickable(registerButton).click();
    }

    public void register(String username, String email, String password) {
        enterUsername(username);
        enterEmail(email);
        enterPassword(password);
        enterConfirmPassword(password);
        clickRegister();
    }

    public boolean hasErrorMessage() { return wait.isVisible(errorMessage); }
    public String  getErrorMessage() { return wait.forVisible(errorMessage).getText(); }

    public void clickLogin() { wait.forClickable(loginLink).click(); }

    public boolean registrationSucceeded() {
        return wait.forUrlNotContaining("/register");
    }
}
