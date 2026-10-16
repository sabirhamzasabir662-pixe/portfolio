const { dbAll } = require('../config/db');

/**
 * GET /api/services
 * Returns all offered services
 */
async function getServices(req, res) {
  try {
    const rows = await dbAll('SELECT * FROM services ORDER BY order_index ASC, id ASC');

    const formatted = rows.map((service) => ({
      ...service,
      features: safeJsonParse(service.features, [])
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[-] Error fetching services:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve services' });
  }
}

function safeJsonParse(jsonString, fallback) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

module.exports = {
  getServices
};
