require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const { db } = require('./config/db');

// API Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/github', require('./routes/github'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hamza Portfolio Backend API',
    location: 'Peshawar, Khyber Pakhtunkhwa, Pakistan',
    database: 'SQLite (connected)'
  });
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname, 'public')));

// SPA / fallback handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
const server = app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 Hamza Portfolio Server is running!`);
  console.log(`🌐 Local URL:     http://localhost:${PORT}`);
  console.log(`⚡ API Health:    http://localhost:${PORT}/api/health`);
  console.log(`📂 Projects API:  http://localhost:${PORT}/api/projects`);
  console.log(`🛠️  Services API:  http://localhost:${PORT}/api/services`);
  console.log(`✉️  Contact API:   http://localhost:${PORT}/api/contact`);
  console.log('========================================================');
});

// Handle graceful termination
process.on('SIGINT', () => {
  console.log('\n[!] Shutting down server gracefully...');
  db.close((err) => {
    if (err) console.error('Error closing database:', err.message);
    else console.log('[+] Database connection closed.');
    server.close(() => {
      console.log('[+] Server terminated.');
      process.exit(0);
    });
  });
});

module.exports = app;
