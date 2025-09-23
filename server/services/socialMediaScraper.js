// /server/services/socialMediaScraper.js
const axios = require('axios');
const SocialPost = require('../models/SocialPost');
const { analyzeText } = require('./nlpService');

// --- 1. NEW DELAY HELPER FUNCTION ---
// This function allows us to pause execution between API calls.
const delay = (ms) => new Promise(res => setTimeout(res, ms));
// ------------------------------------

const COASTAL_CITIES_ARRAY = [
    'Mumbai', 'Chennai', 'Kolkata', 'Kochi', 'Vizag', 'Goa', 'Bangalore', 
    'Puri', 'Gujarat', 'Kerala', '"Bay of Bengal"', '"Arabian Sea"'
];
const HAZARD_TERMS = '"storm surge" OR "high waves" OR "tsunami warning" OR "cyclone alert" OR "sea level rise"';

const fetchGNews = async () => {
    let totalSaved = 0;
    for (const city of COASTAL_CITIES_ARRAY) {
        try {
            const searchQuery = `(${HAZARD_TERMS}) AND (${city})`;
            const GNEWS_API_URL = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&country=in&token=${process.env.GNEWS_API_KEY}`;
            
            console.log(`GNews: Searching for hazards in ${city}...`);
            const { data } = await axios.get(GNEWS_API_URL);
            if (!data.articles || data.articles.length === 0) {
                // --- 2. ADD THE DELAY HERE ---
                await delay(1000); // Wait 1 second before the next city
                continue; // Skip to the next city
            }

            const articlesToSave = data.articles.map(article => {
                const fullText = `${article.title}. ${article.description}`;
                const nlpData = analyzeText(fullText);
                return {
                    source: 'News', title: article.title, contentSnippet: article.description,
                    url: article.url, publishedAt: new Date(article.publishedAt), ...nlpData
                };
            });
            const result = await SocialPost.insertMany(articlesToSave, { ordered: false });
            totalSaved += result.length;
        } catch (error) {
            console.error(`Error fetching GNews for city "${city}":`, error.response ? error.response.data : error.message);
        }
        // --- AND ADD THE DELAY HERE ---
        await delay(1000); // Wait 1 second before the next city
    }
    console.log(`GNews: Found, analyzed, and saved ${totalSaved} new articles.`);
};

const fetchReddit = async () => {
    let totalSaved = 0;
    for (const city of COASTAL_CITIES_ARRAY) {
        try {
            const searchQuery = `(${HAZARD_TERMS}) AND (${city})`;
            const REDDIT_SEARCH_URL = `https://www.reddit.com/r/india/search.json`;

            console.log(`Reddit: Searching for hazards related to ${city} in r/india...`);
            const { data } = await axios.get(REDDIT_SEARCH_URL, { params: { q: searchQuery, restrict_sr: 'on', sort: 'new', limit: 5 } });
            if (data.data.children.length === 0) {
                // --- 3. ADD A DELAY FOR REDDIT TOO (GOOD PRACTICE) ---
                await delay(1000);
                continue;
            }

            const postsToSave = data.data.children.map(({ data: post }) => {
                const fullText = `${post.title}. ${post.selftext}`;
                const nlpData = analyzeText(fullText);
                return {
                    source: 'Reddit', title: post.title, contentSnippet: post.selftext.substring(0, 200),
                    url: `https://www.reddit.com${post.permalink}`, publishedAt: new Date(post.created_utc * 1000), ...nlpData
                };
            });
            const result = await SocialPost.insertMany(postsToSave, { ordered: false });
            totalSaved += result.length;
        } catch (error) {
            console.error(`Error fetching Reddit for city "${city}":`, error.response ? error.response.data : error.message);
        }
        // --- AND HERE ---
        await delay(1000);
    }
    console.log(`Reddit: Found, analyzed, and saved ${totalSaved} new posts.`);
};

const runAllScrapers = async () => {
  console.log('Running all social media scrapers with NLP analysis (per-city queries)...');
  await fetchGNews();
  await fetchReddit();
  console.log('All scrapers finished.');
};

module.exports = { runAllScrapers };