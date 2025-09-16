// /server/routes/reports.js
const express = require('express');
const router = express.Router();
const HazardReport = require('../models/HazardReport'); // Import our model

// @route   POST /api/reports
// @desc    Create a new hazard report
router.post('/', async (req, res) => {
  try {
    const { longitude, latitude, description, mediaUrl, hazardType, submittedBy } = req.body;
    if (!longitude || !latitude || !description || !mediaUrl || !hazardType) {
      return res.status(400).json({ msg: 'Please enter all required fields.' });
    }
    const newReport = new HazardReport({
      location: { type: 'Point', coordinates: [longitude, latitude] },
      description, mediaUrl, hazardType, submittedBy,
    });
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/reports
// @desc    Get all hazard reports
router.get('/', async (req, res) => {
  try {
    const reports = await HazardReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/reports/:id/status
// @desc    Update the status of a report (approve/reject)
// @access  Private (for Admins)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        // Validate the new status
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status update.' });
        }

        const report = await HazardReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ msg: 'Report not found.' });
        }

        // Update the status and save the document
        report.status = status;
        const updatedReport = await report.save();
        
        // Return the entire updated report object
        res.json(updatedReport);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;