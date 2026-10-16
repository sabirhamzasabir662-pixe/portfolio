const { dbRun, dbAll } = require('../config/db');
const { sendContactNotification } = require('../services/emailService');

/**
 * POST /api/contact
 * Handles client contact form submissions, validates input, saves to SQLite, and sends email notification via Nodemailer
 */
async function submitContact(req, res) {
  try {
    const { name, email, phone, message } = req.body;

    // Strict Server-Side Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid name (at least 2 characters).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address so Hamza can reach you.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a message describing your project or question (at least 5 characters).'
      });
    }

    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone ? phone.trim() : null;
    const sanitizedMessage = message.trim();
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // 1. Save to database first so the client's inquiry is never lost
    const dbResult = await dbRun(`
      INSERT INTO messages (name, email, phone, message, ip_address, email_sent)
      VALUES (?, ?, ?, ?, ?, 0)
    `, [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedMessage, ipAddress]);

    const messageRecordId = dbResult.id;
    console.log(`[+] New client message saved to database (ID: ${messageRecordId})`);

    // 2. Dispatch email notification asynchronously
    const emailResult = await sendContactNotification({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage
    });

    if (emailResult.success) {
      await dbRun('UPDATE messages SET email_sent = 1 WHERE id = ?', [messageRecordId]);
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received, and Hamza will get back to you shortly.',
      referenceId: messageRecordId
    });

  } catch (error) {
    console.error('[-] Error handling contact submission:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while sending your message. Please reach out directly on WhatsApp at 03109820233.'
    });
  }
}

/**
 * GET /api/messages
 * Retrieves submitted messages (for administrative review)
 */
async function getMessages(req, res) {
  try {
    const messages = await dbAll('SELECT id, name, email, phone, message, email_sent, created_at FROM messages ORDER BY id DESC LIMIT 50');
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('[-] Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve messages' });
  }
}

module.exports = {
  submitContact,
  getMessages
};
