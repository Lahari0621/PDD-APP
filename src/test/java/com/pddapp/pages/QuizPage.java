package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Quiz / Learning Hub screen (/learn).
 */
public class QuizPage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    // ── Learning Hub ──────────────────────────────────────────
    private final By pageHeading        = By.xpath("//h1[contains(., 'Learn') or contains(., 'Hub')]");
    private final By startQuizBtn       = By.xpath("//button[contains(., 'Start Quiz') or contains(., 'Take Quiz')]");
    private final By moduleCards        = By.cssSelector("[class*='glass-card'], .glass.rounded");
    private final By difficultyFilters  = By.cssSelector("button.capitalize.rounded-xl");
    private final By weaknessQuizBtn    = By.xpath("//button[contains(., 'Weakness') or contains(., 'weakness')]");

    // ── Active quiz ───────────────────────────────────────────
    private final By questionText       = By.cssSelector("[class*='font-bold'][class*='text-white'], .text-lg, .text-xl");
    private final By answerOptions      = By.cssSelector("button[class*='option'], button[class*='answer'], .glass button");
    private final By nextBtn            = By.xpath("//button[contains(., 'Next')]");
    private final By submitBtn          = By.xpath("//button[contains(., 'Submit') or contains(., 'Finish')]");
    private final By hintBtn            = By.xpath("//button[contains(., 'Hint')]");
    private final By hintText           = By.cssSelector("[class*='hint'], .text-warning");
    private final By progressBar        = By.cssSelector("[class*='score-bar'], [class*='progress']");
    private final By questionCounter    = By.cssSelector("[class*='font-semibold'][class*='text-slate']");
    private final By correctFeedback    = By.cssSelector("[class*='success'], .text-success");
    private final By incorrectFeedback  = By.cssSelector("[class*='error'], .text-error");
    private final By explanationText    = By.cssSelector("[class*='explanation'], .text-slate-300");

    // ── Results screen ────────────────────────────────────────
    private final By scoreDisplay       = By.xpath("//div[contains(@class,'font-black') and (contains(.,'%') or contains(.,'/'))]");
    private final By xpEarned          = By.xpath("//div[contains(., 'XP') and contains(@class,'text-warning')]");
    private final By accuracyDisplay    = By.xpath("//div[contains(., 'Accuracy') or contains(., 'accuracy')]");
    private final By retryBtn           = By.xpath("//button[contains(., 'Try Again') or contains(., 'Retry')]");
    private final By reviewAnswersBtn   = By.xpath("//button[contains(., 'Review')]");
    private final By historySection     = By.xpath("//h3[contains(., 'History') or contains(., 'history')]");

    public QuizPage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/learn");
    }

    public boolean isLearnPageVisible() {
        return wait.isVisible(pageHeading);
    }

    public void clickStartQuiz() {
        wait.forClickable(startQuizBtn).click();
    }

    public void clickWeaknessQuiz() {
        if (wait.isVisible(weaknessQuizBtn)) {
            wait.forClickable(weaknessQuizBtn).click();
        }
    }

    public boolean isQuestionVisible() {
        return wait.isVisible(questionText);
    }

    public String getQuestionText() {
        return wait.forVisible(questionText).getText();
    }

    public int getAnswerOptionCount() {
        return driver.findElements(answerOptions).size();
    }

    public void selectAnswer(int index) {
        List<WebElement> options = driver.findElements(answerOptions);
        if (index < options.size()) {
            options.get(index).click();
        }
    }

    public void selectFirstAnswer() { selectAnswer(0); }

    public boolean isCorrectFeedbackVisible() { return wait.isVisible(correctFeedback); }
    public boolean isIncorrectFeedbackVisible(){ return wait.isVisible(incorrectFeedback); }
    public boolean isExplanationVisible()      { return wait.isVisible(explanationText); }

    public void clickNext() { wait.forClickable(nextBtn).click(); }
    public void clickSubmit() { wait.forClickable(submitBtn).click(); }

    public void clickHint() {
        if (wait.isVisible(hintBtn)) wait.forClickable(hintBtn).click();
    }

    public boolean isHintVisible() { return wait.isVisible(hintText); }

    public boolean isResultsVisible() { return wait.isVisible(scoreDisplay); }
    public String getScore()          { return wait.forVisible(scoreDisplay).getText(); }
    public String getXpEarned()       { return wait.forVisible(xpEarned).getText(); }

    public void clickRetry()         { wait.forClickable(retryBtn).click(); }
    public void clickReviewAnswers() { wait.forClickable(reviewAnswersBtn).click(); }

    public boolean isHistorySectionVisible() { return wait.isVisible(historySection); }

    /** Answer all questions in a quiz with the first option. */
    public void completeQuizWithFirstOption(int maxQuestions) {
        for (int i = 0; i < maxQuestions; i++) {
            if (!isQuestionVisible()) break;
            selectFirstAnswer();
            if (wait.isVisible(nextBtn)) clickNext();
            else if (wait.isVisible(submitBtn)) { clickSubmit(); break; }
        }
    }
}
