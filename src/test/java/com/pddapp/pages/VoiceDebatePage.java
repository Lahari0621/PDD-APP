package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Page Object for the Voice Debate screen (/voice-debate).
 */
public class VoiceDebatePage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    // ── Setup ──────────────────────────────────────────────────
    private final By pageHeading        = By.xpath("//h1[contains(., 'Voice Debate')]");
    private final By topicTextArea      = By.cssSelector("textarea[placeholder*='topic' i]");
    private final By startVoiceBtn      = By.xpath("//button[contains(., 'Start Voice Debate')]");
    private final By aiSpeaksToggle     = By.xpath("//span[contains(., 'AI speaks')]/../div[@class[contains(.,'rounded-full')]]");
    private final By autoListenToggle   = By.xpath("//span[contains(., 'Auto-listen')]/../div[@class[contains(.,'rounded-full')]]");
    private final By analyticsNote      = By.cssSelector("[class*='primary-500']");

    // ── Active debate ─────────────────────────────────────────
    private final By micButton          = By.cssSelector("button.rounded-full.w-20");
    private final By endButton          = By.xpath("//button[contains(., 'End')]");
    private final By aiAvatar           = By.cssSelector("[class*='rounded-full'][class*='w-16']");
    private final By statusText         = By.cssSelector(".text-slate-400.text-sm.font-medium");
    private final By waveform           = By.cssSelector(".flex.items-center.gap-\\[3px\\]");
    private final By turnCounter        = By.xpath("//span[contains(@class,'text-white') and contains(@class,'font-semibold')]");
    private final By fallacyCounter     = By.xpath("//span[contains(@class,'font-semibold') and (contains(@class,'text-warning') or contains(@class,'text-white'))][2]");
    private final By trackedBadge       = By.xpath("//span[contains(@class,'text-success') and contains(., 'tracked')]");
    private final By muteAiBtn          = By.cssSelector("button.w-12.h-12.rounded-full[title]");
    private final By replayBtns         = By.cssSelector("button[title='Replay']");
    private final By aiMessages         = By.cssSelector(".rounded-tl-sm.text-slate-200");
    private final By userMessages       = By.cssSelector(".rounded-tr-sm");
    private final By interimTranscript  = By.cssSelector(".border-success\\/30.italic");

    // ── Summary ───────────────────────────────────────────────
    private final By summaryScreen      = By.xpath("//h2[contains(., 'Debate Complete')]");
    private final By voiceBadge         = By.xpath("//span[contains(., 'Voice Debate')]");
    private final By newVoiceDebateBtn  = By.xpath("//button[contains(., 'New Voice Debate')]");
    private final By analyticsBtn       = By.xpath("//button[contains(., 'Analytics')]");
    private final By skillBars          = By.cssSelector(".glass.rounded-xl.p-2.border .h-1");

    public VoiceDebatePage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/voice-debate");
    }

    public boolean isSetupScreenVisible() {
        return wait.isVisible(pageHeading);
    }

    public void enterTopic(String topic) {
        WebElement el = wait.forVisible(topicTextArea);
        el.clear(); el.sendKeys(topic);
    }

    public void clickStartVoiceDebate() {
        wait.forClickable(startVoiceBtn).click();
    }

    public boolean isAnalyticsNoteVisible() {
        return wait.isVisible(analyticsNote);
    }

    public boolean isActiveDebateVisible() {
        return wait.isVisible(micButton);
    }

    public boolean isAiAvatarVisible() {
        return wait.isVisible(aiAvatar);
    }

    public String getStatusText() {
        return wait.forVisible(statusText).getText();
    }

    public boolean isTrackedBadgeVisible() {
        return wait.isVisible(trackedBadge);
    }

    public void clickMic() {
        wait.forClickable(micButton).click();
    }

    public void clickEnd() {
        wait.forClickable(endButton).click();
    }

    public void clickMuteAI() {
        if (!driver.findElements(muteAiBtn).isEmpty()) {
            driver.findElements(muteAiBtn).get(0).click();
        }
    }

    public int getAiMessageCount() {
        return driver.findElements(aiMessages).size();
    }

    public int getUserMessageCount() {
        return driver.findElements(userMessages).size();
    }

    public boolean hasReplayButtons() {
        return !driver.findElements(replayBtns).isEmpty();
    }

    public void clickReplayFirst() {
        if (!driver.findElements(replayBtns).isEmpty()) {
            driver.findElements(replayBtns).get(0).click();
        }
    }

    public boolean isSummaryVisible() {
        return wait.isVisible(summaryScreen);
    }

    public boolean isVoiceBadgeOnSummary() {
        return wait.isVisible(voiceBadge);
    }

    public int getSkillBarCount() {
        return driver.findElements(skillBars).size();
    }

    public void clickNewVoiceDebate() {
        wait.forClickable(newVoiceDebateBtn).click();
    }

    public void clickViewAnalytics() {
        wait.forClickable(analyticsBtn).click();
    }
}
