require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const userMeetingRoutes = require('./routes/userMeetingRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - Allow all origins during development/testing
app.use(cors({
  origin: true, // Allow all origins temporarily 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/user-meetings', userMeetingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Welcome to the KnowledgeConnect' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 