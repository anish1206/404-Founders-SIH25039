// /server/routes/reports.js
const express = require('express');
const router = express.Router();
const HazardReport = require('../models/HazardReport');
const { runAIVerification } = require('../services/aiVerification');

// --- MODIFIED GET ROUTE FOR ROLE-BASED ACCESS ---
router.get('/', async (req, res) => {
  try {
    // In a real app, you would have middleware to verify the Firebase token
    // and attach user role. For now, we simulate it via a query param for testing.
    // To test analyst view: GET /api/reports?role=analyst
    const userRole = req.query.role; 

    let query = {};
    if (userRole === 'analyst') {
      // Analysts only see verified reports
      query.status = 'verified';
    }
    
    const reports = await HazardReport.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ENDPOINT FOR HOTSPOTS ---
router.get('/hotspots', async (req, res) => {
    try {
        // Hotspots are calculated based on the density of VERIFIED reports.
        const hotspots = await HazardReport.aggregate([
            // 1. Filter for only verified reports
            { $match: { status: 'verified' } },
            // 2. Group by a rounded location to cluster nearby points
            {
                $group: {
                    _id: {
                        // Rounding coordinates to 2 decimal places creates grid cells of ~1km
                        lat: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 2] },
                        lon: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 2] },
                    },
                    count: { $sum: 1 } // Count reports in each cell
                }
            },
            // 3. Only show hotspots with more than 1 report
            { $match: { count: { $gt: 1 } } },
            // 4. Format the output nicely
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

// POST route - Create a new hazard report
router.post('/', async (req, res) => {
    try {
        console.log('Received POST request to /api/reports');
        console.log('Request body:', req.body);

        const { description, longitude, latitude, hazardType, mediaUrl, submittedBy } = req.body;

        // Validate required fields
        if (!description || !longitude || !latitude || !hazardType || !mediaUrl) {
            return res.status(400).json({
                error: 'Missing required fields: description, longitude, latitude, hazardType, and mediaUrl are required'
            });
        }

        // Create new hazard report
        const newReport = new HazardReport({
            description,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // [longitude, latitude] for GeoJSON
            },
            hazardType,
            mediaUrl: mediaUrl, // Mobile app sends mediaUrl directly
            submittedBy: submittedBy || 'anonymous',
            status: 'pending', // Default status
            aiConfidenceScore: 0 // Default confidence
        });

        // Save to database
        const savedReport = await newReport.save();
        console.log('Report saved successfully:', savedReport._id);

        res.status(201).json({
            message: 'Hazard report submitted successfully',
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

// PATCH route - Update report status (for admin/analyst use)
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