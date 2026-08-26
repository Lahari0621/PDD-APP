const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'educator'],
    default: 'user',
  },
  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze',
  },
  // Stats
  totalDebates: { type: Number, default: 0 },
  debatesWon: { type: Number, default: 0 },
  totalFallaciesDetected: { type: Number, default: 0 },
  avgConfidenceScore: { type: Number, default: 0 },
  logicScore: { type: Number, default: 50 },
  // Preferences
  preferredTopics: [{ type: String }],
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
  // Subscription
  plan: {
    type: String,
    enum: ['free', 'pro', 'education'],
    default: 'free',
  },
  // Achievements
  achievements: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now },
  }],
  // Reset password
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Index for performance (unique: true already creates indexes above)
userSchema.index({ xp: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update tier based on XP
userSchema.methods.updateTier = function() {
  if (this.xp >= 10000) this.tier = 'Diamond';
  else if (this.xp >= 5000) this.tier = 'Platinum';
  else if (this.xp >= 2000) this.tier = 'Gold';
  else if (this.xp >= 500) this.tier = 'Silver';
  else this.tier = 'Bronze';
};

// Update level based on XP
userSchema.methods.updateLevel = function() {
  this.level = Math.floor(this.xp / 100) + 1;
};

module.exports = mongoose.model('User', userSchema);
