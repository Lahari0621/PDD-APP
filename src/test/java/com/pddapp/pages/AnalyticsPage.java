package com.pddapp.pages;

import com.pddapp.utils.WaitUtils;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;

/**
 * Page Object for the Analytics screen (/analytics).
 */
public class AnalyticsPage {

    private final AndroidDriver driver;
    private final WaitUtils wait;

    private final By pageHeading       = By.xpath("//h1[contains(., 'Analytics')]");
    private final By winRateCard       = By.xpath("//div[contains(.,'Win Rate')]");
    private final By logicScoreCard    = By.xpath("//div[contains(.,'Logic Score')]");
    private final By streakCard        = By.xpath("//div[contains(.,'Streak')]");
    private final By xpCard            = By.xpath("//div[contains(.,'Total XP')]");
    private final By tierBadge         = By.xpath("//div[contains(.,'Tier')]");
    private final By radarChart        = By.cssSelector(".recharts-radar, [class*='RadarChart']");
    private final By lineChart         = By.cssSelector(".recharts-line, [class*='LineChart']");
    private final By pieChart          = By.cssSelector(".recharts-pie, [class*='PieChart']");
    private final By barChart          = By.cssSelector(".recharts-bar, [class*='BarChart']");
    private final By skillAssessment   = By.xpath("//h3[contains(., 'Skill Assessment')]");
    private final By scoreTrends       = By.xpath("//h3[contains(., 'Score Trends')]");
    private final By winLossPie        = By.xpath("//h3[contains(., 'Win')]");
    private final By categoryPerf      = By.xpath("//h3[contains(., 'Category')]");
    private final By fallacyBreakdown  = By.xpath("//h3[contains(., 'Fallacy')]");
    private final By coachingTip       = By.xpath("//span[contains(., 'Coaching Tip')]/..");
    private final By recentDebates     = By.xpath("//h3[contains(., 'Recent')]");
    private final By replayButtons     = By.cssSelector("a[href*='/replay/']");
    private final By noDataPlaceholder = By.xpath("//p[contains(., 'Complete debates') or contains(., 'No')]");

    public AnalyticsPage(AndroidDriver driver, WaitUtils wait) {
        this.driver = driver;
        this.wait   = wait;
    }

    public void navigateTo() {
        driver.get(com.pddapp.config.AppiumConfig.APP_URL + "/analytics");
    }

    public boolean isPageVisible()          { return wait.isVisible(pageHeading); }
    public boolean isWinRateVisible()       { return wait.isVisible(winRateCard); }
    public boolean isLogicScoreVisible()    { return wait.isVisible(logicScoreCard); }
    public boolean isStreakVisible()        { return wait.isVisible(streakCard); }
    public boolean isXpVisible()            { return wait.isVisible(xpCard); }
    public boolean isTierVisible()          { return wait.isVisible(tierBadge); }
    public boolean isSkillAssessment()      { return wait.isVisible(skillAssessment); }
    public boolean isScoreTrends()          { return wait.isVisible(scoreTrends); }
    public boolean isRadarChartVisible()    { return wait.isVisible(radarChart); }
    public boolean isLineChartVisible()     { return wait.isVisible(lineChart); }
    public boolean isPieChartVisible()      { return wait.isVisible(pieChart); }
    public boolean isFallacySection()       { return wait.isVisible(fallacyBreakdown); }
    public boolean isCoachingTipVisible()   { return wait.isVisible(coachingTip); }
    public boolean isRecentDebatesVisible() { return wait.isVisible(recentDebates); }
    public boolean hasReplayLinks()         { return !driver.findElements(replayButtons).isEmpty(); }

    public int getReplayLinkCount() {
        return driver.findElements(replayButtons).size();
    }

    public void clickFirstReplay() {
        if (!driver.findElements(replayButtons).isEmpty()) {
            driver.findElements(replayButtons).get(0).click();
        }
    }

    public String getWinRateValue() {
        return driver.findElement(winRateCard)
               .findElement(By.cssSelector(".text-2xl, .font-black")).getText();
    }
}
