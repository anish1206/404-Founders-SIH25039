const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads environment variables from a .env file into process.env

const app = express();
const PORT = process.env.PORT || 5000;

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing to allow our frontend to communicate with this backend
app.use(cors());
// Allow the server to accept and parse JSON in the request body
app.use(express.json());


// --- MongoDB Connection ---
// Connect to the database using the connection string from our .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB Atlas!'))
.catch((err) => console.error('Error connecting to MongoDB:', err));


// --- API Routes ---
// This is the main router for our application.
// It tells Express that for any request that starts with '/api/reports',
// it should use the routes defined in the './routes/reports' file.
app.use('/api/reports', require('./routes/reports'));


// --- A simple root route to check if the server is running ---
app.get('/', (req, res) => {
  res.send('INCOIS Hazard Platform API is running!');
});


// --- Start the server ---
// This command starts the server and makes it listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});