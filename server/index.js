// /server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CRITICAL MIDDLEWARE SETUP ---
// 1. Enable CORS for all requests. This must come before your routes.
// This tells the server to accept requests from different origins (like your Expo app).
app.use(cors());

// 2. Enable the server to parse JSON in the body of POST/PATCH requests.
// This must also come before your routes.
app.use(express.json());
// --------------------------------

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB Atlas!'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// --- API Routes (These come AFTER the middleware) ---
app.use('/api/reports', require('./routes/reports'));
app.use('/api/social', require('./routes/social'));
app.use('/api/schemes', require('./routes/schemes'));

// Test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('INCOIS Hazard Platform API is running!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`Local network access: http://192.168.43.252:${PORT}`);
});