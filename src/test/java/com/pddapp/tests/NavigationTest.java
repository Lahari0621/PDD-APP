package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.utils.TestUtils;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Navigation Tests – validates routing, navbar links, protected routes,
 * back navigation, and 404 handling.
 */
public class NavigationTest extends BaseTest {

    @BeforeMethod
    public void pageSetup() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL);
    }

    // ── Landing Page ──────────────────────────────────────────

    @Test(description = "Landing page loads at root URL")
    public void testLandingPageLoads() {
        Assert.assertTrue(
            wait.isVisible(By.cssSelector("h1, [class*='gradient-text']")),
            "Landing page heading should be visible");
    }

    @Test(description = "Navbar is visible on landing page")
    public void testNavbarVisible() {
        Assert.assertTrue(
            wait.isVisible(By.cssSelector("nav")),
            "Navbar should be visible on landing page");
    }

    @Test(description = "Sign In link on landing page navigates to /login")
    public void testSignInLinkNavigation() {
        if (wait.isVisible(By.xpath("//a[contains(.,'Sign In')]"))) {
            getDriver().findElement(By.xpath("//a[contains(.,'Sign In')]")).click();
            Assert.assertTrue(wait.forUrlContaining("/login"),
                    "Clicking Sign In should navigate to /login");
        }
    }

    @Test(description = "Start Free / Register link navigates to /register")
    public void testStartFreeLinkNavigation() {
        if (wait.isVisible(By.xpath("//a[contains(.,'Start Free') or contains(.,'Register')]"))) {
            getDriver().findElement(
                By.xpath("//a[contains(.,'Start Free') or contains(.,'Register')]")).click();
            Assert.assertTrue(wait.forUrlContaining("/register"),
                    "Clicking Start Free should navigate to /register");
        }
    }

    // ── Protected Routes ──────────────────────────────────────

    @Test(description = "Accessing /dashboard without login redirects to /login")
    public void testDashboardProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/dashboard");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/dashboard should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /debate without login redirects to /login")
    public void testDebateProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/debate");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/debate should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /analytics without login redirects to /login")
    public void testAnalyticsProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/analytics");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/analytics should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /profile without login redirects to /login")
    public void testProfileProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/profile");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/profile should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /ai-vs-ai without login redirects to /login")
    public void testAiVsAiProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/ai-vs-ai");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/ai-vs-ai should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /topics without login redirects to /login")
    public void testTopicsProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/topics");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/topics should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /voice-debate without login redirects to /login")
    public void testVoiceDebateProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/voice-debate");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/voice-debate should redirect unauthenticated users to /login");
    }

    @Test(description = "Accessing /learn without login redirects to /login")
    public void testLearnProtected() {
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/learn");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "/learn should redirect unauthenticated users to /login");
    }

    // ── Post-Login Navigation ─────────────────────────────────

    @Test(description = "Navbar shows user menu after login")
    public void testNavbarShowsUserMenuAfterLogin() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        Assert.assertTrue(
            wait.isVisible(By.cssSelector("[class*='rounded-full'][class*='bg-gradient']")),
            "User avatar menu should be visible in navbar after login");
    }

    @Test(description = "Navbar user menu contains Dashboard link")
    public void testNavbarUserMenuDashboardLink() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        getDriver().findElement(
            By.cssSelector("[class*='rounded-full'][class*='bg-gradient']")).click();
        Assert.assertTrue(
            wait.isVisible(By.xpath("//a[contains(.,'Dashboard')]")),
            "Dashboard link should appear in the user dropdown menu");
    }

    @Test(description = "Navbar user menu contains Voice Debate link")
    public void testNavbarUserMenuVoiceDebateLink() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        getDriver().findElement(
            By.cssSelector("[class*='rounded-full'][class*='bg-gradient']")).click();
        Assert.assertTrue(
            wait.isVisible(By.xpath("//a[contains(.,'Voice Debate')]")),
            "Voice Debate link should appear in the user dropdown menu");
    }

    @Test(description = "Navbar user menu contains AI vs AI link")
    public void testNavbarUserMenuAiVsAiLink() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        getDriver().findElement(
            By.cssSelector("[class*='rounded-full'][class*='bg-gradient']")).click();
        Assert.assertTrue(
            wait.isVisible(By.xpath("//a[contains(.,'AI vs AI')]")),
            "AI vs AI link should appear in the user dropdown menu");
    }

    @Test(description = "Navigating to /dashboard from navbar works")
    public void testNavbarDashboardNavigation() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        getDriver().findElement(
            By.cssSelector("[class*='rounded-full'][class*='bg-gradient']")).click();
        getDriver().findElement(By.xpath("//a[contains(.,'Dashboard')]")).click();
        Assert.assertTrue(wait.forUrlContaining("/dashboard"),
                "Should navigate to /dashboard from navbar");
    }

    @Test(description = "404 page is shown for unknown routes")
    public void test404PageForUnknownRoute() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/this-page-does-not-exist");
        Assert.assertTrue(
            wait.isVisible(By.xpath("//div[contains(.,'404') or contains(.,'not found') or contains(.,'Not found')]")),
            "404 page should be displayed for unknown routes");
    }

    @Test(description = "Go Home button on 404 page navigates to landing page")
    public void test404GoHomeButton() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/nonexistent-route");
        if (wait.isVisible(By.xpath("//a[contains(.,'Go Home')]"))) {
            getDriver().findElement(By.xpath("//a[contains(.,'Go Home')]")).click();
            Assert.assertTrue(
                getDriver().getCurrentUrl().equals(com.pddapp.config.AppiumConfig.APP_URL + "/")
                || getDriver().getCurrentUrl().equals(com.pddapp.config.AppiumConfig.APP_URL),
                "Go Home should navigate to root URL");
        }
    }
}
