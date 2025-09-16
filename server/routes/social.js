// /server/routes/social.js
const express = require('express');
const router = express.Router();
const { runAllScrapers } = require('../services/socialMediaScraper');
const SocialPost = require('../models/SocialPost');

// @route   POST /api/social/scrape
// @desc    Manually trigger the social media scrapers
// @access  Private (Admin)
router.post('/scrape', async (req, res) => {
  // We run this without awaiting so the API responds immediately
  runAllScrapers(); 
  res.status(202).json({ msg: 'Scraping process initiated in the background.' });
});

// @route   GET /api/social/posts
// @desc    Get all saved social media posts
// @access  Private (Admin/Analyst)
router.get('/posts', async (req, res) => {
  try {
    const posts = await SocialPost.find().sort({ publishedAt: -1 }).limit(50);
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;