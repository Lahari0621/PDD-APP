package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the AI vs AI Debate screen (/ai-vs-ai).
 */
public class AiVsAiPage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    private final By pageHeading      = By.xpath("//h1[contains(., 'AI vs AI')]");
    private final By topicInput       = By.cssSelector("input[placeholder*='topic' i], input[placeholder*='Enter' i]");
    private final By generateBtn      = By.xpath("//button[contains(., 'Generate Debate')]");
    private final By sampleTopicBtns  = By.cssSelector("button.rounded-full.border.border-white");
    private final By loadingSpinner   = By.cssSelector(".animate-spin");
    private final By combatantCards   = By.cssSelector(".flex-1.glass-card.p-4.rounded-2xl");
    private final By vsLabel          = By.xpath("//div[contains(., 'VS')]");
    private final By playDebateBtn    = By.xpath("//button[contains(., 'Play Debate')]");
    private final By roundCards       = By.cssSelector(".glass-card.p-4.rounded-2xl:not(.flex-1)");
    private final By bouncingDots     = By.cssSelector(".animate-bounce");
    private final By judgmentSection  = By.cssSelector("[class*='warning\\/30']");
    private final By winnerDisplay    = By.cssSelector(".font-black.text-xl");
    private final By judgeExplanation = By.cssSelector(".text-slate-300.text-sm.leading-relaxed");
    private final By scoreRows        = By.cssSelector(".glass.rounded-xl.p-3.border");

    public AiVsAiPage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/ai-vs-ai");
    }

    public boolean isPageVisible() { return wait.isVisible(pageHeading); }

    public void enterTopic(String topic) {
        WebElement el = wait.forVisible(topicInput);
        el.clear(); el.sendKeys(topic);
    }

    public void clickSampleTopic(int index) {
        List<WebElement> samples = driver.findElements(sampleTopicBtns);
        if (index < samples.size()) samples.get(index).click();
    }

    public void clickGenerate() {
        wait.forClickable(generateBtn).click();
    }

    public boolean isLoading() { return wait.isVisible(loadingSpinner); }

    public void waitForDebateGenerated() {
        // Wait for loading to stop and combatant cards to appear
        wait.forInvisible(loadingSpinner);
        wait.forVisible(combatantCards);
    }

    public boolean areCombatantCardsVisible() { return wait.isVisible(combatantCards); }
    public boolean isVsLabelVisible()         { return wait.isVisible(vsLabel); }

    public String getProAIName() {
        List<WebElement> cards = driver.findElements(combatantCards);
        return cards.isEmpty() ? "" : cards.get(0).getText();
    }

    public String getConAIName() {
        List<WebElement> cards = driver.findElements(combatantCards);
        return cards.size() < 2 ? "" : cards.get(1).getText();
    }

    public void clickPlayDebate() {
        wait.forClickable(playDebateBtn).click();
    }

    public int getRoundCardCount() {
        return driver.findElements(roundCards).size();
    }

    public void waitForAllRoundsVisible() {
        // rounds animate in one by one — wait for bounce to stop
        wait.forInvisible(bouncingDots);
    }

    public boolean isJudgmentVisible()    { return wait.isVisible(judgmentSection); }
    public String  getWinnerText()        { return wait.forVisible(winnerDisplay).getText(); }
    public String  getJudgeExplanation()  { return wait.forVisible(judgeExplanation).getText(); }
    public int     getScoreRowCount()     { return driver.findElements(scoreRows).size(); }
}
