const express = require('express');
const router = express.Router();
const {
  startDebate, sendMessage, endDebate, getHistory, getDebate,
  scoreArgument, generateTopic, aiVsAiDebate, tryAgainFallacy,
} = require('../controllers/debate.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/start',          startDebate);
router.post('/message',        sendMessage);
router.post('/end',            endDebate);
router.get('/history',         getHistory);
router.post('/score-argument', scoreArgument);   // real-time arg strength meter
router.post('/generate-topic', generateTopic);   // AI topic generator
router.post('/ai-vs-ai',       aiVsAiDebate);    // AI vs AI mode
router.post('/try-again',      tryAgainFallacy); // fallacy rewrite comparison
router.get('/:id',             getDebate);       // includes replay timeline

module.exports = router;
