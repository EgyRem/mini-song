const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database
const db = require('./db-postgres');

// Import routes
const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlist');
const songRoutes = require('./routes/song');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🎵 Mini Spotify Server Started');
    console.log('='.repeat(60));
    console.log('✅ Server running on port:', PORT);
    console.log('✅ Environment:', process.env.NODE_ENV);
    console.log('✅ JWT Secret configured:', !!process.env.JWT_SECRET);
    console.log('✅ Database:', process.env.DB_HOST || 'Supabase PostgreSQL');
    console.log('='.repeat(60) + '\n');
  });
}

// Export for Vercel serverless
module.exports = app;

