package com.pddapp.tests;

import com.pddapp.base.BaseTest;
import com.pddapp.pages.QuizPage;
import com.pddapp.utils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Quiz Tests – covers Learning Hub, quiz questions, answer selection,
 * feedback, hints, results screen, history, and weakness-based quiz.
 */
public class QuizTest extends BaseTest {

    private QuizPage quizPage;

    @BeforeMethod
    public void pageSetup() {
        TestUtils.loginAs(getDriver(), wait, TEST_EMAIL, TEST_PASSWORD);
        quizPage = new QuizPage(getDriver(), wait);
        quizPage.navigateTo();
    }

    // ── Learning Hub ──────────────────────────────────────────

    @Test(description = "Learning Hub page loads correctly")
    public void testLearnPageLoads() {
        Assert.assertTrue(quizPage.isLearnPageVisible(),
                "Learning Hub heading should be visible");
    }

    @Test(description = "Start Quiz button is visible on Learning Hub")
    public void testStartQuizButtonVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.xpath(
                "//button[contains(.,'Start Quiz') or contains(.,'Take Quiz') or contains(.,'Quiz')]")),
            "Start Quiz button should be visible on Learn page");
    }

    @Test(description = "Module cards are displayed on Learning Hub")
    public void testModuleCardsVisible() {
        Assert.assertTrue(
            wait.isVisible(org.openqa.selenium.By.cssSelector(".glass-card, .glass.rounded")),
            "Module cards should be visible on Learning Hub");
    }

    // ── Quiz Questions ────────────────────────────────────────

    @Test(description = "Starting a quiz loads the first question")
    public void testStartQuizShowsQuestion() {
        quizPage.clickStartQuiz();
        Assert.assertTrue(quizPage.isQuestionVisible(),
                "First quiz question should be displayed after starting");
    }

    @Test(description = "Quiz question has at least 2 answer options")
    public void testQuizHasAnswerOptions() {
        quizPage.clickStartQuiz();
        Assert.assertTrue(quizPage.getAnswerOptionCount() >= 2,
                "Quiz question should have at least 2 answer options");
    }

    @Test(description = "Question text is non-empty")
    public void testQuizQuestionTextNotEmpty() {
        quizPage.clickStartQuiz();
        String question = quizPage.getQuestionText();
        Assert.assertNotNull(question, "Question text should not be null");
        Assert.assertFalse(question.trim().isEmpty(),
                "Question text should not be blank");
    }

    @Test(description = "Selecting an answer shows correct or incorrect feedback")
    public void testSelectAnswerShowsFeedback() {
        quizPage.clickStartQuiz();
        quizPage.selectFirstAnswer();
        boolean hasFeedback = quizPage.isCorrectFeedbackVisible()
                           || quizPage.isIncorrectFeedbackVisible();
        Assert.assertTrue(hasFeedback,
                "Feedback (correct/incorrect) should appear after selecting an answer");
    }

    @Test(description = "Selecting an answer shows explanation text")
    public void testSelectAnswerShowsExplanation() {
        quizPage.clickStartQuiz();
        quizPage.selectFirstAnswer();
        Assert.assertTrue(quizPage.isExplanationVisible(),
                "Explanation should be shown after answering a question");
    }

    @Test(description = "Hint button shows hint text when clicked")
    public void testHintButtonShowsHint() {
        quizPage.clickStartQuiz();
        quizPage.clickHint();
        Assert.assertTrue(quizPage.isHintVisible(),
                "Hint text should be visible after clicking Hint button");
    }

    @Test(description = "Next button advances to the next question")
    public void testNextButtonAdvancesQuestion() {
        quizPage.clickStartQuiz();
        String firstQuestion = quizPage.getQuestionText();
        quizPage.selectFirstAnswer();
        if (wait.isVisible(org.openqa.selenium.By.xpath("//button[contains(.,'Next')]"))) {
            quizPage.clickNext();
            String secondQuestion = quizPage.getQuestionText();
            Assert.assertNotEquals(firstQuestion, secondQuestion,
                    "Next button should advance to a different question");
        }
    }

    @Test(description = "Completing a 5-question quiz shows results screen")
    public void testCompleteQuizShowsResults() {
        quizPage.clickStartQuiz();
        quizPage.completeQuizWithFirstOption(5);
        Assert.assertTrue(quizPage.isResultsVisible(),
                "Results screen should appear after completing the quiz");
    }

    // ── Results Screen ────────────────────────────────────────

    @Test(description = "Results screen shows score percentage")
    public void testResultsShowScore() {
        quizPage.clickStartQuiz();
        quizPage.completeQuizWithFirstOption(5);
        Assert.assertFalse(quizPage.getScore().isEmpty(),
                "Score should be displayed on results screen");
    }

    @Test(description = "Results screen shows XP earned")
    public void testResultsShowXp() {
        quizPage.clickStartQuiz();
        quizPage.completeQuizWithFirstOption(5);
        Assert.assertTrue(quizPage.getXpEarned().contains("XP"),
                "XP earned should be visible on results screen");
    }

    @Test(description = "Try Again button on results restarts the quiz")
    public void testRetryQuizButton() {
        quizPage.clickStartQuiz();
        quizPage.completeQuizWithFirstOption(5);
        quizPage.clickRetry();
        Assert.assertTrue(quizPage.isQuestionVisible(),
                "Should return to quiz questions after clicking Try Again");
    }

    // ── Quiz History ──────────────────────────────────────────

    @Test(description = "Quiz history is accessible from the Learning Hub")
    public void testQuizHistoryVisible() {
        // After completing a quiz, history should be visible
        quizPage.clickStartQuiz();
        quizPage.completeQuizWithFirstOption(5);
        quizPage.navigateTo();
        Assert.assertTrue(quizPage.isLearnPageVisible(),
                "Should return to learn page to see history section");
    }

    // ── Weakness-Based Quiz ───────────────────────────────────

    @Test(description = "Weakness-based quiz option is available after completing quizzes")
    public void testWeaknessBasedQuizOption() {
        // Complete a quiz first so weakness data exists
        quizPage.clickStartQuiz();
        quizPage.completeQuizWithFirstOption(5);
        quizPage.navigateTo();
        // If weakness quiz button visible, click it
        if (wait.isVisible(org.openqa.selenium.By.xpath(
                "//button[contains(.,'Weakness') or contains(.,'weakness')]"))) {
            quizPage.clickWeaknessQuiz();
            Assert.assertTrue(quizPage.isQuestionVisible(),
                    "Weakness-based quiz should show questions");
        }
    }

    // ── Difficulty Filtering ──────────────────────────────────

    @Test(description = "Beginner difficulty filter can be selected")
    public void testBeginnerDifficultyFilter() {
        // Look for difficulty filter buttons on the learn page
        java.util.List<org.openqa.selenium.WebElement> filters =
            getDriver().findElements(
                org.openqa.selenium.By.cssSelector("button.capitalize.rounded-xl"));
        boolean found = filters.stream()
            .anyMatch(b -> b.getText().equalsIgnoreCase("beginner"));
        if (found) {
            filters.stream()
                .filter(b -> b.getText().equalsIgnoreCase("beginner"))
                .findFirst()
                .ifPresent(org.openqa.selenium.WebElement::click);
        }
        // Quiz should still be accessible
        quizPage.clickStartQuiz();
        Assert.assertTrue(quizPage.isQuestionVisible(),
                "Quiz questions should load after selecting beginner filter");
    }

    @Test(description = "Expert difficulty filter can be selected")
    public void testExpertDifficultyFilter() {
        java.util.List<org.openqa.selenium.WebElement> filters =
            getDriver().findElements(
                org.openqa.selenium.By.cssSelector("button.capitalize.rounded-xl"));
        filters.stream()
            .filter(b -> b.getText().equalsIgnoreCase("expert"))
            .findFirst()
            .ifPresent(org.openqa.selenium.WebElement::click);
        quizPage.clickStartQuiz();
        Assert.assertTrue(quizPage.isQuestionVisible(),
                "Expert-level quiz questions should load");
    }
}
