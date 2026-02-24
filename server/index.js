const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const practiceRoutes = require('./routes/practiceRoutes');

const app = express();

// ── Core Middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files ─────────────────────────────────────────
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ── Health check (always available) ─────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PromptQuest server running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── DB guard middleware ─ must be before routes ──────────
let dbConnected = false;
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!dbConnected) {
    return res.status(503).json({
      message: 'Database not connected. Please set a valid MONGO_URI in server/.env (use MongoDB Atlas free tier at https://cloud.mongodb.com)',
    });
  }
  next();
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/practice', practiceRoutes);

// ── Start server & connect DB ────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    dbConnected = true;
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('👉 Fix: Update MONGO_URI in server/.env with a MongoDB Atlas connection string.');
    console.error('   Free cluster at https://cloud.mongodb.com');
  });
