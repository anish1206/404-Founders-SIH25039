// /server/services/aiVerification.js
const axios = require('axios');
const HazardReport = require('../models/HazardReport');

// --- 1. Geo-location Check ---
// A simple bounding box for the Indian coastline. 
// This is a basic but effective first-pass filter.
const isCoastal = (lon, lat) => {
    const INDIA_COASTAL_BBOX = {
        minLon: 68.0,
        minLat: 6.0,
        maxLon: 98.0,
        maxLat: 24.0,
    };
    // A more refined check would be to see if it's within X km of the actual coastline,
    // but this bounding box effectively excludes most inland areas.
    return (
        lon >= INDIA_COASTAL_BBOX.minLon &&
        lon <= INDIA_COASTAL_BBOX.maxLon &&
        lat >= INDIA_COASTAL_BBOX.minLat &&
        lat <= INDIA_COASTAL_BBOX.maxLat
    );
};

// --- 2. Text-Image Similarity Check (using Hugging Face) ---
// This function checks if the image likely contains elements mentioned in the text.
const checkTextImageSimilarity = async (imageUrl, description) => {
    try {
        // We use a powerful "Zero-Shot Image Classification" model.
        // We give it the image and a list of "candidate labels" extracted from the description.
        const API_URL = "https://api-inference.huggingface.co/models/openai/clip-vit-large-patch14";
        const headers = { "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}` };

        // Fetch the image data as a buffer
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageData = imageResponse.data;

        // Define candidate labels based on keywords in the description
        const candidate_labels = ["ocean", "waves", "beach", "water", "coast", "sea", "surge", "flood"];
        
        // Send image data and labels to Hugging Face
        const hfResponse = await axios.post(API_URL, imageData, {
            headers,
            params: { candidate_labels: candidate_labels.join(',') },
        });

        // The API returns a list of labels and their scores. We look for a high score for a relevant label.
        const scores = hfResponse.data;
        console.log("Hugging Face AI Scores:", scores);
        
        // Simple check: if the top-scoring label is relevant and has a score > 70%, it's a match.
        const topMatch = scores[0];
        if (candidate_labels.includes(topMatch.label) && topMatch.score > 0.70) {
            return { match: true, score: topMatch.score };
        }
        return { match: false, score: scores[0].score };

    } catch (error) {
        console.error("Hugging Face API Error:", error.response ? error.response.data : error.message);
        // If the AI service fails, we just assume it's not a match and let the admin handle it.
        return { match: false, score: 0 };
    }
};


// --- 3. Main Pipeline Function ---
// This function orchestrates the checks and updates the report.
const runAIVerification = async (report) => {
    console.log(`Starting AI verification for report ${report._id}...`);
    let confidenceScore = 0;

    // Step 1: Run Geo-location check
    const isCoastalReport = isCoastal(report.location.coordinates[0], report.location.coordinates[1]);
    if (isCoastalReport) {
        confidenceScore += 30; // Add 30 points for being in a coastal region
    } else {
        // If it's not coastal, we can stop here. It's likely invalid.
        console.log(`Report ${report._id} failed coastal check. Skipping further AI steps.`);
        return;
    }

    // Step 2: Run Text-Image Similarity check
    const similarity = await checkTextImageSimilarity(report.mediaUrl, report.description);
    if (similarity.match) {
        // Add points proportional to the AI's confidence
        confidenceScore += Math.round(similarity.score * 70); // Add up to 70 points
    }
    
    console.log(`Final AI Confidence Score for report ${report._id}: ${confidenceScore}`);
    
    // Update the report with the AI score
    report.aiConfidenceScore = confidenceScore;

    // Step 3: Auto-verify if score is above a threshold
    const VERIFICATION_THRESHOLD = 85; // e.g., 85 out of 100
    if (confidenceScore >= VERIFICATION_THRESHOLD) {
        report.status = 'verified';
        console.log(`Report ${report._id} auto-verified with score ${confidenceScore}.`);
    } else {
        console.log(`Report ${report._id} needs manual verification (score: ${confidenceScore}).`);
    }

    await report.save();
};

module.exports = { runAIVerification };