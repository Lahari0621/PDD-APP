/**
 * QuizService
 * ─────────────────────────────────────────────────────────────
 * Handles:
 *  • Smart question selection (avoids recently answered questions)
 *  • No-duplicate-within-quiz enforcement
 *  • Question deduplication before insert
 *  • AI question generation via existing Gemini service
 *  • DB seeding from static question bank
 */

const QuizQuestion   = require('../models/QuizQuestion.model');
const UserQuizHistory = require('../models/UserQuizHistory.model');
const QuizResult     = require('../models/QuizResult.model');
const geminiService  = require('../ai/gemini.service');

// How many recent question IDs to remember per user (rolling window)
const HISTORY_WINDOW = 50;

// ─── helpers ─────────────────────────────────────────────────

/** Fisher-Yates shuffle (in-place) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffle the answer options while keeping correctAnswer index correct */
function shuffleOptions(question) {
  const correctText = question.options[question.correctAnswer];
  const shuffled = shuffle([...question.options]);
  return {
    ...question,
    options:       shuffled,
    correctAnswer: shuffled.indexOf(correctText),
  };
}

/** Normalize text for deduplication */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── seeding ─────────────────────────────────────────────────

/**
 * Insert the static seed bank into the DB on first run.
 * Skips questions that already exist (by normalized text).
 */
async function seedQuestionsIfNeeded() {
  try {
    const existing = await QuizQuestion.countDocuments();
    if (existing >= 100) {
      console.log(`✅ Quiz DB already has ${existing} questions — seed skipped.`);
      return;
    }

    const SEED_QUESTIONS = require('../data/quizQuestions.seed');
    let inserted = 0;
    let skipped  = 0;

    for (const q of SEED_QUESTIONS) {
      const norm = normalize(q.question);
      const clash = await QuizQuestion.findOne({ questionNormalized: norm });
      if (clash) { skipped++; continue; }

      await QuizQuestion.create({
        ...q,
        questionNormalized: norm,
        source: 'static',
      });
      inserted++;
    }

    console.log(`✅ Quiz seed complete: ${inserted} inserted, ${skipped} skipped.`);
  } catch (err) {
    console.error('Quiz seed error:', err.message);
  }
}

// ─── smart question selection ─────────────────────────────────

/**
 * Select `count` questions for a quiz.
 * Strategy:
 *  1. Build a pool filtered by difficulty + category (if provided).
 *  2. Fetch the user's recent question history (last HISTORY_WINDOW).
 *  3. Prefer unseen questions; fall back to least-recently-seen.
 *  4. Shuffle within each tier.
 *  5. Shuffle answer options (keeping correctAnswer accurate).
 *  6. Return at most `count` unique questions.
 */
async function selectQuestions({ userId, difficulty, category, module: mod, count = 5, mode = 'random' }) {
  // Build filter
  const filter = { active: true };
  if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
  if (category)                            filter.category  = category;
  if (mod)                                 filter.module    = mod;

  const allQuestions = await QuizQuestion.find(filter).lean();

  if (allQuestions.length === 0) {
    // Fallback — ignore filters if nothing matches
    const fallback = await QuizQuestion.find({ active: true }).lean();
    return selectFromPool(fallback, userId, count, mode);
  }

  return selectFromPool(allQuestions, userId, count, mode);
}

async function selectFromPool(pool, userId, count, mode) {
  if (pool.length === 0) return [];

  // Get the user's recent question history (sorted oldest-first so we can use oldest first when exhausted)
  const history = await UserQuizHistory.find({ userId })
    .sort({ attemptedAt: -1 })
    .limit(HISTORY_WINDOW)
    .lean();

  const recentIds = new Set(history.map(h => h.questionId.toString()));

  // ── weakness mode: boost questions the user gets wrong ──────
  let weightedPool = pool;
  if (mode === 'weakness' && history.length > 0) {
    const wrongIds = new Set(
      history.filter(h => !h.correct).map(h => h.questionId.toString())
    );
    const wrongQuestions = pool.filter(q => wrongIds.has(q._id.toString()));
    const otherQuestions = pool.filter(q => !wrongIds.has(q._id.toString()));
    // Put wrong questions first (double-weighted by duplicating them)
    weightedPool = [...wrongQuestions, ...wrongQuestions, ...otherQuestions];
  }

  // Partition: unseen vs seen
  const unseen = weightedPool.filter(q => !recentIds.has(q._id.toString()));
  const seen   = weightedPool.filter(q =>  recentIds.has(q._id.toString()))
    // Sort by oldest attempted so we rotate through rather than repeating newest
    .sort((a, b) => {
      const aTime = history.find(h => h.questionId.toString() === a._id.toString())?.attemptedAt || 0;
      const bTime = history.find(h => h.questionId.toString() === b._id.toString())?.attemptedAt || 0;
      return new Date(aTime) - new Date(bTime);
    });

  // Shuffle both tiers
  shuffle(unseen);
  // seen is already sorted oldest-first; shuffle within that is less important

  // Combine: unseen first, then oldest-seen
  const ordered = [...unseen, ...seen];

  // Deduplicate IDs (safety — should not be needed but belt-and-suspenders)
  const seenInThisQuiz = new Set();
  const selected = [];
  for (const q of ordered) {
    if (selected.length >= count) break;
    const id = q._id.toString();
    if (!seenInThisQuiz.has(id)) {
      seenInThisQuiz.add(id);
      selected.push(shuffleOptions(q));
    }
  }

  return selected;
}

// ─── result saving ────────────────────────────────────────────

async function saveQuizResult({ userId, answers, questions, timeSpent = 0, quizType, difficulty, category }) {
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const score = Math.round((correctAnswers / questions.length) * 100);
  const xpEarned = correctAnswers * 10;

  // Map quizType to allowed enum values
  const allowedTypes = ['fallacy_identification', 'argument_analysis', 'logic_puzzle', 'debate_strategy'];
  const resolvedType = allowedTypes.includes(quizType) ? quizType : 'fallacy_identification';

  const result = await QuizResult.create({
    user: userId,
    quizType: resolvedType,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    timeSpent,
    xpEarned,
    answers: answers.map(a => ({
      questionId:    a.questionId,
      userAnswer:    a.userAnswer,
      correctAnswer: a.correctAnswer,
      isCorrect:     a.isCorrect,
    })),
  });

  // Record each question in the user's history
  const historyDocs = answers.map(a => ({
    userId,
    questionId: a.questionId,
    quizResultId: result._id,
    correct: a.isCorrect,
    attemptedAt: new Date(),
  }));
  await UserQuizHistory.insertMany(historyDocs);

  // Prune history to stay within the window (keep only most recent HISTORY_WINDOW * 3)
  const totalHistory = await UserQuizHistory.countDocuments({ userId });
  if (totalHistory > HISTORY_WINDOW * 3) {
    const oldest = await UserQuizHistory.find({ userId })
      .sort({ attemptedAt: 1 })
      .limit(totalHistory - HISTORY_WINDOW * 3)
      .select('_id');
    await UserQuizHistory.deleteMany({ _id: { $in: oldest.map(o => o._id) } });
  }

  return { result, score, correctAnswers, xpEarned };
}

// ─── AI question generation ───────────────────────────────────

/**
 * Use Gemini to generate new questions and save them to the DB.
 * Validates structure strictly before inserting.
 * Skips duplicates by normalized text.
 * Returns the number of new questions added.
 */
async function generateAndSaveAIQuestions({ category, difficulty, count = 5 }) {
  const categoryLabel = (category || 'logical fallacies').replace(/_/g, ' ');
  const difficultyLabel = difficulty || 'intermediate';

  const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${categoryLabel}" at "${difficultyLabel}" difficulty for a critical thinking and debate learning platform.

Requirements:
- Each question must test a DIFFERENT concept within "${categoryLabel}"
- Difficulty: ${difficultyLabel} (beginner=identification, intermediate=application, advanced=subtle analysis, expert=complex evaluation)
- Each question must have exactly 4 answer options
- Exactly 1 option is correct
- Include a concise explanation (1-2 sentences)
- Include a short hint (max 15 words)

Respond with ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct.",
    "hint": "Short hint here."
  }
]

correctAnswer is the 0-based index of the correct option in the options array.`;

  let rawText = '';
  try {
    const result = await geminiService._generateWithFallback(async () => {
      const model = geminiService._getModel();
      const r = await model.generateContent(prompt);
      return r.response.text().trim();
    });
    rawText = result;
  } catch (err) {
    console.error('AI question generation failed:', err.message);
    return 0;
  }

  // Extract JSON array
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('AI returned no valid JSON array.');
    return 0;
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse AI JSON:', e.message);
    return 0;
  }

  if (!Array.isArray(parsed)) return 0;

  let added = 0;
  for (const q of parsed) {
    // Validate structure
    if (
      typeof q.question !== 'string' || q.question.length < 10  ||
      !Array.isArray(q.options)       || q.options.length !== 4  ||
      typeof q.correctAnswer !== 'number' ||
      q.correctAnswer < 0 || q.correctAnswer > 3               ||
      typeof q.explanation !== 'string'
    ) {
      console.warn('AI question failed validation, skipping:', q.question);
      continue;
    }

    const norm = normalize(q.question);
    const clash = await QuizQuestion.findOne({ questionNormalized: norm });
    if (clash) continue; // duplicate

    try {
      await QuizQuestion.create({
        question:           q.question.trim(),
        questionNormalized: norm,
        options:            q.options.map(o => String(o).trim()),
        correctAnswer:      q.correctAnswer,
        explanation:        q.explanation.trim(),
        hint:               (q.hint || '').trim(),
        category:           category || 'logical_fallacies',
        module:             categoryLabel,
        difficulty:         difficulty || 'intermediate',
        source:             'ai_generated',
      });
      added++;
    } catch (e) {
      if (e.code !== 11000) console.error('Insert error:', e.message); // 11000 = duplicate key
    }
  }

  console.log(`🤖 AI generated ${added} new questions (${category} / ${difficulty})`);
  return added;
}

// ─── get weak areas ───────────────────────────────────────────

async function getWeakAreas(userId) {
  const history = await UserQuizHistory.find({ userId })
    .populate('questionId', 'category module')
    .sort({ attemptedAt: -1 })
    .limit(100)
    .lean();

  // Tally per category
  const stats = {};
  for (const h of history) {
    if (!h.questionId) continue;
    const cat = h.questionId.category;
    if (!stats[cat]) stats[cat] = { total: 0, wrong: 0 };
    stats[cat].total++;
    if (!h.correct) stats[cat].wrong++;
  }

  // Sort by error rate
  return Object.entries(stats)
    .filter(([, s]) => s.total >= 2)
    .map(([cat, s]) => ({ category: cat, errorRate: s.wrong / s.total, total: s.total }))
    .sort((a, b) => b.errorRate - a.errorRate);
}

module.exports = {
  seedQuestionsIfNeeded,
  selectQuestions,
  saveQuizResult,
  generateAndSaveAIQuestions,
  getWeakAreas,
};
