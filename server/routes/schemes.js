// /server/routes/schemes.js
const express = require('express');
const router = express.Router();
const GovScheme = require('../models/GovScheme');

// @route   GET /api/schemes
// @desc    Get all government schemes
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Find all schemes and sort them by category
    const schemes = await GovScheme.find().sort({ category: 1 });
    res.json(schemes);
  } catch (err) {
    console.error("Error fetching schemes:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;