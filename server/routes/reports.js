// /server/routes/reports.js
// This file defines all API routes related to hazard reports.
// It handles creating reports, fetching them based on user role, updating status, calculating hotspots, and triggering the AI pipeline.

const express = require('express');
const router = express.Router();
const HazardReport = require('../models/HazardReport');
const { runAIVerification } = require('../services/aiVerification');

// GET /api/reports - Fetch reports based on user role
router.get('/', async (req, res) => {
  try {
    const userRole = req.query.role;
    let query = {};
    if (userRole === 'analyst') {
      query.status = 'verified';
    }
    const reports = await HazardReport.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/reports/hotspots - Calculate and fetch hotspots
router.get('/hotspots', async (req, res) => {
    try {
        const hotspots = await HazardReport.aggregate([
            { $match: { status: 'verified' } },
            {
                $group: {
                    _id: {
                        lat: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 2] },
                        lon: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 2] },
                    },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } },
            { 
                $project: {
                    _id: 0,
                    location: ["$_id.lon", "$_id.lat"],
                    count: "$count"
                }
            }
        ]);
        res.json(hotspots);
    } catch (err) {
        console.error('Error calculating hotspots:', err);
        res.status(500).send('Server Error');
    }
});

// POST /api/reports - Create a new hazard report and trigger AI
router.post('/', async (req, res) => {
    try {
        const { description, longitude, latitude, hazardType, mediaUrl, submittedBy } = req.body;

        if (!description || !longitude || !latitude || !hazardType || !mediaUrl) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const newReport = new HazardReport({
            description,
            location: { type: 'Point', coordinates: [longitude, latitude] },
            hazardType,
            mediaUrl,
            submittedBy: submittedBy || 'anonymous',
            status: 'pending',
            aiConfidenceScore: 0
        });

        const savedReport = await newReport.save();
        console.log('Report saved successfully:', savedReport._id);

        // Trigger the AI pipeline as a background task (fire-and-forget)
        runAIVerification(savedReport).catch(err => {
            console.error(`AI verification process failed for report ${savedReport._id}:`, err);
        });

        // Respond to the user immediately
        res.status(201).json({
            message: 'Hazard report submitted successfully and is being processed.',
            reportId: savedReport._id,
            report: savedReport
        });

    } catch (error) {
        console.error('Error creating hazard report:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// PATCH /api/reports/:id/status - Update a report's status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be: pending, verified, or rejected'
            });
        }

        const updatedReport = await HazardReport.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        // If an admin manually verifies a report, anchor it to the blockchain (future enhancement)
        if (updatedReport.status === 'verified') {
            console.log(`Report ${updatedReport._id} manually verified. Ready for blockchain anchoring.`);
        }

        res.json({
            message: 'Report status updated successfully',
            report: updatedReport
        });

    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;