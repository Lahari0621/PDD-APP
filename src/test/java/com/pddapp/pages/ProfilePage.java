package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Page Object for the Profile screen (/profile).
 */
public class ProfilePage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    private final By pageHeading       = By.xpath("//h1[contains(., 'Profile')]");
    private final By usernameDisplay   = By.cssSelector("[class*='font-black'][class*='text-white']");
    private final By tierBadge         = By.cssSelector("[class*='tier'], [class*='Tier']");
    private final By xpDisplay         = By.xpath("//div[contains(., 'XP')]");
    private final By levelDisplay      = By.xpath("//div[contains(., 'Level')]");
    private final By streakDisplay     = By.xpath("//div[contains(., 'Streak')]");
    private final By editProfileBtn    = By.xpath("//button[contains(., 'Edit')]");
    private final By bioInput          = By.cssSelector("textarea[name='bio'], textarea[placeholder*='bio' i]");
    private final By saveBtn           = By.xpath("//button[contains(., 'Save')]");
    private final By achievementCards  = By.cssSelector("[class*='achievement'], [class*='Achievement']");
    private final By statsCards        = By.cssSelector(".glass.rounded-xl.p-4, .glass-card.p-4");
    private final By logoutBtn         = By.xpath("//button[contains(., 'Sign Out') or contains(., 'Logout')]");
    private final By successToast      = By.cssSelector("[class*='toast'], [class*='success']");

    public ProfilePage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/profile");
    }

    public boolean isPageVisible()          { return wait.isVisible(pageHeading); }
    public boolean isUsernameVisible()      { return wait.isVisible(usernameDisplay); }
    public boolean isTierBadgeVisible()     { return wait.isVisible(tierBadge); }
    public boolean isXpVisible()            { return wait.isVisible(xpDisplay); }
    public boolean isLevelVisible()         { return wait.isVisible(levelDisplay); }
    public boolean isStreakVisible()        { return wait.isVisible(streakDisplay); }

    public String getUsername()  { return wait.forVisible(usernameDisplay).getText(); }

    public int getAchievementCount() { return driver.findElements(achievementCards).size(); }
    public int getStatsCardCount()   { return driver.findElements(statsCards).size(); }

    public void clickEditProfile()   { wait.forClickable(editProfileBtn).click(); }

    public void updateBio(String bio) {
        WebElement el = wait.forVisible(bioInput);
        el.clear(); el.sendKeys(bio);
    }

    public void clickSave()          { wait.forClickable(saveBtn).click(); }
    public boolean isSuccessToast()  { return wait.isVisible(successToast); }
    public void clickLogout()        { wait.forClickable(logoutBtn).click(); }

    public boolean isLoggedOut() {
        return wait.forUrlContaining("/login");
    }
}
