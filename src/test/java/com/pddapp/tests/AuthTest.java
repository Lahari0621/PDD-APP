package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.LoginPage;
import com.pddapp.pages.RegisterPage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Authentication Tests – covers login, registration, validation, logout.
 */
public class AuthTest extends BaseTest {

    private LoginPage    loginPage;
    private RegisterPage registerPage;

    @BeforeMethod
    public void pageSetup() {
        loginPage    = new LoginPage(getDriver(), wait);
        registerPage = new RegisterPage(getDriver(), wait);
    }

    // ── Login Tests ───────────────────────────────────────────

    @Test(description = "Login page is accessible and renders correctly")
    public void testLoginPageLoads() {
        loginPage.navigateTo();
        Assert.assertTrue(loginPage.isDisplayed(),
                "Login page should be visible with heading");
    }

    @Test(description = "Successful login with valid credentials redirects to app")
    public void testSuccessfulLogin() {
        loginPage.navigateTo();
        loginPage.login(TEST_EMAIL, TEST_PASSWORD);
        Assert.assertTrue(loginPage.loginSucceeded(),
                "URL should leave /login after valid credentials");
    }

    @Test(description = "Login with wrong password shows error message")
    public void testLoginWithWrongPassword() {
        loginPage.navigateTo();
        loginPage.login(TEST_EMAIL, "WrongPassword999!");
        Assert.assertTrue(loginPage.hasErrorMessage(),
                "Error message should appear for wrong password");
    }

    @Test(description = "Login with empty email shows validation error")
    public void testLoginWithEmptyEmail() {
        loginPage.navigateTo();
        loginPage.login("", TEST_PASSWORD);
        Assert.assertTrue(loginPage.hasErrorMessage(),
                "Validation error should appear for empty email");
    }

    @Test(description = "Login with invalid email format shows validation error")
    public void testLoginWithInvalidEmailFormat() {
        loginPage.navigateTo();
        loginPage.login("notanemail", TEST_PASSWORD);
        Assert.assertTrue(loginPage.hasErrorMessage(),
                "Error should appear for malformed email");
    }

    @Test(description = "Login with empty password shows validation error")
    public void testLoginWithEmptyPassword() {
        loginPage.navigateTo();
        loginPage.login(TEST_EMAIL, "");
        Assert.assertTrue(loginPage.hasErrorMessage(),
                "Validation error should appear for empty password");
    }

    @Test(description = "Login page has a Sign Up link that navigates to /register")
    public void testLoginPageHasSignUpLink() {
        loginPage.navigateTo();
        loginPage.clickSignUp();
        Assert.assertTrue(wait.forUrlContaining("/register"),
                "Should navigate to /register after clicking Sign Up");
    }

    @Test(description = "Login page has a Forgot Password link")
    public void testLoginPageHasForgotPasswordLink() {
        loginPage.navigateTo();
        loginPage.clickForgotPassword();
        Assert.assertTrue(wait.forUrlContaining("forgot"),
                "Should navigate to forgot-password page");
    }

    @Test(description = "Login with non-existent email shows error")
    public void testLoginWithNonExistentEmail() {
        loginPage.navigateTo();
        loginPage.login("nonexistent_" + System.currentTimeMillis() + "@pddapp.com", TEST_PASSWORD);
        Assert.assertTrue(loginPage.hasErrorMessage(),
                "Error should appear for unknown email");
    }

    // ── Registration Tests ────────────────────────────────────

    @Test(description = "Registration page is accessible and renders correctly")
    public void testRegisterPageLoads() {
        registerPage.navigateTo();
        Assert.assertTrue(
            getDriver().getCurrentUrl().contains("/register"),
            "Should be on /register page");
    }

    @Test(description = "Successful registration with unique credentials")
    public void testSuccessfulRegistration() {
        registerPage.navigateTo();
        registerPage.register(
            TestUtils.uniqueUsername(),
            TestUtils.uniqueEmail(),
            "ValidPass@123"
        );
        Assert.assertTrue(registerPage.registrationSucceeded(),
                "Should redirect away from /register on success");
    }

    @Test(description = "Registration with duplicate email shows error")
    public void testRegisterWithDuplicateEmail() {
        registerPage.navigateTo();
        registerPage.register("dupUser", TEST_EMAIL, TEST_PASSWORD);
        Assert.assertTrue(registerPage.hasErrorMessage(),
                "Error should appear for already-registered email");
    }

    @Test(description = "Registration with short password shows error")
    public void testRegisterWithShortPassword() {
        registerPage.navigateTo();
        registerPage.register(TestUtils.uniqueUsername(), TestUtils.uniqueEmail(), "123");
        Assert.assertTrue(registerPage.hasErrorMessage(),
                "Error should appear for too-short password");
    }

    @Test(description = "Registration with empty username shows error")
    public void testRegisterWithEmptyUsername() {
        registerPage.navigateTo();
        registerPage.register("", TestUtils.uniqueEmail(), TEST_PASSWORD);
        Assert.assertTrue(registerPage.hasErrorMessage(),
                "Error should appear for empty username");
    }

    @Test(description = "Register page has a Sign In link that navigates to /login")
    public void testRegisterPageHasLoginLink() {
        registerPage.navigateTo();
        registerPage.clickLogin();
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "Should navigate to /login after clicking Sign In");
    }
}
