package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.DebatePage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Debate Tests – covers setup, active debate, fallacy detection,
 * argument strength meter, debate modes, and summary screen.
 */
public class DebateTest extends BaseTest {

    private DebatePage debatePage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        debatePage = new DebatePage(getDriver(), wait);
        debatePage.navigateTo();
    }

    // ── Setup Screen ──────────────────────────────────────────

    @Test(description = "Debate setup screen is visible after navigation")
    public void testDebateSetupScreenLoads() {
        Assert.assertTrue(debatePage.isSetupScreenVisible(),
                "Debate setup screen (topic textarea) should be visible");
    }

    @Test(description = "Begin Debate button is disabled when topic is empty")
    public void testBeginDebateDisabledWithoutTopic() {
        // Don't enter a topic — button should be disabled
        debatePage.clickBeginDebate();
        // Should still be on setup screen
        Assert.assertTrue(debatePage.isSetupScreenVisible(),
                "Should remain on setup screen when topic is empty");
    }

    @Test(description = "Selecting beginner difficulty highlights that option")
    public void testSelectBeginnerDifficulty() {
        debatePage.selectDifficulty("beginner");
        // No exception = selection worked; active debate can still start
        debatePage.enterTopic("Social media advantages and disadvantages");
        debatePage.clickBeginDebate();
        Assert.assertTrue(debatePage.isActiveDebateVisible(),
                "Debate should start with beginner difficulty selected");
    }

    @Test(description = "Selecting Classic debate mode and starting debate")
    public void testStartClassicDebate() {
        debatePage.selectDebateMode("Classic");
        debatePage.enterTopic("Is remote work better than office work?");
        debatePage.clickBeginDebate();
        Assert.assertTrue(debatePage.isActiveDebateVisible(),
                "Active debate should be visible after starting");
    }

    @Test(description = "Selecting Cross-Examination mode and starting debate")
    public void testStartCrossExaminationDebate() {
        debatePage.selectDebateMode("Cross");
        debatePage.enterTopic("Should students use mobile phones in school?");
        debatePage.clickBeginDebate();
        Assert.assertTrue(debatePage.isActiveDebateVisible(),
                "Active debate should start in Cross-Examination mode");
    }

    @Test(description = "Selecting Rapid Fire mode and starting debate")
    public void testStartRapidFireDebate() {
        debatePage.selectDebateMode("Rapid");
        debatePage.enterTopic("Technology makes us more connected");
        debatePage.clickBeginDebate();
        Assert.assertTrue(debatePage.isActiveDebateVisible(),
                "Active debate should start in Rapid Fire mode");
    }

    @Test(description = "Voice Debate switch button navigates to /voice-debate")
    public void testVoiceDebateSwitchButton() {
        debatePage.enterTopic("AI will replace teachers");
        debatePage.clickVoiceDebateSwitch();
        Assert.assertTrue(wait.forUrlContaining("/voice-debate"),
                "Should navigate to /voice-debate when switch button clicked");
    }

    // ── Active Debate ─────────────────────────────────────────

    @Test(description = "AI sends opening message when debate starts")
    public void testAiOpeningMessageAppears() {
        debatePage.startDebate("Social media does more harm than good", "beginner");
        Assert.assertTrue(debatePage.isAiResponseVisible(),
                "AI should send an opening message");
    }

    @Test(description = "User can send a message and AI responds")
    public void testUserSendMessageAndAiResponds() {
        debatePage.startDebate("Social media does more harm than good", "beginner");
        int initialAiCount = debatePage.getAiMessageCount();
        debatePage.sendMessage("I think social media is harmful to children.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.getAiMessageCount() > initialAiCount,
                "AI should respond after user sends a message");
    }

    @Test(description = "Multiple turns of debate conversation work correctly")
    public void testMultipleDebateTurns() {
        debatePage.startDebate("Online education is better than traditional education", "intermediate");
        debatePage.sendMessage("Online education gives students flexibility to learn at their own pace.");
        debatePage.waitForAiResponse();
        debatePage.sendMessage("Students who study online perform just as well as classroom students.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.getAiMessageCount() >= 3,
                "Should have opening + 2 AI replies after 2 user messages");
    }

    @Test(description = "User message count increments after sending")
    public void testUserMessageCountIncrements() {
        debatePage.startDebate("Nuclear energy is essential for sustainability", "intermediate");
        debatePage.sendMessage("Nuclear energy produces no carbon emissions during operation.");
        debatePage.waitForAiResponse();
        Assert.assertEquals(debatePage.getUserMessageCount(), 1,
                "Should have exactly 1 user message");
    }

    // ── Fallacy Detection ─────────────────────────────────────

    @Test(description = "Fallacy badge appears when ad hominem detected")
    public void testFallacyDetectedAdHominem() {
        debatePage.startDebate("Climate change policy", "intermediate");
        debatePage.sendMessage("You are too stupid and naive to understand climate science.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Ad hominem fallacy badge should appear");
    }

    @Test(description = "Fallacy badge appears for hasty generalisation")
    public void testFallacyDetectedHastyGeneralisation() {
        debatePage.startDebate("Social media effects", "intermediate");
        debatePage.sendMessage("All teenagers are addicted to social media and never study.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Hasty generalisation fallacy should be detected");
    }

    @Test(description = "Clicking fallacy badge opens fallacy panel")
    public void testClickFallacyBadgeOpensFallacyPanel() {
        debatePage.startDebate("Social media effects", "intermediate");
        debatePage.sendMessage("Everyone knows social media is always bad and never useful.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            Assert.assertTrue(
                wait.isVisible(org.openqa.selenium.By.cssSelector(
                    ".fixed.right-4, [class*='fixed'][class*='right']")),
                "Fallacy panel should slide in after clicking badge");
        }
    }

    @Test(description = "Argument strength meter is visible after sending message")
    public void testArgumentStrengthMeterVisible() {
        debatePage.startDebate("Technology and education", "beginner");
        debatePage.sendMessage("Mobile phones help students look up information quickly in class.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.isStrengthMeterVisible(),
                "Argument strength meter should appear after user message");
    }

    // ── End Debate & Summary ──────────────────────────────────

    @Test(description = "Ending debate shows summary screen with score")
    public void testEndDebateShowsSummary() {
        debatePage.startDebate("Social media advantages and disadvantages", "beginner");
        debatePage.sendMessage("Social media helps people stay connected with friends and family.");
        debatePage.waitForAiResponse();
        debatePage.clickEndDebate();
        Assert.assertTrue(debatePage.isSummaryScreenVisible(),
                "Summary screen should appear after ending debate");
    }

    @Test(description = "Summary screen shows final score and XP earned")
    public void testSummaryScreenShowsScoreAndXp() {
        debatePage.startDebate("Remote work benefits", "beginner");
        debatePage.sendMessage("Remote work reduces commuting time and improves work-life balance.");
        debatePage.waitForAiResponse();
        debatePage.clickEndDebate();
        Assert.assertTrue(debatePage.isSummaryScreenVisible(), "Summary should be visible");
        Assert.assertFalse(debatePage.getFinalScore().isEmpty(),
                "Final score should be displayed");
        Assert.assertTrue(debatePage.getXpEarned().contains("+"),
                "XP earned should be shown with '+' prefix");
    }

    @Test(description = "New Debate button on summary restores setup screen")
    public void testNewDebateButtonRestoresSetup() {
        debatePage.startDebate("Democracy is the best government", "beginner");
        debatePage.sendMessage("Democracy gives every citizen the right to vote and have a say.");
        debatePage.waitForAiResponse();
        debatePage.clickEndDebate();
        debatePage.clickNewDebate();
        Assert.assertTrue(debatePage.isSetupScreenVisible(),
                "Setup screen should reappear after clicking New Debate");
    }

    @Test(description = "Dashboard button on summary navigates to /dashboard")
    public void testDashboardButtonNavigation() {
        debatePage.startDebate("Space exploration worth the cost", "beginner");
        debatePage.sendMessage("Space exploration drives technological innovation that benefits everyone.");
        debatePage.waitForAiResponse();
        debatePage.clickEndDebate();
        debatePage.clickDashboard();
        Assert.assertTrue(wait.forUrlContaining("/dashboard"),
                "Should navigate to /dashboard from summary screen");
    }
}
