const User = require('../models/User.model');
const Debate = require('../models/Debate.model');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    const recentDebates = await Debate.find({ user: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('topic finalScore winner createdAt duration');

    res.json({ success: true, user, recentDebates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .sort({ xp: -1 })
      .limit(20)
      .select('username avatar xp level tier totalDebates debatesWon streak');

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

module.exports = { getProfile, getLeaderboard };
