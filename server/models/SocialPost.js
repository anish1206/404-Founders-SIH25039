// /server/models/SocialPost.js
const mongoose = require('mongoose');

const SocialPostSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['Reddit', 'News'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  contentSnippet: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate posts
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  // We can add more fields later, like location or sentiment
}, {
  timestamps: true,
});

module.exports = mongoose.model('SocialPost', SocialPostSchema);