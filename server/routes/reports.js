// /server/routes/reports.js
const express = require('express');
const router = express.Router();
const HazardReport = require('../models/HazardReport');
const { runAIVerification } = require('../services/aiVerification'); // <-- Import the AI service

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

    // --- TRIGGER THE AI PIPELINE (DO NOT AWAIT) ---
    // We run this in the background so the mobile app gets a fast response.
    runAIVerification(savedReport).catch(err => {
        console.error(`AI verification failed for report ${savedReport._id}:`, err);
    });
    // ---------------------------------------------

    res.status(201).json(savedReport); // Respond to the user immediately
    
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

// ... (the rest of your GET and PATCH routes remain unchanged) ...
router.get('/', async (req, res) => {
    try {
        const reports = await HazardReport.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status update.' });
        }
        const report = await HazardReport.findById(req.params.id);
        if (!report) { return res.status(404).json({ msg: 'Report not found.' }); }
        report.status = status;
        const updatedReport = await report.save();
        res.json(updatedReport);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

module.exports = router;