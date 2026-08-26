const express = require('express');
const router = express.Router();
const { analyzeText, getFallacyLibrary } = require('../controllers/fallacy.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/analyze', analyzeText); // Public for demo
router.get('/library', getFallacyLibrary);

module.exports = router;
