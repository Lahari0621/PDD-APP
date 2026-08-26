const express = require('express');
const router = express.Router();
const { getUserAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/user', protect, getUserAnalytics);

module.exports = router;
