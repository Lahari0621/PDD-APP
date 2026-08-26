const User = require('../models/User.model');
const Analytics = require('../models/Analytics.model');
const { generateToken } = require('../middleware/auth.middleware');
const crypto = require('crypto');

// Register
const register = async (req, res) => {
  try {
    const { username, email, password, difficultyLevel } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      difficultyLevel: difficultyLevel || 'beginner',
    });

    // Create analytics record
    await Analytics.create({ user: user._id });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        tier: user.tier,
        streak: user.streak,
        plan: user.plan,
        role: user.role,
        difficultyLevel: user.difficultyLevel,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActive === yesterday) {
      user.streak += 1;
      if (user.streak > user.longestStreak) user.longestStreak = user.streak;
    } else if (lastActive !== today) {
      user.streak = 1;
    }
    user.lastActiveDate = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        xp: user.xp,
        level: user.level,
        tier: user.tier,
        streak: user.streak,
        longestStreak: user.longestStreak,
        plan: user.plan,
        role: user.role,
        difficultyLevel: user.difficultyLevel,
        totalDebates: user.totalDebates,
        logicScore: user.logicScore,
        achievements: user.achievements,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { username, bio, difficultyLevel, preferredTopics } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, difficultyLevel, preferredTopics },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In production, send email here
    res.json({ 
      success: true, 
      message: 'Password reset instructions sent to your email',
      // Only for development:
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process password reset' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful', token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
