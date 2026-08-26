const Analytics = require('../models/Analytics.model');
const Debate = require('../models/Debate.model');
const User = require('../models/User.model');
const QuizResult = require('../models/QuizResult.model');
const geminiService = require('../ai/gemini.service');

const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get or create analytics record
    let analytics = await Analytics.findOne({ user: userId });
    if (!analytics) {
      analytics = await Analytics.create({ user: userId });
    }

    // Get recent completed debates
    const recentDebates = await Debate.find({ user: userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('topic finalScore duration totalTurns winner xpEarned createdAt topicCategory difficulty');

    // Get user stats
    const user = await User.findById(userId);

    // Calculate per-category performance via aggregation
    const categoryStats = await Debate.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $group: {
          _id: '$topicCategory',
          count:    { $sum: 1 },
          avgScore: { $avg: '$finalScore' },
          wins:     { $sum: { $cond: [{ $eq: ['$winner', 'user'] }, 1, 0] } },
        },
      },
    ]);

    // Build win/loss data for last 10 debates
    const winLossData = recentDebates.slice(0, 10).reverse().map((d, i) => ({
      label: `D${i + 1}`,
      score: d.finalScore || 0,
      result: d.winner,
    }));

    // Generate coaching tip (uses Gemini, returns cached-friendly short prompt)
    const coachingTip = await geminiService.generateCoachingTip({
      totalDebates:     user.totalDebates,
      logicScore:       user.logicScore,
      streak:           user.streak,
      tier:             user.tier,
      debatesWon:       user.debatesWon,
      totalFallacies:   user.totalFallaciesDetected,
    });

    // Score histories (last 30 entries)
    const logicHistory      = analytics.logicScoreHistory.slice(-30);
    const confidenceHistory = analytics.confidenceScoreHistory.slice(-30);

    // Weekly activity (last 52 weeks max)
    const weeklyData = analytics.weeklyActivity.slice(-52);

    // Most common fallacy from fallacy breakdown
    const mostCommonFallacy = analytics.fallacyBreakdown.length > 0
      ? analytics.fallacyBreakdown.reduce((a, b) => (a.count > b.count ? a : b))
      : null;

    // Quiz stats
    const quizCount  = await QuizResult.countDocuments({ user: userId });
    const quizAvgAgg = await QuizResult.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } },
    ]);
    const quizAvgScore = quizAvgAgg[0]?.avgScore ? Math.round(quizAvgAgg[0].avgScore) : 0;

    res.json({
      success: true,
      analytics: {
        overview: {
          totalDebates:          user.totalDebates,
          debatesWon:            user.debatesWon,
          winRate:               user.totalDebates > 0 ? Math.round((user.debatesWon / user.totalDebates) * 100) : 0,
          totalXp:               user.xp,
          level:                 user.level,
          tier:                  user.tier,
          streak:                user.streak,
          longestStreak:         user.longestStreak,
          logicScore:            user.logicScore,
          totalFallaciesDetected: user.totalFallaciesDetected,
        },
        skills:              analytics.skills,
        recentDebates,
        categoryPerformance: categoryStats,
        logicScoreHistory:   logicHistory,
        confidenceScoreHistory: confidenceHistory,
        weeklyActivity:      weeklyData,
        fallacyBreakdown:    analytics.fallacyBreakdown,
        mostCommonFallacy,
        winLossData,
        quizStats: { quizCount, quizAvgScore },
        coachingTip:         coachingTip.tip,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

module.exports = { getUserAnalytics };
