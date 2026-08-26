# AI Debate Partner – PDD App

A full-stack AI-powered debate training platform with voice debate, fallacy detection, analytics, and quiz modules.

[![Deploy to GitHub Pages](https://github.com/Lahari0621/PDD-APP/actions/workflows/deploy.yml/badge.svg)](https://github.com/Lahari0621/PDD-APP/actions/workflows/deploy.yml)
[![Appium Tests](https://github.com/Lahari0621/PDD-APP/actions/workflows/appium-tests.yml/badge.svg)](https://github.com/Lahari0621/PDD-APP/actions/workflows/appium-tests.yml)

---

## Project Structure

```
PDD-APP/
├── frontend/               React + Vite + TypeScript (deployed to GitHub Pages)
├── backend/                Node.js + Express + MongoDB + Gemini AI
├── android-app/            Android native app (Kotlin)
├── src/test/java/          Appium test suite (Java + TestNG)
├── pom.xml                 Maven build for Appium tests
├── testng.xml              TestNG suite config
└── .github/workflows/
    ├── deploy.yml          GitHub Pages deployment
    └── appium-tests.yml    Appium CI compile check
```

---

## Features

- **Text Debate** – Classic, Cross-Examination, and Rapid Fire modes with AI coach Aria
- **Voice Debate** – Speak your arguments; Aria listens and responds with speech synthesis
- **AI vs AI** – Watch two AI debaters argue any topic with full judgment breakdown
- **Fallacy Detection** – Real-time detection of 10+ logical fallacies with Try Again rewrite
- **Argument Strength Meter** – Live scoring of Logic, Evidence, Relevance, Persuasion, Clarity
- **Quiz / Learning Hub** – 104 questions across difficulty levels with weakness-based mode
- **Analytics Dashboard** – Skill radar, score trends, win/loss pie, fallacy breakdown, XP
- **Topic Generator** – AI-generated debate topics with PRO/CON positions and arguments

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI | Google Gemini 2.5 Flash |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io |
| Mobile Tests | Appium 2, Java, TestNG, ExtentReports |

---

## Frontend Setup (Local)

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:5000
npm run dev                 # http://localhost:5173
```

## Backend Setup (Local)

```bash
cd backend
npm install
cp .env.example .env        # fill in MONGODB_URI, GEMINI_API_KEY, JWT_SECRET
npm run dev                 # http://localhost:5000
```

---

## GitHub Pages Deployment

The frontend is automatically built and deployed to GitHub Pages on every push to `main`.

**Setup steps (one-time):**
1. Go to repo **Settings → Pages**
2. Source: **GitHub Actions**
3. The `deploy.yml` workflow handles the rest

**Live URL:** `https://lahari0621.github.io/PDD-APP/`

> Note: GitHub Pages serves static files only. The backend must be deployed separately (e.g. Railway, Render, or Vercel) and the `VITE_API_URL` secret set in repo settings.

---

## Appium Test Suite

160+ automated test cases covering all app features.

### Test Modules

| Module | Tests |
|--------|-------|
| AuthTest | 15 |
| DebateTest | 17 |
| VoiceDebateTest | 18 |
| QuizTest | 16 |
| AnalyticsTest | 18 |
| AiVsAiTest | 15 |
| TopicGeneratorTest | 15 |
| ProfileTest | 14 |
| FallacyDetectionTest | 15 |
| NavigationTest | 17 |

### Running Tests

```bash
# Prerequisites: Appium 2 running, Android emulator/device connected
appium --port 4723

# Run all tests
mvn test

# Run specific module
mvn test -Dtest=VoiceDebateTest

# Custom device/URL
mvn test -Ddevice.name=emulator-5554 -Dapp.url=http://10.0.2.2:5173
```

Report: `test-output/ExtentReport.html`
