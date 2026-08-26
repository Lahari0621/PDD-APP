const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: { type: String },
  category: {
    type: String,
    enum: ['politics', 'science', 'philosophy', 'ethics', 'economics', 'technology', 'social', 'environment'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  debateCount: { type: Number, default: 0 },
  icon: { type: String, default: '💬' },
  suggestedPositions: {
    pro: { type: String },
    con: { type: String },
  },
}, {
  timestamps: true,
});

topicSchema.index({ category: 1 });
topicSchema.index({ difficulty: 1 });
topicSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Topic', topicSchema);
