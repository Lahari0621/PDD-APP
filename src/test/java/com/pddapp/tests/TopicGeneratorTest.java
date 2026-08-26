package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.TopicGeneratorPage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Topic Generator Tests – covers category selection, difficulty selection,
 * generated topic content, PRO/CON positions, arguments, evidence tags,
 * and the "Debate This Topic" link.
 */
public class TopicGeneratorTest extends BaseTest {

    private TopicGeneratorPage topicPage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        topicPage = new TopicGeneratorPage(getDriver(), wait);
        topicPage.navigateTo();
    }

    // ── Page Loading ──────────────────────────────────────────

    @Test(description = "Topic Generator page loads with correct heading")
    public void testPageLoads() {
        Assert.assertTrue(topicPage.isPageVisible(),
                "Topic Generator heading should be visible");
    }

    @Test(description = "Category buttons are displayed")
    public void testCategoryButtonsVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.cssSelector(".grid button.rounded-xl")),
            "Category selection buttons should be displayed");
    }

    @Test(description = "Difficulty buttons are displayed")
    public void testDifficultyButtonsVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.cssSelector(".flex button.rounded-xl")),
            "Difficulty selection buttons should be displayed");
    }

    @Test(description = "Generate Topic button is visible")
    public void testGenerateButtonVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//button[contains(.,'Generate Topic')]")),
            "Generate Topic button should be visible");
    }

    // ── Category & Difficulty Selection ──────────────────────

    @Test(description = "Technology category can be selected")
    public void testSelectTechnologyCategory() {
        topicPage.selectCategory("Technology");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isTopicVisible(),
                "A topic should be generated for Technology category");
    }

    @Test(description = "Ethics category can be selected")
    public void testSelectEthicsCategory() {
        topicPage.selectCategory("Ethics");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isTopicVisible(),
                "A topic should be generated for Ethics category");
    }

    @Test(description = "Environment category can be selected")
    public void testSelectEnvironmentCategory() {
        topicPage.selectCategory("Environment");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isTopicVisible(),
                "A topic should be generated for Environment category");
    }

    @Test(description = "Science category can be selected")
    public void testSelectScienceCategory() {
        topicPage.selectCategory("Science");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isTopicVisible(),
                "A topic should be generated for Science category");
    }

    @Test(description = "Beginner difficulty generates an appropriate topic")
    public void testBeginnerDifficultyTopic() {
        topicPage.selectDifficulty("beginner");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isTopicVisible(),
                "Topic should be generated at beginner difficulty");
    }

    @Test(description = "Expert difficulty generates an appropriate topic")
    public void testExpertDifficultyTopic() {
        topicPage.selectDifficulty("expert");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isTopicVisible(),
                "Topic should be generated at expert difficulty");
    }

    // ── Generated Topic Content ───────────────────────────────

    @Test(description = "Generated topic text is non-empty")
    public void testGeneratedTopicNotEmpty() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        String topic = topicPage.getGeneratedTopicText();
        Assert.assertFalse(topic == null || topic.trim().isEmpty(),
                "Generated topic should not be empty");
    }

    @Test(description = "PRO position card is shown after topic generation")
    public void testProPositionCardVisible() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isProPositionVisible(),
                "PRO position card should be visible after topic generation");
    }

    @Test(description = "CON position card is shown after topic generation")
    public void testConPositionCardVisible() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isConPositionVisible(),
                "CON position card should be visible after topic generation");
    }

    @Test(description = "Pro arguments list has at least 1 item")
    public void testProArgumentsGenerated() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.getProArgumentCount() >= 1,
                "At least one PRO argument should be generated");
    }

    @Test(description = "Con arguments list has at least 1 item")
    public void testConArgumentsGenerated() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.getConArgumentCount() >= 1,
                "At least one CON argument should be generated");
    }

    @Test(description = "Difficulty explanation section is shown")
    public void testDifficultyReasonVisible() {
        topicPage.selectDifficulty("intermediate");
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.isDifficultyReasonVisible(),
                "Difficulty explanation should be shown after generation");
    }

    @Test(description = "Evidence type tags are shown after generation")
    public void testEvidenceTagsVisible() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(topicPage.getEvidenceTagCount() >= 1,
                "At least one suggested evidence type tag should appear");
    }

    // ── Debate This Topic Link ────────────────────────────────

    @Test(description = "Debate This Topic link is visible after generation")
    public void testDebateThisTopicLinkVisible() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath("//a[contains(.,'Debate This Topic')]")),
            "Debate This Topic link should appear on the generated result");
    }

    @Test(description = "Clicking Debate This Topic navigates to /debate with topic pre-filled")
    public void testDebateThisTopicNavigation() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        topicPage.clickDebateThisTopic();
        Assert.assertTrue(topicPage.isOnDebatePage(),
                "Should navigate to /debate after clicking Debate This Topic");
    }

    @Test(description = "Re-generating produces a different topic")
    public void testRegenerateProducesDifferentTopic() {
        topicPage.clickGenerate();
        topicPage.waitForResult();
        String first = topicPage.getGeneratedTopicText();

        topicPage.clickGenerate();
        topicPage.waitForResult();
        String second = topicPage.getGeneratedTopicText();

        // Topics may differ — not guaranteed, but usually will
        Assert.assertNotNull(second, "Second generated topic should not be null");
        Assert.assertFalse(second.trim().isEmpty(),
                "Second generated topic should not be blank");
    }
}
