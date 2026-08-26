const express = require('express');
const router  = express.Router();
const {
  getQuestions,
  submitResult,
  getWeaknessQuiz,
  getHistory,
  getStats,
  generateQuestions,
} = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

// All quiz routes require authentication
router.use(protect);

router.get('/questions',       getQuestions);       // GET  /api/quiz/questions?difficulty=&category=&count=
router.post('/result',         submitResult);       // POST /api/quiz/result
router.get('/weakness-based',  getWeaknessQuiz);    // GET  /api/quiz/weakness-based
router.get('/history',         getHistory);         // GET  /api/quiz/history
router.get('/stats',           getStats);           // GET  /api/quiz/stats
router.post('/generate',       generateQuestions);  // POST /api/quiz/generate  (expand pool via AI)

module.exports = router;
