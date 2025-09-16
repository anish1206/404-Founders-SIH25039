// server/routes/reports.js
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
      submittedBy,
      // Other fields will have default values (e.g., status: 'pending')
    });

    // Save the report to the database
    const savedReport = await newReport.save();

    // Send a success response back to the app with the saved data
    res.status(201).json(savedReport);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;