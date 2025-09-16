// /server/services/socialMediaScraper.js
const axios = require('axios');
const SocialPost = require('../models/SocialPost');

// --- MODIFIED KEYWORDS FOR INDIA-SPECIFIC RESULTS ---
const COASTAL_CITIES = 'Mumbai OR Chennai OR Kolkata OR Kochi OR Vizag OR "Visakhapatnam" OR Goa OR Mangalore OR Puri OR Gujarat OR Kerala OR "Bay of Bengal" OR "Arabian Sea"';
const HAZARD_TERMS = '"storm surge" OR "high waves" OR "tsunami warning" OR "cyclone alert" OR "sea level rise"';
// We combine them to find hazards mentioned in the context of Indian locations.
const KEYWORDS = `(${HAZARD_TERMS}) AND (${COASTAL_CITIES})`;
// --- END OF MODIFICATION ---

const GNEWS_API_URL = `https://gnews.io/api/v4/search?q=${encodeURIComponent(KEYWORDS)}&lang=en&country=in&token=${process.env.GNEWS_API_KEY}`;
// We can also search more subreddits
const REDDIT_SUBREDDITS = ['india', 'mumbai', 'chennai', 'kerala', 'kolkata'];

// --- GNews Fetcher ---
const fetchGNews = async () => {
  try {
    const { data } = await axios.get(GNEWS_API_URL);
    if (!data.articles) {
        console.log('GNews: No new articles found for the specified keywords.');
        return;
    }
    const articlesToSave = data.articles.map(article => ({
      source: 'News',
      title: article.title,
      contentSnippet: article.description,
      url: article.url,
      publishedAt: new Date(article.publishedAt),
    }));
    await SocialPost.insertMany(articlesToSave, { ordered: false });
    console.log(`GNews: Found and saved ${articlesToSave.length} new articles.`);
  } catch (error) {
    console.error('Error fetching from GNews:', error.response ? error.response.data : 'An unknown error occurred');
  }
};

// --- Reddit Fetcher (Now searches multiple subreddits) ---
const fetchReddit = async () => {
    let totalSaved = 0;
    for (const subreddit of REDDIT_SUBREDDITS) {
        try {
            const REDDIT_SEARCH_URL = `https://www.reddit.com/r/${subreddit}/search.json`;
            const { data } = await axios.get(REDDIT_SEARCH_URL, {
                params: { q: KEYWORDS, restrict_sr: 'on', sort: 'new', limit: 10 }
            });
            const posts = data.data.children;
            if (posts.length === 0) continue;

            const postsToSave = posts.map(({ data: post }) => ({
                source: 'Reddit',
                title: post.title,
                contentSnippet: post.selftext.substring(0, 200),
                url: `https://www.reddit.com${post.permalink}`,
                publishedAt: new Date(post.created_utc * 1000),
            }));
            const result = await SocialPost.insertMany(postsToSave, { ordered: false });
            totalSaved += result.length;
        } catch (error) {
            // If a subreddit search fails (e.g., subreddit doesn't exist), log it and continue
            console.error(`Error fetching from r/${subreddit}:`, error.response ? error.response.data.message : 'An unknown error occurred');
        }
    }
    console.log(`Reddit: Found and saved ${totalSaved} new posts across all subreddits.`);
};

// --- Main Runner ---
const runAllScrapers = async () => {
  console.log('Running all social media scrapers with India-focused keywords...');
  await fetchGNews();
  await fetchReddit();
  console.log('All scrapers finished.');
};

module.exports = { runAllScrapers };