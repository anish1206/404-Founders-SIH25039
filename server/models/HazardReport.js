// server/models/HazardReport.js
const mongoose = require('mongoose');

const HazardReportSchema = new mongoose.Schema({
  // Location data from the phone
  location: {
    type: {
      type: String,
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number], // Array of numbers for [longitude, latitude]
      required: true
    }
  },
  // User's description of the hazard
  description: {
    type: String,
    required: true,
    trim: true // Removes whitespace from both ends
  },
  // URL of the uploaded photo/video (we'll get this from Cloudinary later)
  mediaUrl: {
    type: String,
    required: true
  },
  // What type of hazard is it?
  hazardType: {
    type: String,
    enum: ['Tsunami', 'Storm Surge', 'High Waves', 'Abnormal', 'Other'],
    required: true
  },
  // Status for the verification pipeline
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending' // New reports are always pending
  },
  // AI's confidence score after analysis
  aiConfidenceScore: {
    type: Number,
    default: 0
  },
  // Who submitted it (we'll link this to a user later)
  submittedBy: {
    type: String // For now, we'll keep it simple
    // Later: type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' fields
  timestamps: true
});

// Create a 2dsphere index for geospatial queries (e.g., find reports near a point)
HazardReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HazardReport', HazardReportSchema);