package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.AiVsAiPage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * AI vs AI Debate Tests – covers topic input, sample topics,
 * debate generation, round display, play animation, and judgment.
 */
public class AiVsAiTest extends BaseTest {

    private AiVsAiPage aiVsAiPage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        aiVsAiPage = new AiVsAiPage(getDriver(), wait);
        aiVsAiPage.navigateTo();
    }

    // ── Page Loading ──────────────────────────────────────────

    @Test(description = "AI vs AI page loads with correct heading")
    public void testPageLoads() {
        Assert.assertTrue(aiVsAiPage.isPageVisible(),
                "AI vs AI page heading should be visible");
    }

    @Test(description = "Topic input field is visible")
    public void testTopicInputVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.cssSelector("input[placeholder*='topic' i]")),
            "Topic input should be visible");
    }

    @Test(description = "Sample topic chips are displayed")
    public void testSampleTopicsVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.cssSelector("button.rounded-full.border")),
            "Sample topic chips should be displayed");
    }

    @Test(description = "Generate Debate button is visible")
    public void testGenerateButtonVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//button[contains(.,'Generate Debate')]")),
            "Generate Debate button should be visible");
    }

    // ── Topic Selection ───────────────────────────────────────

    @Test(description = "Clicking a sample topic populates the input field")
    public void testSampleTopicPopulatesInput() {
        aiVsAiPage.clickSampleTopic(0);
        String value = getDriver()
            .findElement(org.openqa.selenium.By.cssSelector("input[placeholder*='topic' i]"))
            .getAttribute("value");
        Assert.assertFalse(value == null || value.isEmpty(),
                "Clicking a sample topic should populate the input field");
    }

    @Test(description = "Typing a custom topic in input field works")
    public void testEnterCustomTopic() {
        aiVsAiPage.enterTopic("Cryptocurrency will replace traditional banking");
        String value = getDriver()
            .findElement(org.openqa.selenium.By.cssSelector("input[placeholder*='topic' i]"))
            .getAttribute("value");
        Assert.assertTrue(value.contains("Cryptocurrency"),
                "Custom topic text should appear in input field");
    }

    @Test(description = "Generate button is disabled without a topic entered")
    public void testGenerateDisabledWithoutTopic() {
        // Clear any pre-filled value
        getDriver().findElement(
            org.openqa.selenium.By.cssSelector("input[placeholder*='topic' i]")).clear();
        aiVsAiPage.clickGenerate();
        // Should not show debate (still on initial state)
        Assert.assertFalse(aiVsAiPage.areCombatantCardsVisible(),
                "Debate should not generate without a topic");
    }

    // ── Debate Generation ─────────────────────────────────────

    @Test(description = "Generating AI vs AI debate shows two combatant cards")
    public void testGenerateShowsCombatants() {
        aiVsAiPage.enterTopic("Artificial intelligence will benefit humanity");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        Assert.assertTrue(aiVsAiPage.areCombatantCardsVisible(),
                "Two combatant cards (Aria PRO / Nova ANTI) should appear");
    }

    @Test(description = "VS label appears between the two combatants")
    public void testVsLabelVisible() {
        aiVsAiPage.enterTopic("Social media does more harm than good");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        Assert.assertTrue(aiVsAiPage.isVsLabelVisible(),
                "VS label should appear between the two debaters");
    }

    @Test(description = "PRO AI name is non-empty after generation")
    public void testProAINameNotEmpty() {
        aiVsAiPage.clickSampleTopic(1);
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        Assert.assertFalse(aiVsAiPage.getProAIName().isEmpty(),
                "PRO AI name should be displayed");
    }

    @Test(description = "CON AI name is non-empty after generation")
    public void testConAINameNotEmpty() {
        aiVsAiPage.clickSampleTopic(2);
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        Assert.assertFalse(aiVsAiPage.getConAIName().isEmpty(),
                "CON AI name should be displayed");
    }

    // ── Play Debate Animation ─────────────────────────────────

    @Test(description = "Play Debate button is visible before animation starts")
    public void testPlayDebateButtonVisible() {
        aiVsAiPage.enterTopic("Universal Basic Income should be implemented");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//button[contains(.,'Play Debate')]")),
            "Play Debate button should be visible before animation");
    }

    @Test(description = "Clicking Play Debate animates rounds one by one")
    public void testPlayDebateAnimatesRounds() {
        aiVsAiPage.enterTopic("Democracy is the best form of government");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        aiVsAiPage.clickPlayDebate();
        aiVsAiPage.waitForAllRoundsVisible();
        Assert.assertTrue(aiVsAiPage.getRoundCardCount() >= 6,
                "All 6 debate rounds should be visible after animation completes");
    }

    // ── Judgment ──────────────────────────────────────────────

    @Test(description = "Judgment section appears after all rounds are shown")
    public void testJudgmentSectionVisible() {
        aiVsAiPage.enterTopic("Space exploration is worth the investment");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        aiVsAiPage.clickPlayDebate();
        aiVsAiPage.waitForAllRoundsVisible();
        Assert.assertTrue(aiVsAiPage.isJudgmentVisible(),
                "Judgment section should appear after all rounds are displayed");
    }

    @Test(description = "Winner text is shown in judgment section")
    public void testJudgmentWinnerText() {
        aiVsAiPage.enterTopic("Nuclear energy for sustainability");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        aiVsAiPage.clickPlayDebate();
        aiVsAiPage.waitForAllRoundsVisible();
        String winner = aiVsAiPage.getWinnerText();
        Assert.assertFalse(winner.isEmpty(),
                "Winner text should be shown in the judgment section");
    }

    @Test(description = "Judgment explanation text is non-empty")
    public void testJudgmentExplanationNotEmpty() {
        aiVsAiPage.enterTopic("Veganism is the most ethical diet");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        aiVsAiPage.clickPlayDebate();
        aiVsAiPage.waitForAllRoundsVisible();
        String explanation = aiVsAiPage.getJudgeExplanation();
        Assert.assertFalse(explanation.isEmpty(),
                "Judge explanation should contain text");
    }

    @Test(description = "Score breakdown rows appear in judgment section")
    public void testScoreBreakdownRows() {
        aiVsAiPage.enterTopic("Online education vs traditional education");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        aiVsAiPage.clickPlayDebate();
        aiVsAiPage.waitForAllRoundsVisible();
        Assert.assertTrue(aiVsAiPage.getScoreRowCount() >= 4,
                "At least 4 score breakdown rows (Logic, Evidence, Persuasion, Rebuttal) should appear");
    }

    @Test(description = "Fallback debate still shows complete structure when AI is rate-limited")
    public void testFallbackDebateStructure() {
        aiVsAiPage.enterTopic("Climate change is the most urgent issue");
        aiVsAiPage.clickGenerate();
        aiVsAiPage.waitForDebateGenerated();
        // Even with fallback data the combatants should appear
        Assert.assertTrue(aiVsAiPage.areCombatantCardsVisible(),
                "Combatant cards should appear even with fallback debate data");
    }
}
