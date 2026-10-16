const nodemailer = require('nodemailer');

/**
 * Creates and returns configured Nodemailer transport
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || pass === 'your_gmail_app_password_here') {
    return null; // SMTP credentials not yet provided
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Sends notification email to Hamza
 * @param {Object} details { name, email, phone, message }
 * @returns {Promise<{ success: boolean, reason?: string, messageId?: string }>}
 */
async function sendContactNotification({ name, email, phone, message }) {
  const receiver = process.env.NOTIFICATION_RECEIVER || 'sabirhamzasabir662@gmail.com';
  const transporter = createTransporter();

  // Clean phone number for WhatsApp reply URL
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const waReplyLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  const subject = `[New Client Inquiry] ${name} via Portfolio Website`;

  const textContent = `
NEW CLIENT INQUIRY RECEIVED
--------------------------------------------------
Sender Name:    ${name}
Email Address:  ${email}
Phone / WA:     ${phone || 'Not provided'}
Submitted At:   ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} (Pakistan Time)

Client Message:
${message}
--------------------------------------------------
This inquiry was submitted from your portfolio website (Peshawar, Pakistan).
`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .header { background: #0f172a; padding: 24px; color: #ffffff; text-align: left; }
        .header h2 { margin: 0; font-size: 20px; color: #10b981; }
        .header p { margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; }
        .body { padding: 24px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 4px; }
        .value { font-size: 15px; color: #0f172a; font-weight: 600; }
        .message-box { background: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; font-size: 14px; white-space: pre-wrap; color: #334155; margin-top: 12px; }
        .actions { margin-top: 24px; display: flex; gap: 12px; }
        .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; }
        .btn-reply { background: #10b981; color: #ffffff; }
        .btn-wa { background: #25d366; color: #ffffff; }
        .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>New Client Inquiry Received</h2>
          <p>Portfolio Contact Form • Hamza Software Engineer (Peshawar)</p>
        </div>
        <div class="body">
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">${escapeHtml(name)}</div>
          </div>
          <div class="field">
            <div class="label">Email Address</div>
            <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
          </div>
          <div class="field">
            <div class="label">Phone / WhatsApp</div>
            <div class="value">${phone ? escapeHtml(phone) : '<em style="color:#94a3b8;">Not provided</em>'}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${escapeHtml(message)}</div>
          </div>
          <div class="actions">
            <a href="mailto:${escapeHtml(email)}?subject=Re:%20Your%20Inquiry%20to%20Hamza" class="btn btn-reply">Reply via Email</a>
            ${waReplyLink ? `<a href="${waReplyLink}" class="btn btn-wa" target="_blank">Chat on WhatsApp</a>` : ''}
          </div>
        </div>
        <div class="footer">
          Received on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} PKT
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.warn('[!] SMTP credentials not configured in .env. Message saved to database. Email logged below:');
    console.log('--------------------------------------------------');
    console.log(`To: ${receiver}`);
    console.log(`Subject: ${subject}`);
    console.log(textContent);
    console.log('--------------------------------------------------');
    return { success: false, reason: 'smtp_not_configured_logged_to_console' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Hamza Portfolio Contact" <${process.env.SMTP_USER}>`,
      replyTo: `"${name}" <${email}>`,
      to: receiver,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log('[+] Email successfully delivered via Nodemailer:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[-] Nodemailer dispatch error:', error.message);
    return { success: false, reason: error.message };
  }
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  sendContactNotification
};
