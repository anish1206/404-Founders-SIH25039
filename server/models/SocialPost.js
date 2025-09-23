// /server/models/SocialPost.js
const mongoose = require('mongoose');

const SocialPostSchema = new mongoose.Schema({
  source: { type: String, enum: ['Reddit', 'News'], required: true },
  title: { type: String, required: true },
  contentSnippet: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  publishedAt: { type: Date, required: true },
  
  // --- NEW NLP FIELDS ---
  sentimentScore: {
    type: Number,
    default: 0
  },
  keywords: {
    type: [String], // An array of strings
    default: []
  },
  hashtags: {
    type: [String],
    default: []
  }
  // --------------------

}, { timestamps: true });

module.exports = mongoose.model('SocialPost', SocialPostSchema);