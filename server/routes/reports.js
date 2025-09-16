// /server/routes/reports.js
const express = require('express');
const router = express.Router();
const HazardReport = require('../models/HazardReport'); // Import our model

// @route   POST /api/reports
// @desc    Create a new hazard report
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    // We get the data from the request body (sent from the mobile app)
    const { longitude, latitude, description, mediaUrl, hazardType, submittedBy } = req.body;

    // Basic validation
    if (!longitude || !latitude || !description || !mediaUrl || !hazardType) {
      return res.status(400).json({ msg: 'Please enter all required fields.' });
    }

    // Create a new report object based on our model
    const newReport = new HazardReport({
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      description,
      mediaUrl,
      hazardType,
      submittedBy, // Save the user's email
    });

    // Save the report to the database
    const savedReport = await newReport.save();

    // Send a success response back to the app with the saved data
    res.status(201).json(savedReport);

  } catch (err) {
    console.error('Validation Error:', err.message);
    // Provide a more specific error for enum validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/reports
// @desc    Get all hazard reports
// @access  Private (we'll secure this later)
router.get('/', async (req, res) => {
  try {
    // Find all reports and sort them by the newest first
    const reports = await HazardReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;