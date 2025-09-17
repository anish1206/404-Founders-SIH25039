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

// POST and PATCH routes remain the same
router.post('/', async (req, res) => { /* ... existing code ... */ });
router.patch('/:id/status', async (req, res) => { /* ... existing code ... */ });

module.exports = router;