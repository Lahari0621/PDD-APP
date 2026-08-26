const quizService = require('../services/quiz.service');
const QuizQuestion = require('../models/QuizQuestion.model');
const QuizResult   = require('../models/QuizResult.model');

// ── GET /api/quiz/questions ────────────────────────────────────
// Returns a randomised set of questions for the logged-in user.
// Query params: difficulty, category, module, count (default 5), mode
const getQuestions = async (req, res) => {
  try {
    const { difficulty, category, module: mod, count = 5, mode = 'random' } = req.query;
    const userId = req.user._id;

    const questions = await quizService.selectQuestions({
      userId,
      difficulty,
      category,
      module: mod,
      count:  Math.min(parseInt(count) || 5, 20), // cap at 20
      mode,
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for the selected criteria.' });
    }

    // Strip correctAnswer before sending to client (prevent cheating)
    const sanitized = questions.map(q => ({
      _id:         q._id,
      question:    q.question,
      options:     q.options,
      hint:        q.hint,
      category:    q.category,
      module:      q.module,
      difficulty:  q.difficulty,
      // correctAnswer intentionally omitted
    }));

    res.json({ success: true, questions: sanitized, total: sanitized.length });
  } catch (error) {
    console.error('getQuestions error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz questions.' });
  }
};

// ── POST /api/quiz/result ──────────────────────────────────────
// Submit answers; returns score, correctAnswers, explanations, weak areas.
const submitResult = async (req, res) => {
  try {
    const { answers, timeSpent = 0, quizType, difficulty, category } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers array is required.' });
    }

    // Fetch the actual questions from DB to verify answers server-side
    const ids = answers.map(a => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: ids } }).lean();

    if (questions.length === 0) {
      return res.status(400).json({ error: 'No matching questions found.' });
    }

    const qMap = {};
    questions.forEach(q => { qMap[q._id.toString()] = q; });

    // Build verified answer records
    const verifiedAnswers = answers
      .filter(a => qMap[a.questionId])
      .map(a => {
        const q = qMap[a.questionId];
        const isCorrect = parseInt(a.selectedAnswer) === q.correctAnswer;
        return {
          questionId:    a.questionId,
          userAnswer:    String(a.selectedAnswer),
          correctAnswer: String(q.correctAnswer),
          isCorrect,
          // Include explanation and correctText for the result screen
          explanation:   q.explanation,
          correctText:   q.options[q.correctAnswer],
          questionText:  q.question,
          category:      q.category,
        };
      });

    const { result, score, correctAnswers, xpEarned } = await quizService.saveQuizResult({
      userId,
      answers:   verifiedAnswers,
      questions,
      timeSpent,
      quizType,
      difficulty,
      category,
    });

    // Determine weak areas from this quiz
    const wrongCategories = [...new Set(
      verifiedAnswers.filter(a => !a.isCorrect).map(a => a.category)
    )];

    // Recommend next module
    const weakAreas = await quizService.getWeakAreas(userId);
    const recommended = weakAreas.length > 0
      ? weakAreas[0].category.replace(/_/g, ' ')
      : null;

    res.json({
      success: true,
      result: {
        id:              result._id,
        score,
        totalQuestions:  questions.length,
        correctAnswers,
        incorrectAnswers: questions.length - correctAnswers,
        accuracy:        score,
        xpEarned,
        timeSpent,
        answers:         verifiedAnswers,
        weakCategories:  wrongCategories,
        recommendedNext: recommended,
      },
    });
  } catch (error) {
    console.error('submitResult error:', error);
    res.status(500).json({ error: 'Failed to save quiz result.' });
  }
};

// ── GET /api/quiz/weakness-based ───────────────────────────────
const getWeaknessQuiz = async (req, res) => {
  try {
    const { count = 5, difficulty } = req.query;
    const userId = req.user._id;

    const weakAreas = await quizService.getWeakAreas(userId);

    let questions;
    if (weakAreas.length > 0) {
      // Use the weakest category
      questions = await quizService.selectQuestions({
        userId,
        difficulty,
        category: weakAreas[0].category,
        count: Math.min(parseInt(count) || 5, 20),
        mode: 'weakness',
      });
    } else {
      // No history — fall back to random
      questions = await quizService.selectQuestions({
        userId,
        difficulty,
        count: Math.min(parseInt(count) || 5, 20),
        mode: 'random',
      });
    }

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found.' });
    }

    const sanitized = questions.map(q => ({
      _id:         q._id,
      question:    q.question,
      options:     q.options,
      hint:        q.hint,
      category:    q.category,
      module:      q.module,
      difficulty:  q.difficulty,
    }));

    res.json({
      success: true,
      questions: sanitized,
      total: sanitized.length,
      focusArea: weakAreas.length > 0 ? weakAreas[0].category : 'general',
      weakAreas: weakAreas.slice(0, 3),
    });
  } catch (error) {
    console.error('getWeaknessQuiz error:', error);
    res.status(500).json({ error: 'Failed to fetch weakness-based quiz.' });
  }
};

// ── GET /api/quiz/history ──────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const results = await QuizResult.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, results });
  } catch (error) {
    console.error('getHistory error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history.' });
  }
};

// ── GET /api/quiz/stats ────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalQuestions = await QuizQuestion.countDocuments({ active: true });
    const weakAreas = await quizService.getWeakAreas(userId);
    const quizCount = await QuizResult.countDocuments({ user: userId });

    res.json({
      success: true,
      stats: {
        totalQuestionsAvailable: totalQuestions,
        quizzesTaken: quizCount,
        weakAreas: weakAreas.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

// ── POST /api/quiz/generate ────────────────────────────────────
// Admin / on-demand: use Gemini to grow the question pool.
const generateQuestions = async (req, res) => {
  try {
    const { category = 'logical_fallacies', difficulty = 'intermediate', count = 5 } = req.body;

    const added = await quizService.generateAndSaveAIQuestions({
      category,
      difficulty,
      count: Math.min(parseInt(count) || 5, 10), // max 10 per call to keep Gemini usage low
    });

    const total = await QuizQuestion.countDocuments({ active: true });
    res.json({
      success: true,
      message: `${added} new questions added. Total: ${total}`,
      added,
      total,
    });
  } catch (error) {
    console.error('generateQuestions error:', error);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
};

module.exports = { getQuestions, submitResult, getWeaknessQuiz, getHistory, getStats, generateQuestions };
