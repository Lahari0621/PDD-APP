package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Topic Generator screen (/topics).
 */
public class TopicGeneratorPage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    private final By pageHeading       = By.xpath("//h1[contains(., 'Topic Generator')]");
    private final By categoryBtns      = By.cssSelector(".grid button.rounded-xl");
    private final By difficultyBtns    = By.cssSelector(".flex button.rounded-xl");
    private final By generateBtn       = By.xpath("//button[contains(., 'Generate Topic')]");
    private final By loadingSpinner    = By.cssSelector(".animate-spin");
    private final By generatedTopic    = By.cssSelector(".text-white.font-black.text-xl, h2.font-black");
    private final By debateThisBtn     = By.xpath("//a[contains(., 'Debate This Topic')]");
    private final By proPositionCard   = By.xpath("//div[contains(.,'PRO Position')]");
    private final By conPositionCard   = By.xpath("//div[contains(.,'CON Position')]");
    private final By proArguments      = By.xpath("//div[contains(.,'Pro Arguments')]/..//li");
    private final By conArguments      = By.xpath("//div[contains(.,'Con Arguments')]/..//li");
    private final By difficultyReason  = By.xpath("//div[contains(.,'Why')]");
    private final By evidenceTags      = By.cssSelector(".text-xs.px-2.py-0\\.5.rounded-full.bg-primary");

    public TopicGeneratorPage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/topics");
    }

    public boolean isPageVisible() { return wait.isVisible(pageHeading); }

    public void selectCategory(String categoryLabel) {
        List<WebElement> btns = driver.findElements(categoryBtns);
        for (WebElement btn : btns) {
            if (btn.getText().trim().equalsIgnoreCase(categoryLabel)) {
                btn.click(); return;
            }
        }
    }

    public void selectDifficulty(String level) {
        List<WebElement> btns = driver.findElements(difficultyBtns);
        for (WebElement btn : btns) {
            if (btn.getText().trim().equalsIgnoreCase(level)) {
                btn.click(); return;
            }
        }
    }

    public void clickGenerate() { wait.forClickable(generateBtn).click(); }

    public void waitForResult() {
        wait.forInvisible(loadingSpinner);
        wait.forVisible(generatedTopic);
    }

    public boolean isTopicVisible()         { return wait.isVisible(generatedTopic); }
    public String  getGeneratedTopicText()  { return wait.forVisible(generatedTopic).getText(); }
    public boolean isProPositionVisible()   { return wait.isVisible(proPositionCard); }
    public boolean isConPositionVisible()   { return wait.isVisible(conPositionCard); }
    public boolean isDifficultyReasonVisible(){ return wait.isVisible(difficultyReason); }

    public int getProArgumentCount() { return driver.findElements(proArguments).size(); }
    public int getConArgumentCount() { return driver.findElements(conArguments).size(); }
    public int getEvidenceTagCount() { return driver.findElements(evidenceTags).size(); }

    public void clickDebateThisTopic() { wait.forClickable(debateThisBtn).click(); }

    public boolean isOnDebatePage() {
        return wait.forUrlContaining("/debate");
    }
}
