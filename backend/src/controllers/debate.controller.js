const Debate = require('../models/Debate.model');
const DebateMessage = require('../models/DebateMessage.model');
const User = require('../models/User.model');
const Analytics = require('../models/Analytics.model');
const geminiService = require('../ai/gemini.service');
const fallacyDetector = require('../ai/fallacy.detector');

// ── helpers ────────────────────────────────────────────────────

/**
 * Calculate argument strength score locally (fast, no API call).
 * Used as an initial estimate; Gemini scoring is async and non-blocking.
 */
function localArgumentScore(content, fallacies) {
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordLen = content.replace(/\s/g, '').length / Math.max(wordCount, 1);

  // Base score from content richness
  let base = Math.min(90, 30 + wordCount * 1.5 + sentenceCount * 3);
  
  // Penalise fallacies
  const fallacyPenalty = fallacies.length * 12;
  base = Math.max(20, base - fallacyPenalty);

  // Bonus for specificity markers
  const hasNumbers = /\d+/.test(content);
  const hasEvidence = /\b(study|research|evidence|data|according|shows?|proves?|statistic)\b/i.test(content);
  const hasExample = /\b(example|instance|case|such as|for instance|specifically)\b/i.test(content);
  
  if (hasNumbers) base = Math.min(95, base + 5);
  if (hasEvidence) base = Math.min(95, base + 8);
  if (hasExample) base = Math.min(95, base + 4);

  const logic      = Math.min(100, Math.max(20, base + (hasEvidence ? 5 : -5)));
  const relevance  = Math.min(100, Math.max(20, base + 5));
  const evidence   = Math.min(100, Math.max(10, base - 15 + (hasNumbers ? 10 : 0) + (hasEvidence ? 15 : 0)));
  const persuasion = Math.min(100, Math.max(20, base - 3));
  const consistency = Math.min(100, Math.max(20, base + 3));
  const clarity    = Math.min(100, Math.max(20, base + (avgWordLen < 8 ? 5 : -3)));
  const overall    = Math.round((logic + relevance + evidence + persuasion + consistency + clarity) / 6);

  return { logic, relevance, evidence, persuasion, consistency, clarity, overall };
}

/**
 * Compute adaptive difficulty adjustment based on recent message scores.
 * Returns the recommended difficulty for the next turn.
 */
function computeAdaptiveDifficulty(currentDifficulty, recentScores, recentFallacyRate) {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIdx = levels.indexOf(currentDifficulty);
  if (currentIdx === -1) return currentDifficulty;

  if (recentScores.length < 3) return currentDifficulty; // not enough data

  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  // High performance + low fallacy rate → increase difficulty
  if (avgScore >= 75 && recentFallacyRate <= 0.2 && currentIdx < levels.length - 1) {
    return levels[currentIdx + 1];
  }
  // Poor performance + high fallacy rate → decrease difficulty
  if (avgScore < 45 && recentFallacyRate >= 0.5 && currentIdx > 0) {
    return levels[currentIdx - 1];
  }
  return currentDifficulty;
}

// ── Start Debate ───────────────────────────────────────────────

const startDebate = async (req, res) => {
  try {
    const { topic, topicCategory, difficulty, aiPersonality, userPosition, debateMode = 'classic' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Debate topic is required' });
    }

    const resolvedDifficulty = difficulty || req.user.difficultyLevel || 'intermediate';

    const debate = await Debate.create({
      user: req.user._id,
      topic,
      topicCategory: topicCategory || 'custom',
      difficulty: resolvedDifficulty,
      aiPersonality: aiPersonality || 'logical',
      userPosition: userPosition || '',
      status: 'active',
      debateMode: debateMode || 'classic',
    });

    // Generate AI opening statement
    const modePrompt = debateMode === 'cross_examination'
      ? `This is a cross-examination debate. Start by asking 2-3 probing questions about the user's position on "${topic}".`
      : debateMode === 'rapid_fire'
      ? `This is rapid-fire debate on "${topic}". Give a very short, punchy opening challenge (2-3 sentences max).`
      : `The debate topic is: "${topic}". ${userPosition ? `The user will argue: "${userPosition}". Take the opposing position.` : 'Start the debate with an opening statement and challenge the user to take a position.'} Begin the debate with an engaging opening statement.`;

    const aiResponse = await geminiService.generateDebateResponse(
      debate._id.toString(),
      modePrompt,
      { topic, difficulty: resolvedDifficulty, aiPersonality: aiPersonality || 'logical', conversationHistory: [], debateMode }
    );

    // Save AI opening message
    const aiMessage = await DebateMessage.create({
      debate: debate._id,
      sender: 'ai',
      content: aiResponse.content,
      turnNumber: 1,
      model: aiResponse.model || 'gemini-2.5-flash',
    });

    debate.messages.push(aiMessage._id);
    debate.totalTurns = 1;
    await debate.save();

    res.status(201).json({
      success: true,
      debate: {
        id: debate._id,
        topic: debate.topic,
        difficulty: debate.difficulty,
        aiPersonality: debate.aiPersonality,
        status: debate.status,
        debateMode: debate.debateMode || 'classic',
        startedAt: debate.startedAt,
      },
      openingMessage: {
        id: aiMessage._id,
        sender: 'ai',
        content: aiMessage.content,
        timestamp: aiMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('Start debate error:', error);
    res.status(500).json({ error: 'Failed to start debate' });
  }
};

// ── Send Message ───────────────────────────────────────────────

const sendMessage = async (req, res) => {
  try {
    const { debateId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const debate = await Debate.findOne({ _id: debateId, user: req.user._id })
      .populate('messages', 'sender content createdAt fallacies hasFallacy logicScore confidenceScore');

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status !== 'active') {
      return res.status(400).json({ error: 'This debate is not active' });
    }

    const startTime = Date.now();

    // Detect fallacies in user message
    const fallacyResult = await fallacyDetector.detect(content);

    // Calculate local argument scores (fast, no API call)
    const argScores = localArgumentScore(content, fallacyResult.fallacies);
    const confidenceScore = Math.min(100, Math.max(20, argScores.overall));
    const logicScore      = Math.min(100, Math.max(20, argScores.logic));

    // Save user message
    const userMessage = await DebateMessage.create({
      debate: debate._id,
      sender: 'user',
      content,
      fallacies: fallacyResult.fallacies,
      hasFallacy: fallacyResult.hasFallacy,
      confidenceScore,
      logicScore,
      persuasionScore: argScores.persuasion,
      turnNumber: debate.totalTurns + 1,
    });

    // Build conversation history (last 10 messages for context efficiency)
    const recentMessages = debate.messages.slice(-10);
    const conversationHistory = recentMessages.map(m => ({
      sender: m.sender,
      content: m.content,
    }));

    // Build argument memory from full history (lightweight local extraction)
    const allMessages = debate.messages.map(m => ({ sender: m.sender, content: m.content }));
    const argumentMemory = await geminiService.extractArgumentMemory(allMessages, debate.topic);

    // Compute adaptive difficulty
    const recentUserMsgs = debate.messages
      .filter(m => m.sender === 'user' && m.logicScore)
      .slice(-5);
    const recentScores = recentUserMsgs.map(m => m.logicScore || 60);
    const recentFallacyRate = recentUserMsgs.length > 0
      ? recentUserMsgs.filter(m => m.hasFallacy).length / recentUserMsgs.length
      : 0;
    const adaptedDifficulty = computeAdaptiveDifficulty(
      debate.difficulty,
      recentScores,
      recentFallacyRate
    );

    // Update debate difficulty if adaptive changed it
    if (adaptedDifficulty !== debate.difficulty && debate.adaptiveDifficulty) {
      debate.difficulty = adaptedDifficulty;
    }

    // Generate AI response
    const aiResponse = await geminiService.generateDebateResponse(
      debate._id.toString(),
      content,
      {
        topic: debate.topic,
        difficulty: adaptedDifficulty,
        aiPersonality: debate.aiPersonality,
        conversationHistory,
        argumentMemory,
        debateMode: debate.debateMode || 'classic',
      }
    );

    const processingTime = Date.now() - startTime;

    // Save AI response
    const aiMessage = await DebateMessage.create({
      debate: debate._id,
      sender: 'ai',
      content: aiResponse.content,
      turnNumber: debate.totalTurns + 2,
      processingTime,
      model: aiResponse.model || 'gemini-2.5-flash',
    });

    // Update debate
    debate.messages.push(userMessage._id, aiMessage._id);
    debate.totalTurns += 2;
    if (fallacyResult.hasFallacy) debate.userFallaciesCount += fallacyResult.fallacies.length;
    await debate.save();

    res.json({
      success: true,
      userMessage: {
        id: userMessage._id,
        sender: 'user',
        content: userMessage.content,
        fallacies: userMessage.fallacies,
        hasFallacy: userMessage.hasFallacy,
        confidenceScore: userMessage.confidenceScore,
        logicScore: userMessage.logicScore,
        argumentScores: argScores,
        timestamp: userMessage.createdAt,
      },
      aiMessage: {
        id: aiMessage._id,
        sender: 'ai',
        content: aiMessage.content,
        timestamp: aiMessage.createdAt,
        processingTime,
      },
      adaptiveDifficulty: adaptedDifficulty,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ── End Debate ─────────────────────────────────────────────────

const endDebate = async (req, res) => {
  try {
    const { debateId } = req.body;

    const debate = await Debate.findOne({ _id: debateId, user: req.user._id })
      .populate('messages', 'sender content fallacies hasFallacy confidenceScore logicScore');

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    // Generate comprehensive summary
    const summaryResult = await geminiService.generateDebateSummary(
      debate.topic,
      debate.messages
    );

    const summaryData = summaryResult.data || {};
    const duration = Math.floor((Date.now() - debate.startedAt) / 1000);

    // Update debate record
    debate.status = 'completed';
    debate.endedAt = new Date();
    debate.duration = duration;
    debate.summary = summaryData.summary || '';
    debate.keyInsights = summaryData.keyInsights || [];
    debate.improvementAreas = summaryData.improvementAreas || [];
    debate.strengths = summaryData.userStrengths || [];
    debate.winner = summaryData.winner || 'draw';
    debate.finalScore = summaryData.overallScore || 65;
    debate.xpEarned = summaryData.xpEarned || 50;
    await debate.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalDebates += 1;
    if (summaryData.winner === 'user') user.debatesWon += 1;
    user.xp += debate.xpEarned;
    user.totalFallaciesDetected += (debate.userFallaciesCount || 0);

    // Update logicScore as running average
    const newLogic = summaryData.logicScore || 65;
    user.logicScore = Math.round((user.logicScore * (user.totalDebates - 1) + newLogic) / user.totalDebates);
    user.updateLevel();
    user.updateTier();

    // Check and award achievements
    const newAchievements = [];
    const hasAchievement = (id) => user.achievements.some(a => a.id === id);

    if (user.totalDebates === 1 && !hasAchievement('first_debate')) {
      newAchievements.push({ id: 'first_debate', name: 'First Debate', description: 'Completed your first debate', icon: '🎯' });
    }
    if (user.totalDebates >= 10 && !hasAchievement('ten_debates')) {
      newAchievements.push({ id: 'ten_debates', name: '10 Debates', description: 'Completed 10 debates', icon: '💪' });
    }
    if (user.debatesWon >= 10 && !hasAchievement('debate_champion')) {
      newAchievements.push({ id: 'debate_champion', name: 'Debate Champion', description: 'Won 10 debates', icon: '🏆' });
    }
    if (user.totalFallaciesDetected >= 10 && !hasAchievement('fallacy_hunter')) {
      newAchievements.push({ id: 'fallacy_hunter', name: 'Fallacy Hunter', description: 'Detected 10+ fallacies', icon: '🔍' });
    }
    if (newLogic >= 90 && !hasAchievement('logic_master')) {
      newAchievements.push({ id: 'logic_master', name: 'Logic Master', description: 'Achieved 90%+ logic score', icon: '🧠' });
    }
    if (user.streak >= 7 && !hasAchievement('streak_7')) {
      newAchievements.push({ id: 'streak_7', name: '7-Day Streak', description: 'Debated 7 days in a row', icon: '🔥' });
    }
    if (user.streak >= 30 && !hasAchievement('streak_30')) {
      newAchievements.push({ id: 'streak_30', name: '30-Day Streak', description: 'Debated 30 days in a row', icon: '🔥🔥' });
    }

    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
    }
    await user.save();

    // Update analytics
    const fallacyTypes = debate.messages
      .filter(m => m.hasFallacy)
      .flatMap(m => m.fallacies?.map(f => f.type) || []);

    // Build fallacy breakdown updates
    const fallacyBreakdownUpdate = {};
    fallacyTypes.forEach(type => {
      fallacyBreakdownUpdate[type] = (fallacyBreakdownUpdate[type] || 0) + 1;
    });

    // Skills update from summary scores
    const skillsUpdate = {
      'skills.logic':      summaryData.logicScore || 65,
      'skills.persuasion': summaryData.persuasionScore || 60,
      'skills.evidence':   summaryData.evidenceScore || 55,
      'skills.rebuttal':   summaryData.rebuttalScore || 65,
      'skills.clarity':    summaryData.clarityScore || 70,
      'skills.structure':  summaryData.consistencyScore || 68,
    };

    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      {
        $inc: {
          totalDebates: 1,
          totalXpEarned: debate.xpEarned,
          totalFallaciesDetected: debate.userFallaciesCount || 0,
        },
        $set: skillsUpdate,
        $push: {
          logicScoreHistory: { date: new Date(), score: summaryData.logicScore || 65 },
          confidenceScoreHistory: { date: new Date(), score: summaryData.overallScore || 62 },
          weeklyActivity: {
            date: new Date().toISOString().split('T')[0],
            count: 1,
            xp: debate.xpEarned,
          },
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      summary: {
        topic: debate.topic,
        duration,
        totalTurns: debate.totalTurns,
        winner: debate.winner,
        finalScore: debate.finalScore,
        xpEarned: debate.xpEarned,
        summary: debate.summary,
        keyInsights: debate.keyInsights,
        improvementAreas: debate.improvementAreas,
        strengths: debate.strengths,
        // Extended summary fields
        logicScore:        summaryData.logicScore || 65,
        persuasionScore:   summaryData.persuasionScore || 60,
        evidenceScore:     summaryData.evidenceScore || 55,
        rebuttalScore:     summaryData.rebuttalScore || 65,
        clarityScore:      summaryData.clarityScore || 70,
        consistencyScore:  summaryData.consistencyScore || 68,
        strongestArgument: summaryData.strongestArgument || '',
        weakestArgument:   summaryData.weakestArgument || '',
        mostCommonFallacy: summaryData.mostCommonFallacy || null,
        fallacyCount:      summaryData.fallacyCount || debate.userFallaciesCount || 0,
        bestRebuttal:      summaryData.bestRebuttal || '',
        missedOpportunities: summaryData.missedOpportunities || [],
        recommendations:   summaryData.recommendations || [],
        nextChallenge:     summaryData.nextChallenge || '',
        newAchievements,
      },
    });
  } catch (error) {
    console.error('End debate error:', error);
    res.status(500).json({ error: 'Failed to end debate' });
  }
};

// ── Get Debate History ─────────────────────────────────────────

const getHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const debates = await Debate.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-messages');

    const total = await Debate.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      debates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get debate history' });
  }
};

// ── Get Single Debate (with replay data) ──────────────────────

const getDebate = async (req, res) => {
  try {
    const debate = await Debate.findOne({ _id: req.params.id, user: req.user._id })
      .populate('messages');

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    // Build replay timeline
    const startTime = new Date(debate.startedAt).getTime();
    const replayTimeline = debate.messages.map((msg, idx) => {
      const msgTime = new Date(msg.createdAt).getTime();
      const elapsedSec = Math.round((msgTime - startTime) / 1000);
      const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const ss = String(elapsedSec % 60).padStart(2, '0');
      return {
        index:         idx,
        id:            msg._id,
        sender:        msg.sender,
        content:       msg.content,
        timestamp:     `${mm}:${ss}`,
        timestampMs:   msgTime,
        hasFallacy:    msg.hasFallacy || false,
        fallacies:     msg.fallacies || [],
        logicScore:    msg.logicScore || null,
        confidenceScore: msg.confidenceScore || null,
        turnNumber:    msg.turnNumber || idx + 1,
      };
    });

    res.json({ success: true, debate, replayTimeline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get debate' });
  }
};

// ── Score Argument (real-time strength meter) ─────────────────

const scoreArgument = async (req, res) => {
  try {
    const { content, topic, previousFallacies = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Argument content is required' });
    }

    // Use fast local scoring — avoids API call for every keystroke
    const fallacyResult = await fallacyDetector.detect(content);
    const localScores = localArgumentScore(content, fallacyResult.fallacies);

    res.json({
      success: true,
      scores: localScores,
      hasFallacy: fallacyResult.hasFallacy,
      fallacies: fallacyResult.fallacies,
    });
  } catch (error) {
    console.error('Score argument error:', error);
    res.status(500).json({ error: 'Failed to score argument' });
  }
};

// ── Generate Topic ─────────────────────────────────────────────

const generateTopic = async (req, res) => {
  try {
    const { category = 'general', difficulty = 'intermediate' } = req.body;

    const result = await geminiService.generateDebateTopic(category, difficulty);

    // Service always returns success:true (has static fallback) — but handle edge case
    res.json({ success: true, topic: result.data || result });
  } catch (error) {
    console.error('Generate topic error:', error);
    res.status(500).json({ error: 'Failed to generate topic' });
  }
};

// ── AI vs AI Debate ────────────────────────────────────────────

const aiVsAiDebate = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await geminiService.generateAIvsAIDebate(topic);

    // Service always returns success:true (has static fallback) — but handle edge case
    res.json({ success: true, debate: result.data || result });
  } catch (error) {
    console.error('AI vs AI error:', error);
    res.status(500).json({ error: 'Failed to generate AI vs AI debate' });
  }
};

// ── Fallacy Try-Again ──────────────────────────────────────────

const tryAgainFallacy = async (req, res) => {
  try {
    const { original, rewritten, fallacyName } = req.body;

    if (!original || !rewritten) {
      return res.status(400).json({ error: 'Original and rewritten arguments are required' });
    }

    const [origResult, newResult] = await Promise.all([
      fallacyDetector.detect(original),
      fallacyDetector.detect(rewritten),
    ]);

    const origScores = localArgumentScore(original, origResult.fallacies);
    const newScores  = localArgumentScore(rewritten, newResult.fallacies);
    const improvement = newScores.overall - origScores.overall;

    res.json({
      success: true,
      original: {
        hasFallacy: origResult.hasFallacy,
        fallacies:  origResult.fallacies,
        score:      origScores.overall,
      },
      rewritten: {
        hasFallacy: newResult.hasFallacy,
        fallacies:  newResult.fallacies,
        score:      newScores.overall,
      },
      improvement,
      improved: !newResult.hasFallacy && origResult.hasFallacy,
    });
  } catch (error) {
    console.error('Try again error:', error);
    res.status(500).json({ error: 'Failed to compare arguments' });
  }
};

module.exports = { startDebate, sendMessage, endDebate, getHistory, getDebate, scoreArgument, generateTopic, aiVsAiDebate, tryAgainFallacy };
