// /server/models/GovScheme.js
const mongoose = require('mongoose');

const GovSchemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  eligibility: { // A brief summary of who can apply
    type: String,
    required: true,
  },
  officialLink: { // The direct URL to the government scheme's website
    type: String,
    required: true,
  },
  category: { // e.g., "Housing", "Financial Aid", "Agriculture"
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('GovScheme', GovSchemeSchema);