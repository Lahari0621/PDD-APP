const mongoose = require('mongoose');

const fallacySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['relevance', 'presumption', 'ambiguity', 'formal', 'informal'],
    default: 'informal',
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: { type: String },
  example: { type: String },
  correctedExample: { type: String },
  keywords: [{ type: String }],
  patterns: [{ type: String }], // regex patterns for detection
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  icon: { type: String, default: '⚠️' },
  color: { type: String, default: '#F59E0B' },
  learnMoreUrl: { type: String },
  relatedFallacies: [{ type: String }],
  detectionCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

fallacySchema.index({ type: 1 });
fallacySchema.index({ category: 1 });

module.exports = mongoose.model('Fallacy', fallacySchema);
