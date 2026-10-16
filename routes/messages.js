const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/contactController');

// GET /api/messages
router.get('/', getMessages);

module.exports = router;
