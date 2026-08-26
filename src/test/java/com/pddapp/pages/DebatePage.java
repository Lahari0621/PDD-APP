package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Debate screen (/debate).
 * Covers setup mode, active debate, and summary screen.
 */
public class DebatePage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    // ── Setup screen ──────────────────────────────────────────
    private final By topicTextArea      = By.cssSelector("textarea[placeholder*='topic' i], textarea[placeholder*='debate' i]");
    private final By positionInput      = By.cssSelector("input[placeholder*='position' i], input[placeholder*='argue' i]");
    private final By beginDebateBtn     = By.xpath("//button[contains(., 'Begin Debate') or contains(., 'Start')]");
    private final By voiceDebateBtn     = By.xpath("//button[contains(., 'Voice Debate')]");
    private final By difficultyBtns     = By.cssSelector("button.rounded-xl.capitalize, button[class*='difficulty']");
    private final By debateModeCards    = By.cssSelector(".grid button[class*='rounded-xl']");

    // ── Active debate ─────────────────────────────────────────
    private final By messageInput       = By.cssSelector("textarea[placeholder*='argument' i], textarea[placeholder*='Type' i]");
    private final By sendButton         = By.cssSelector("button[class*='primary']:last-of-type, button[aria-label='Send']");
    private final By aiMessages         = By.cssSelector(".rounded-tl-sm.text-slate-200");
    private final By userMessages       = By.cssSelector(".rounded-tr-sm");
    private final By fallacyBadges      = By.cssSelector("button[class*='rounded-full'][style*='color']");
    private final By endDebateBtn       = By.xpath("//button[contains(., 'End')]");
    private final By argStrengthMeter   = By.cssSelector("[class*='ArgumentStrength'], .glass.rounded-xl.border");
    private final By overallScore       = By.cssSelector(".text-sm.font-black");
    private final By typingIndicator    = By.cssSelector(".typing-dot, .animate-bounce");

    // ── Summary screen ────────────────────────────────────────
    private final By summaryHeading     = By.xpath("//h2[contains(., 'Debate Complete')]");
    private final By finalScoreEl       = By.xpath("//div[contains(@class,'font-black') and contains(@class,'text-primary')]");
    private final By xpEarnedEl         = By.xpath("//div[contains(@class,'text-warning') and contains(., '+')]");
    private final By newDebateBtn       = By.xpath("//button[contains(., 'New Debate')]");
    private final By dashboardBtn       = By.xpath("//button[contains(., 'Dashboard')]");

    public DebatePage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/debate");
    }

    // ── Setup ─────────────────────────────────────────────────

    public boolean isSetupScreenVisible() {
        return wait.isVisible(topicTextArea);
    }

    public void enterTopic(String topic) {
        WebElement el = wait.forVisible(topicTextArea);
        el.clear(); el.sendKeys(topic);
    }

    public void enterPosition(String position) {
        if (wait.isVisible(positionInput)) {
            WebElement el = driver.findElement(positionInput);
            el.clear(); el.sendKeys(position);
        }
    }

    public void selectDifficulty(String level) {
        List<WebElement> btns = driver.findElements(difficultyBtns);
        for (WebElement btn : btns) {
            if (btn.getText().trim().equalsIgnoreCase(level)) {
                btn.click();
                return;
            }
        }
    }

    public void selectDebateMode(String mode) {
        List<WebElement> cards = driver.findElements(debateModeCards);
        for (WebElement card : cards) {
            if (card.getText().toLowerCase().contains(mode.toLowerCase())) {
                card.click();
                return;
            }
        }
    }

    public void clickBeginDebate() {
        wait.forClickable(beginDebateBtn).click();
    }

    public void startDebate(String topic, String difficulty) {
        enterTopic(topic);
        selectDifficulty(difficulty);
        clickBeginDebate();
    }

    // ── Active debate ─────────────────────────────────────────

    public boolean isActiveDebateVisible() {
        return wait.isVisible(messageInput);
    }

    public boolean isAiResponseVisible() {
        return !driver.findElements(aiMessages).isEmpty();
    }

    public void sendMessage(String message) {
        WebElement input = wait.forVisible(messageInput);
        input.clear(); input.sendKeys(message);
        wait.forClickable(sendButton).click();
    }

    public void waitForAiResponse() {
        // Wait for typing indicator to appear then disappear
        wait.forVisible(typingIndicator);
        wait.forInvisible(typingIndicator);
    }

    public int getAiMessageCount() {
        return driver.findElements(aiMessages).size();
    }

    public int getUserMessageCount() {
        return driver.findElements(userMessages).size();
    }

    public boolean hasFallacyDetected() {
        return !driver.findElements(fallacyBadges).isEmpty();
    }

    public void clickFirstFallacyBadge() {
        List<WebElement> badges = driver.findElements(fallacyBadges);
        if (!badges.isEmpty()) badges.get(0).click();
    }

    public boolean isStrengthMeterVisible() {
        return wait.isVisible(argStrengthMeter);
    }

    public void clickEndDebate() {
        wait.forClickable(endDebateBtn).click();
    }

    // ── Summary ───────────────────────────────────────────────

    public boolean isSummaryScreenVisible() {
        return wait.isVisible(summaryHeading);
    }

    public String getFinalScore() {
        return wait.forVisible(finalScoreEl).getText();
    }

    public String getXpEarned() {
        return wait.forVisible(xpEarnedEl).getText();
    }

    public void clickNewDebate() {
        wait.forClickable(newDebateBtn).click();
    }

    public void clickDashboard() {
        wait.forClickable(dashboardBtn).click();
    }

    public void clickVoiceDebateSwitch() {
        wait.forClickable(voiceDebateBtn).click();
    }
}
