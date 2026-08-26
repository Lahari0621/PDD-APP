const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  // Overall stats
  totalDebates: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  totalFallaciesDetected: { type: Number, default: 0 },
  totalXpEarned: { type: Number, default: 0 },
  // Scores over time
  logicScoreHistory: [{
    date: { type: Date, default: Date.now },
    score: Number,
  }],
  confidenceScoreHistory: [{
    date: { type: Date, default: Date.now },
    score: Number,
  }],
  // Fallacy breakdown
  fallacyBreakdown: [{
    type: String,
    count: Number,
  }],
  // Category performance
  categoryPerformance: [{
    category: String,
    debates: Number,
    avgScore: Number,
    wins: Number,
  }],
  // Weekly activity (heatmap data)
  weeklyActivity: [{
    date: { type: String }, // YYYY-MM-DD
    count: Number,
    xp: Number,
  }],
  // Skill radar data
  skills: {
    logic: { type: Number, default: 50 },
    persuasion: { type: Number, default: 50 },
    evidence: { type: Number, default: 50 },
    clarity: { type: Number, default: 50 },
    rebuttal: { type: Number, default: 50 },
    structure: { type: Number, default: 50 },
  },
  // Streaks
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastDebateDate: { type: Date },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Analytics', analyticsSchema);
