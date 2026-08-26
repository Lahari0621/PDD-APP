# PDD App – Appium Test Suite

End-to-end mobile automation tests for the **AI Debate Partner** web app,
written in **Java + Appium + TestNG**.

---

## Project Structure

```
PDD-APP/
├── pom.xml                          Maven build file
├── testng.xml                       TestNG suite config
└── src/test/java/com/pddapp/
    ├── config/
    │   └── AppiumConfig.java        Appium driver + capabilities setup
    ├── base/
    │   └── BaseTest.java            Test lifecycle (setup / teardown)
    ├── pages/                       Page Object Model classes
    │   ├── LoginPage.java
    │   ├── RegisterPage.java
    │   ├── DebatePage.java
    │   ├── VoiceDebatePage.java
    │   ├── QuizPage.java
    │   ├── AnalyticsPage.java
    │   ├── AiVsAiPage.java
    │   ├── TopicGeneratorPage.java
    │   └── ProfilePage.java
    ├── tests/                       Test classes (one per feature)
    │   ├── AuthTest.java            15 tests  – login & registration
    │   ├── DebateTest.java          17 tests  – text debate full flow
    │   ├── VoiceDebateTest.java     18 tests  – voice debate + analytics
    │   ├── QuizTest.java            16 tests  – quiz & learning hub
    │   ├── AnalyticsTest.java       18 tests  – analytics dashboard
    │   ├── AiVsAiTest.java          15 tests  – AI vs AI debate
    │   ├── TopicGeneratorTest.java  15 tests  – topic generator
    │   ├── ProfileTest.java         14 tests  – profile & logout
    │   ├── FallacyDetectionTest.java 15 tests – fallacy detection & Try Again
    │   └── NavigationTest.java      17 tests  – routing & protected routes
    ├── utils/
    │   ├── WaitUtils.java           Centralised explicit wait helpers
    │   └── TestUtils.java           Screenshots, login helper, unique data gen
    └── listeners/
        └── ExtentReportListener.java HTML report builder
```

**Total: ~160 automated test cases**

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 11+ |
| Maven | 3.8+ |
| Appium Server | 2.x |
| Android Emulator / Device | API 30+ (Android 11+) |
| Chrome on device | Latest |
| ChromeDriver | Matching Chrome version |
| Node.js | 18+ (for Appium) |

### Install Appium 2

```bash
npm install -g appium
appium driver install uiautomator2
appium plugin install --source=npm appium-chromedriver-autodownload
```

---

## Configuration

All settings can be overridden via Maven `-D` system properties:

| Property | Default | Description |
|----------|---------|-------------|
| `appium.url` | `http://localhost:4723` | Appium server URL |
| `device.name` | `emulator-5554` | ADB device name |
| `platform.ver` | `13.0` | Android platform version |
| `app.url` | `http://10.0.2.2:5173` | Web app URL (10.0.2.2 = host from emulator) |
| `test.email` | `testuser@pddapp.com` | Login email for test user |
| `test.password` | `Test@1234` | Login password for test user |

---

## Running the Tests

### 1. Start the app (on your machine)

```bash
# Backend
cd ai-debate-partner/backend && npm run dev

# Frontend
cd ai-debate-partner/frontend && npm run dev
```

### 2. Start Appium server

```bash
appium --port 4723
```

### 3. Start Android emulator

```bash
emulator -avd Pixel_7_API_33
```

### 4. Run all tests

```bash
cd PDD-APP
mvn test
```

### 5. Run a specific test class

```bash
mvn test -Dtest=VoiceDebateTest
mvn test -Dtest=AuthTest
mvn test -Dtest=AnalyticsTest
```

### 6. Override device/URL

```bash
mvn test \
  -Dappium.url=http://localhost:4723 \
  -Ddevice.name=emulator-5554 \
  -Dapp.url=http://10.0.2.2:5173 \
  -Dtest.email=myuser@test.com \
  -Dtest.password=MyPass123
```

---

## Test Reports

After a test run, open:

```
test-output/ExtentReport.html
```

This is a dark-themed HTML report with pass/fail status, test descriptions,
screenshots on failure, and system information.

---

## Test Coverage

| Module | Tests | What's Covered |
|--------|-------|----------------|
| Authentication | 15 | Login, register, validation, errors, links |
| Text Debate | 17 | Setup, modes, AI response, turns, end, summary |
| Voice Debate | 18 | Setup, mic UI, avatar, stats, replay, summary, analytics |
| Quiz | 16 | Questions, answers, feedback, hints, results, history |
| Analytics | 18 | All chart sections, overview cards, replay links, voice debate data |
| AI vs AI | 15 | Generation, combatants, rounds, play animation, judgment |
| Topic Generator | 15 | Categories, difficulty, PRO/CON, arguments, Debate link |
| Profile | 14 | Stats, achievements, edit bio, logout, protected route |
| Fallacy Detection | 15 | 7 fallacy types, panel, correction, Try Again, comparison |
| Navigation | 17 | Protected routes, navbar, 404, post-login links |
