const express = require('express');
const router = express.Router();
const { getProfile, getLeaderboard } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile', protect, getProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
