const express = require('express');
const router = express.Router();
const { getTopics } = require('../controllers/topic.controller');

router.get('/', getTopics);

module.exports = router;
