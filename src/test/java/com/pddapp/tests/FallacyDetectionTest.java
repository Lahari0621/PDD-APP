package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.DebatePage;
import com.pddapp.utils.TestUtils;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Fallacy Detection Tests – validates real-time fallacy detection badges,
 * fallacy panel content, and the "Try Again" rewrite comparison feature.
 */
public class FallacyDetectionTest extends BaseTest {

    private DebatePage debatePage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        debatePage = new DebatePage(getDriver(), wait);
        debatePage.startDebate("Social media effects on society", "intermediate");
    }

    // ── Fallacy Detection ─────────────────────────────────────

    @Test(description = "Ad Hominem fallacy is detected in user message")
    public void testAdHominem() {
        debatePage.sendMessage("You are too stupid and ignorant to understand social media's impact.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Ad Hominem fallacy should be detected");
    }

    @Test(description = "Hasty Generalisation fallacy is detected")
    public void testHastyGeneralisation() {
        debatePage.sendMessage("All teenagers are addicted to social media and never study.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Hasty Generalisation should be detected for 'all teenagers'");
    }

    @Test(description = "Bandwagon fallacy is detected")
    public void testBandwagonFallacy() {
        debatePage.sendMessage("Everyone knows social media is bad; millions of people can't be wrong.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Bandwagon fallacy should be detected");
    }

    @Test(description = "Slippery Slope fallacy is detected")
    public void testSlipperySlope() {
        debatePage.sendMessage("If we allow social media, then soon everyone will stop working and before you know it society will collapse.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Slippery Slope fallacy should be detected");
    }

    @Test(description = "Straw Man fallacy is detected")
    public void testStrawMan() {
        debatePage.sendMessage("So you're saying we should allow children to be exposed to all harmful content online.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Straw Man fallacy should be detected");
    }

    @Test(description = "Appeal to Emotion fallacy is detected")
    public void testAppealToEmotion() {
        debatePage.sendMessage("Think of the children — how could you support something that devastates families?");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "Appeal to Emotion fallacy should be detected");
    }

    @Test(description = "False Dilemma fallacy is detected")
    public void testFalseDilemma() {
        debatePage.sendMessage("Either you support social media completely or you want everyone to be isolated.");
        debatePage.waitForAiResponse();
        Assert.assertTrue(debatePage.hasFallacyDetected(),
                "False Dilemma fallacy should be detected");
    }

    @Test(description = "Strong logical argument does not trigger false-positive fallacy")
    public void testNoFallacyForLogicalArgument() {
        debatePage.sendMessage(
            "A 2023 study by Stanford researchers found that students who spent more than 3 hours daily on social media showed a 15% reduction in academic performance, controlling for socioeconomic factors.");
        debatePage.waitForAiResponse();
        // Well-structured argument should not be flagged as a fallacy
        Assert.assertFalse(debatePage.hasFallacyDetected(),
                "A well-evidenced logical argument should not be flagged as a fallacy");
    }

    // ── Fallacy Panel ─────────────────────────────────────────

    @Test(description = "Fallacy badge displays fallacy name")
    public void testFallacyBadgeDisplaysName() {
        debatePage.sendMessage("You are too dumb and naive to understand this topic.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            String badgeText = getDriver()
                .findElements(By.cssSelector("button[class*='rounded-full'][style*='color']"))
                .get(0).getText();
            Assert.assertFalse(badgeText.isEmpty(),
                    "Fallacy badge should display the fallacy name");
        }
    }

    @Test(description = "Clicking fallacy badge opens the fallacy detail panel")
    public void testFallacyPanelOpensOnBadgeClick() {
        debatePage.sendMessage("Everyone believes social media is harmful — millions can't be wrong.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            Assert.assertTrue(
                wait.isVisible(By.cssSelector(".fixed.right-4, [class*='fixed'][class*='right']")),
                "Fallacy detail panel should slide in after clicking badge");
        }
    }

    @Test(description = "Fallacy panel contains description text")
    public void testFallacyPanelContainsDescription() {
        debatePage.sendMessage("If we allow this, the next thing you know democracy will be gone forever.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            Assert.assertTrue(
                wait.isVisible(By.cssSelector(".text-slate-300.text-xs.leading-relaxed")),
                "Fallacy panel should show a description of the fallacy");
        }
    }

    @Test(description = "Fallacy panel shows correction suggestion")
    public void testFallacyPanelShowsCorrection() {
        debatePage.sendMessage("You don't even understand what you're talking about.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            Assert.assertTrue(
                wait.isVisible(By.cssSelector(".bg-success\\/10, [class*='success\\/10']")),
                "Fallacy panel should show a correction suggestion");
        }
    }

    @Test(description = "Fallacy panel shows confidence score bar")
    public void testFallacyPanelConfidenceBar() {
        debatePage.sendMessage("All politicians are corrupt and they always lie.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            Assert.assertTrue(
                wait.isVisible(By.cssSelector(".h-1\\.5.bg-white\\/10, [class*='h-1']")),
                "Confidence score bar should appear in fallacy panel");
        }
    }

    @Test(description = "Fallacy panel can be closed")
    public void testFallacyPanelCloses() {
        debatePage.sendMessage("Everyone knows and believes that social media is always harmful.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            // Click close X button
            getDriver().findElement(By.cssSelector(".text-slate-500.hover\\:text-white")).click();
            Assert.assertFalse(
                wait.isVisible(By.cssSelector(".fixed.right-4, [class*='fixed'][class*='right']")),
                "Fallacy panel should be hidden after clicking close");
        }
    }

    // ── Try Again (Rewrite) ───────────────────────────────────

    @Test(description = "Try Again button appears in fallacy panel")
    public void testTryAgainButtonVisible() {
        debatePage.sendMessage("You are too stupid to understand this argument.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            Assert.assertTrue(
                wait.isVisible(By.xpath("//button[contains(.,'Try Again')]")),
                "Try Again button should be visible in the fallacy panel");
        }
    }

    @Test(description = "Try Again expands rewrite textarea when clicked")
    public void testTryAgainExpandsTextarea() {
        debatePage.sendMessage("Everyone knows social media is always bad.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            if (wait.isVisible(By.xpath("//button[contains(.,'Try Again')]"))) {
                getDriver().findElement(By.xpath("//button[contains(.,'Try Again')]")).click();
                Assert.assertTrue(
                    wait.isVisible(By.cssSelector("textarea[placeholder*='stronger']")),
                    "Rewrite textarea should appear after clicking Try Again");
            }
        }
    }

    @Test(description = "Submitting rewritten argument shows comparison result")
    public void testTryAgainComparison() {
        debatePage.sendMessage("All teenagers are addicted to social media and never study.");
        debatePage.waitForAiResponse();
        if (debatePage.hasFallacyDetected()) {
            debatePage.clickFirstFallacyBadge();
            if (wait.isVisible(By.xpath("//button[contains(.,'Try Again')]"))) {
                getDriver().findElement(By.xpath("//button[contains(.,'Try Again')]")).click();
                // Enter improved version
                getDriver().findElement(By.cssSelector("textarea[placeholder*='stronger']"))
                    .sendKeys("Research shows that a significant proportion of teenagers spend excessive time on social media, which correlates with reduced study hours.");
                getDriver().findElement(By.xpath("//button[contains(.,'Compare')]")).click();
                // Comparison result should appear
                Assert.assertTrue(
                    wait.isVisible(By.cssSelector(".text-xs.p-2.rounded-lg")),
                    "Comparison result should appear after submitting rewritten argument");
            }
        }
    }
}
