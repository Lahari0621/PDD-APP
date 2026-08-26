package com.pddapp.listeners;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.pddapp.utils.TestUtils;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

/**
 * TestNG listener that builds an HTML Extent Report.
 * Reports land in test-output/ExtentReport.html.
 */
public class ExtentReportListener implements ITestListener {

    private static ExtentReports         extent;
    private static ThreadLocal<ExtentTest> testThread = new ThreadLocal<>();

    @Override
    public void onStart(ITestContext context) {
        ExtentSparkReporter spark = new ExtentSparkReporter("test-output/ExtentReport.html");
        spark.config().setTheme(Theme.DARK);
        spark.config().setDocumentTitle("PDD App – Appium Test Report");
        spark.config().setReportName("PDD App – Appium Test Results");

        extent = new ExtentReports();
        extent.attachReporter(spark);
        extent.setSystemInfo("OS",           System.getProperty("os.name"));
        extent.setSystemInfo("Java",         System.getProperty("java.version"));
        extent.setSystemInfo("Appium URL",   com.pddapp.config.AppiumConfig.APPIUM_URL);
        extent.setSystemInfo("Device",       com.pddapp.config.AppiumConfig.DEVICE_NAME);
        extent.setSystemInfo("Platform Ver", com.pddapp.config.AppiumConfig.PLATFORM_VER);
        extent.setSystemInfo("App URL",      com.pddapp.config.AppiumConfig.APP_URL);
    }

    @Override
    public void onTestStart(ITestResult result) {
        ExtentTest test = extent.createTest(
                result.getMethod().getMethodName(),
                result.getMethod().getDescription());
        testThread.set(test);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        testThread.get().log(Status.PASS, "Test PASSED");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        ExtentTest test = testThread.get();
        test.log(Status.FAIL, result.getThrowable());

        // Attach screenshot
        String path = TestUtils.captureScreenshot(result.getMethod().getMethodName());
        if (!path.isEmpty()) {
            try { test.addScreenCaptureFromPath(path); }
            catch (Exception ignored) {}
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        testThread.get().log(Status.SKIP, "Test SKIPPED — " + result.getThrowable());
    }

    @Override
    public void onFinish(ITestContext context) {
        if (extent != null) extent.flush();
    }
}
