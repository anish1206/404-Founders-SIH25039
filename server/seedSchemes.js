// /server/seedSchemes.js
// This is a one-time script to populate your database with sample government schemes
const mongoose = require('mongoose');
const GovScheme = require('./models/GovScheme');
require('dotenv').config();

const sampleSchemes = [
  {
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "A crop insurance scheme that provides financial support to farmers suffering crop loss/damage arising out of unforeseen events including natural disasters.",
    eligibility: "All farmers (sharecroppers & tenant farmers included) growing notified crops in notified areas are eligible.",
    officialLink: "https://pmfby.gov.in/",
    category: "Agriculture"
  },
  {
    title: "Pradhan Mantri Awas Yojana - Gramin",
    description: "Housing scheme for rural areas providing financial assistance for construction of pucca houses to homeless and those living in kutcha houses.",
    eligibility: "Rural families without pucca house, families with 0-2 rooms with kutcha walls and roof.",
    officialLink: "https://pmayg.nic.in/",
    category: "Housing"
  },
  {
    title: "National Disaster Response Fund (NDRF)",
    description: "Provides immediate relief and rehabilitation to people affected by natural disasters including cyclones, floods, and tsunamis.",
    eligibility: "Victims of natural disasters as declared by state/central government.",
    officialLink: "https://ndma.gov.in/",
    category: "Disaster Relief"
  },
  {
    title: "Fisheries and Aquaculture Infrastructure Development Fund (FIDF)",
    description: "Provides financial assistance for development of fisheries infrastructure including modernization of fishing harbors and fish markets.",
    eligibility: "Fishermen cooperatives, self-help groups, and private entrepreneurs in fisheries sector.",
    officialLink: "https://dof.gov.in/",
    category: "Fisheries"
  },
  {
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Income support scheme providing ₹6,000 per year in three equal installments to farmer families.",
    eligibility: "All landholding farmer families having cultivable land.",
    officialLink: "https://pmkisan.gov.in/",
    category: "Financial Aid"
  },
  {
    title: "Coastal Aquaculture Authority Support Scheme",
    description: "Promotes sustainable coastal aquaculture development and provides support for eco-friendly aquaculture practices.",
    eligibility: "Coastal aquaculture farmers and entrepreneurs following CAA guidelines.",
    officialLink: "https://caa.gov.in/",
    category: "Aquaculture"
  }
];

async function seedSchemes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB Atlas!');
    
    // Clear existing schemes (optional)
    await GovScheme.deleteMany({});
    console.log('Cleared existing schemes');
    
    // Insert sample schemes
    const result = await GovScheme.insertMany(sampleSchemes);
    console.log(`Successfully inserted ${result.length} government schemes!`);
    
    // Close connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('Error seeding schemes:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedSchemes();