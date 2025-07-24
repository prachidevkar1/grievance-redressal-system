// server.js
const express = require('express');
const cors = require('cors');
const grievanceRoutes = require('./routes/grievance');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', grievanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});