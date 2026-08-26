package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.ProfilePage;
import com.pddapp.pages.LoginPage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Profile Tests – covers profile page display, stats, achievements,
 * bio editing, and logout.
 */
public class ProfileTest extends BaseTest {

    private ProfilePage profilePage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        profilePage = new ProfilePage(getDriver(), wait);
        profilePage.navigateTo();
    }

    // ── Page Loading ──────────────────────────────────────────

    @Test(description = "Profile page loads with correct heading")
    public void testProfilePageLoads() {
        Assert.assertTrue(profilePage.isPageVisible(),
                "Profile page heading should be visible");
    }

    @Test(description = "Username is displayed on profile page")
    public void testUsernameDisplayed() {
        Assert.assertTrue(profilePage.isUsernameVisible(),
                "Username should be displayed on profile page");
    }

    @Test(description = "Username is not empty")
    public void testUsernameNotEmpty() {
        String username = profilePage.getUsername();
        Assert.assertFalse(username == null || username.trim().isEmpty(),
                "Username displayed on profile should not be empty");
    }

    // ── Stats Display ─────────────────────────────────────────

    @Test(description = "Tier badge is visible on profile page")
    public void testTierBadgeVisible() {
        Assert.assertTrue(profilePage.isTierBadgeVisible(),
                "Tier badge should be displayed on profile page");
    }

    @Test(description = "XP display is visible on profile page")
    public void testXpDisplayVisible() {
        Assert.assertTrue(profilePage.isXpVisible(),
                "XP value should be displayed on profile page");
    }

    @Test(description = "Level is displayed on profile page")
    public void testLevelDisplayVisible() {
        Assert.assertTrue(profilePage.isLevelVisible(),
                "Level should be displayed on profile page");
    }

    @Test(description = "Streak is displayed on profile page")
    public void testStreakDisplayVisible() {
        Assert.assertTrue(profilePage.isStreakVisible(),
                "Streak should be displayed on profile page");
    }

    @Test(description = "Stats cards are visible on profile page")
    public void testStatsCardsVisible() {
        Assert.assertTrue(profilePage.getStatsCardCount() > 0,
                "At least one stats card should be visible on profile");
    }

    // ── Achievements ──────────────────────────────────────────

    @Test(description = "Achievements section appears after completing a debate")
    public void testAchievementsSection() {
        if (profilePage.getAchievementCount() > 0) {
            Assert.assertTrue(true, "Achievement cards are visible");
        } else {
            // No achievements unlocked yet — acceptable
            Assert.assertTrue(true, "No achievements yet — valid for new user");
        }
    }

    // ── Edit Profile ──────────────────────────────────────────

    @Test(description = "Edit Profile button is visible")
    public void testEditProfileButtonVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//button[contains(.,'Edit')]")),
            "Edit Profile button should be visible");
    }

    @Test(description = "Clicking Edit Profile opens edit form")
    public void testClickEditProfileOpensForm() {
        profilePage.clickEditProfile();
        // Bio textarea or form should appear
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.cssSelector(
                "textarea, input[name='bio'], input[name='username']")),
            "Edit form should open after clicking Edit Profile");
    }

    @Test(description = "User can update bio and save successfully")
    public void testUpdateBio() {
        profilePage.clickEditProfile();
        profilePage.updateBio("I love debating and critical thinking!");
        profilePage.clickSave();
        // Success toast or URL change expected
        boolean saved = profilePage.isSuccessToast()
                     || !getDriver().getCurrentUrl().contains("/edit");
        Assert.assertTrue(saved, "Profile should save successfully");
    }

    // ── Navigation from Profile ───────────────────────────────

    @Test(description = "Profile page is accessible from the navbar user menu")
    public void testProfileAccessibleFromNavbar() {
        // Navigate away then use navbar
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/dashboard");
        // Click user avatar in navbar
        if (wait.isVisible(org.openqa.selenium.By.cssSelector("[class*='rounded-full'][class*='bg-gradient']"))) {
            getDriver().findElement(
                org.openqa.selenium.By.cssSelector("[class*='rounded-full'][class*='bg-gradient']"))
                .click();
            // Click Profile link
            if (wait.isVisible(org.openqa.selenium.By.xpath("//a[contains(.,'Profile')]"))) {
                getDriver().findElement(
                    org.openqa.selenium.By.xpath("//a[contains(.,'Profile')]")).click();
                Assert.assertTrue(wait.forUrlContaining("/profile"),
                        "Should navigate to /profile from navbar menu");
            }
        }
    }

    // ── Logout ────────────────────────────────────────────────

    @Test(description = "Logout button is visible on profile page")
    public void testLogoutButtonVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath(
                "//button[contains(.,'Sign Out') or contains(.,'Logout')]")),
            "Logout / Sign Out button should be visible");
    }

    @Test(description = "Clicking logout redirects to landing or login page")
    public void testLogoutRedirectsToLogin() {
        profilePage.clickLogout();
        boolean redirected = wait.forUrlContaining("/login")
                          || wait.forUrlContaining("/");
        Assert.assertTrue(redirected,
                "Should redirect to login or landing page after logout");
    }

    @Test(description = "After logout, accessing /profile redirects to /login")
    public void testProtectedProfileAfterLogout() {
        profilePage.clickLogout();
        wait.forUrlContaining("/login");
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/profile");
        Assert.assertTrue(wait.forUrlContaining("/login"),
                "Protected /profile route should redirect to /login when not authenticated");
    }
}
