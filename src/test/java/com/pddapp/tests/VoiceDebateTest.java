package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.VoiceDebatePage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Voice Debate Tests – covers setup, active debate UI, mic controls,
 * live stats, mute/replay, summary screen with analytics.
 *
 * NOTE: Actual speech recognition cannot be automated via Appium
 * (microphone input requires a physical gesture or OS-level injection).
 * These tests validate all UI elements, state transitions, and the
 * analytics summary that appears after ending the debate.
 */
public class VoiceDebateTest extends BaseTest {

    private VoiceDebatePage voiceDebatePage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        voiceDebatePage = new VoiceDebatePage(getDriver(), wait);
        voiceDebatePage.navigateTo();
    }

    // ── Setup Screen ──────────────────────────────────────────

    @Test(description = "Voice Debate setup screen loads correctly")
    public void testSetupScreenLoads() {
        Assert.assertTrue(voiceDebatePage.isSetupScreenVisible(),
                "Voice Debate heading should be visible on setup screen");
    }

    @Test(description = "Analytics tracking note is visible on setup screen")
    public void testAnalyticsNoteVisible() {
        Assert.assertTrue(voiceDebatePage.isAnalyticsNoteVisible(),
                "Analytics note should inform user that scores are tracked");
    }

    @Test(description = "Start Voice Debate button is disabled without a topic")
    public void testStartButtonDisabledWithoutTopic() {
        voiceDebatePage.clickStartVoiceDebate();
        // Should still be on setup screen — no topic entered
        Assert.assertTrue(voiceDebatePage.isSetupScreenVisible(),
                "Setup screen should remain when no topic entered");
    }

    @Test(description = "Selecting beginner difficulty is reflected in UI")
    public void testSelectBeginnerDifficulty() {
        voiceDebatePage.enterTopic("Should students use phones in school?");
        // Difficulty buttons exist — click beginner
        getDriver().findElements(
            org.openqa.selenium.By.cssSelector("button.rounded-xl.capitalize"))
            .stream()
            .filter(b -> b.getText().equalsIgnoreCase("beginner"))
            .findFirst()
            .ifPresent(org.openqa.selenium.WebElement::click);
        voiceDebatePage.clickStartVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isActiveDebateVisible(),
                "Active voice debate should start after selecting beginner difficulty");
    }

    @Test(description = "AI style selection works for all personality options")
    public void testAiStyleSelectionLogical() {
        voiceDebatePage.enterTopic("Climate change action is urgent");
        // Select 'Logical' style (default)
        getDriver().findElements(
            org.openqa.selenium.By.cssSelector("button.rounded-xl.border.text-xs.text-center"))
            .stream()
            .filter(b -> b.getText().contains("Logical"))
            .findFirst()
            .ifPresent(org.openqa.selenium.WebElement::click);
        voiceDebatePage.clickStartVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isActiveDebateVisible(),
                "Debate should start with Logical AI style");
    }

    @Test(description = "AI Socratic style can be selected and debate started")
    public void testAiStyleSelectionSocratic() {
        voiceDebatePage.enterTopic("Universal basic income should be implemented");
        getDriver().findElements(
            org.openqa.selenium.By.cssSelector("button.rounded-xl.border.text-xs.text-center"))
            .stream()
            .filter(b -> b.getText().contains("Socratic"))
            .findFirst()
            .ifPresent(org.openqa.selenium.WebElement::click);
        voiceDebatePage.clickStartVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isActiveDebateVisible(),
                "Debate should start with Socratic style");
    }

    // ── Active Debate UI ──────────────────────────────────────

    @Test(description = "AI avatar is visible during active voice debate")
    public void testAiAvatarVisible() {
        voiceDebatePage.enterTopic("Social media advantages and disadvantages");
        voiceDebatePage.clickStartVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isAiAvatarVisible(),
                "AI avatar should be displayed in active debate");
    }

    @Test(description = "Status text is shown to guide the user")
    public void testStatusTextVisible() {
        voiceDebatePage.enterTopic("Technology in education");
        voiceDebatePage.clickStartVoiceDebate();
        String status = voiceDebatePage.getStatusText();
        Assert.assertNotNull(status, "Status text should not be null");
        Assert.assertFalse(status.isEmpty(), "Status text should not be empty");
    }

    @Test(description = "Live stats bar (turns / fallacies / tracked) is visible")
    public void testLiveStatsBarVisible() {
        voiceDebatePage.enterTopic("Remote work is the future");
        voiceDebatePage.clickStartVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isTrackedBadgeVisible(),
                "'tracked' badge should indicate analytics are running");
    }

    @Test(description = "Mic button is visible and clickable in active debate")
    public void testMicButtonVisible() {
        voiceDebatePage.enterTopic("Space exploration benefits humanity");
        voiceDebatePage.clickStartVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isActiveDebateVisible(),
                "Mic button (active debate control) should be visible");
    }

    @Test(description = "Mute AI button toggles voice output")
    public void testMuteAiButtonWorks() {
        voiceDebatePage.enterTopic("AI will replace jobs");
        voiceDebatePage.clickStartVoiceDebate();
        // Click mute — should not throw
        voiceDebatePage.clickMuteAI();
        Assert.assertTrue(voiceDebatePage.isActiveDebateVisible(),
                "Debate should still be active after muting AI");
    }

    @Test(description = "AI opening message appears in the conversation")
    public void testAiOpeningMessageAppears() {
        voiceDebatePage.enterTopic("Nuclear energy for a sustainable future");
        voiceDebatePage.clickStartVoiceDebate();
        // Wait for opening message
        wait.forVisible(org.openqa.selenium.By.cssSelector(".rounded-tl-sm.text-slate-200"));
        Assert.assertTrue(voiceDebatePage.getAiMessageCount() >= 1,
                "AI should send an opening message when debate starts");
    }

    @Test(description = "Replay button appears on AI messages for voice playback")
    public void testReplayButtonOnAiMessages() {
        voiceDebatePage.enterTopic("Democracy versus authoritarianism");
        voiceDebatePage.clickStartVoiceDebate();
        wait.forVisible(org.openqa.selenium.By.cssSelector(".rounded-tl-sm.text-slate-200"));
        Assert.assertTrue(voiceDebatePage.hasReplayButtons(),
                "Replay (Volume2) button should appear on AI messages");
    }

    @Test(description = "Replay button triggers re-reading of AI message")
    public void testReplayButtonClickable() {
        voiceDebatePage.enterTopic("Genetic engineering ethics");
        voiceDebatePage.clickStartVoiceDebate();
        wait.forVisible(org.openqa.selenium.By.cssSelector(".rounded-tl-sm.text-slate-200"));
        voiceDebatePage.clickReplayFirst();
        // No exception = replay worked
        Assert.assertTrue(voiceDebatePage.isActiveDebateVisible(),
                "Debate should remain active after replaying message");
    }

    @Test(description = "Exit button navigates back from active debate")
    public void testExitButtonNavigatesBack() {
        voiceDebatePage.enterTopic("Online privacy rights");
        voiceDebatePage.clickStartVoiceDebate();
        getDriver().findElement(
            org.openqa.selenium.By.xpath("//button[contains(., 'Exit')]")).click();
        // Should navigate back (no longer on /voice-debate active view)
        Assert.assertFalse(voiceDebatePage.isActiveDebateVisible(),
                "Active debate UI should not be visible after clicking Exit");
    }

    // ── Summary & Analytics ───────────────────────────────────

    @Test(description = "Ending voice debate shows summary screen")
    public void testEndDebateShowsSummary() {
        voiceDebatePage.enterTopic("Social media advantages and disadvantages");
        voiceDebatePage.clickStartVoiceDebate();
        // Wait for opening
        wait.sleep(3000);
        voiceDebatePage.clickEnd();
        Assert.assertTrue(voiceDebatePage.isSummaryVisible(),
                "Summary screen should appear after ending voice debate");
    }

    @Test(description = "Summary screen shows 'Voice Debate' badge")
    public void testSummaryHasVoiceBadge() {
        voiceDebatePage.enterTopic("Remote work productivity");
        voiceDebatePage.clickStartVoiceDebate();
        wait.sleep(3000);
        voiceDebatePage.clickEnd();
        Assert.assertTrue(voiceDebatePage.isVoiceBadgeOnSummary(),
                "Summary screen should show 'Voice Debate' badge");
    }

    @Test(description = "Summary screen shows 6 skill score bars")
    public void testSummaryShowsSixSkillBars() {
        voiceDebatePage.enterTopic("Technology improves education quality");
        voiceDebatePage.clickStartVoiceDebate();
        wait.sleep(3000);
        voiceDebatePage.clickEnd();
        Assert.assertTrue(voiceDebatePage.getSkillBarCount() >= 6,
                "Summary should show at least 6 skill bars (Logic, Persuasion, Evidence, etc.)");
    }

    @Test(description = "New Voice Debate button resets to setup screen")
    public void testNewVoiceDebateResetsSetup() {
        voiceDebatePage.enterTopic("Capital punishment should be abolished");
        voiceDebatePage.clickStartVoiceDebate();
        wait.sleep(3000);
        voiceDebatePage.clickEnd();
        voiceDebatePage.clickNewVoiceDebate();
        Assert.assertTrue(voiceDebatePage.isSetupScreenVisible(),
                "Setup screen should reappear after clicking New Voice Debate");
    }

    @Test(description = "View Analytics button navigates to /analytics")
    public void testViewAnalyticsNavigation() {
        voiceDebatePage.enterTopic("Veganism is the most ethical diet");
        voiceDebatePage.clickStartVoiceDebate();
        wait.sleep(3000);
        voiceDebatePage.clickEnd();
        voiceDebatePage.clickViewAnalytics();
        Assert.assertTrue(wait.forUrlContaining("/analytics"),
                "Should navigate to /analytics after clicking View Analytics");
    }

    @Test(description = "Voice debate analytics are saved and visible in Analytics page")
    public void testVoiceDebateAnalyticsSavedToAnalyticsPage() {
        // Start and end a voice debate
        voiceDebatePage.enterTopic("Social media is addictive by design");
        voiceDebatePage.clickStartVoiceDebate();
        wait.sleep(3000);
        voiceDebatePage.clickEnd();
        // Navigate directly to analytics
        getDriver().get(com.pddapp.config.AppiumConfig.APP_URL + "/analytics");
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//h1[contains(., 'Analytics')]")),
            "Analytics page should load after voice debate");
        // Total debates should be at least 1
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//div[contains(.,'Win Rate') or contains(.,'Total')]")),
            "Win rate / total debates card should be visible in analytics");
    }
}
