// /server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB Atlas!'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// --- API Routes ---
app.use('/api/reports', require('./routes/reports'));
app.use('/api/social', require('./routes/social')); // <-- ADD THIS LINE

app.get('/', (req, res) => {
  res.send('INCOIS Hazard Platform API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});