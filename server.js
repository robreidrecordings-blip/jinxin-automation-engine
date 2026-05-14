/**
 * JINXIN CHAMBERS API ENGINE
 * Central API hub connecting all three Copper Glow Shop sites
 * Commerce | Content | Media
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    'https://thecopperglowshop.co.uk',
    'https://thecopperglowshop.com',
    'https://thecopperglowshop.net',
    'https://pinsandneedlesrecords.com',
    process.env.DEV_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// ─── ENGINES ──────────────────────────────────────────────────────────────────
const commerceEngine  = require('./engines/commerce');
const contentEngine   = require('./engines/content');
const mediaEngine     = require('./engines/media');

app.use('/api/commerce', commerceEngine);
app.use('/api/content',  contentEngine);
app.use('/api/media',    mediaEngine);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    name: 'Jinxin Chambers API',
    version: '1.0.0',
    engines: ['commerce', 'content', 'media'],
    timestamp: new Date().toISOString()
  });
});

// ─── ROOT ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🌙 Welcome to the Jinxin Chambers API',
    docs: '/api/docs',
    health: '/api/health',
    engines: {
      commerce: '/api/commerce',
      content:  '/api/content',
      media:    '/api/media'
    }
  });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🌙 Jinxin Chambers API running on port ${PORT}`);
});

module.exports = app;
