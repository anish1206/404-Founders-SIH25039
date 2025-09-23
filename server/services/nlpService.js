// /server/services/nlpService.js
const Sentiment = require('sentiment');
const rake = require('node-rake');

const sentiment = new Sentiment();

const analyzeText = (text) => {
  // 1. Sentiment Analysis
  const sentimentResult = sentiment.analyze(text);
  const sentimentScore = sentimentResult.comparative;

  // 2. Keyword Extraction
  // FIX: The 'rake.generate' function uses English stopwords by default.
  // We remove the explicit (and incorrect) call to 'rake.stopwords.en'.
  const keywords = rake.generate(text).slice(0, 5);

  // 3. Hashtag Extraction
  const hashtags = text.match(/#\w+/g) || [];

  return {
    sentimentScore,
    keywords,
    hashtags: hashtags.map(h => h.toLowerCase())
  };
};

module.exports = { analyzeText };