# Hamza — Full-Stack Software Engineer Portfolio

A professional, high-performance one-page portfolio and client acquisition website with an Express + SQLite backend built for **Hamza**, a Senior Software Engineer based in **Peshawar, Khyber Pakhtunkhwa, Pakistan**.

---

## 🌟 What Was Built

### 1. Frontend (Public Website)
- **Hero Section**: Strong, client-converting headline, concise intro highlighting experience in Peshawar, and two prominent CTAs:
  - **Message on WhatsApp** (direct link to `https://wa.me/923109820233` with pre-filled message)
  - **Send an email** (direct `mailto:sabirhamzasabir662@gmail.com`)
  - Trust indicators: "100% Client Satisfaction", "Full-Stack Web Apps & Databases", "Peshawar: On-site & Remote Ready"
- **Projects Section (Data-Driven)**:
  - Driven by the backend database (`GET /api/projects`) so you can add new projects without changing any frontend code.
  - **Pakistan Tobacco Board (PTB)**: Custom enterprise application for this major Peshawar organization (role-based security, regulatory audits, automated PDF/Excel reports).
  - **Arsalan Model School**: Comprehensive academic management web application & administrative portal (student records, automated fee slips, exam report cards).
- **Services Section**:
  - Web Applications
  - Business Systems
  - Websites
  - Support & Maintenance
- **Contact Section**:
  - **WhatsApp**: `03109820233` (direct link: `https://wa.me/923109820233`) with quick chat action
  - **Email**: `sabirhamzasabir662@gmail.com` with a 1-click **Copy to Clipboard** button
  - **Address**: Peshawar, Khyber Pakhtunkhwa, Pakistan
  - **Small Embedded Google Map**: Live map centered on Peshawar
  - **"Open in Google Maps" Button**: Direct external link
  - **Interactive Contact Form**: Validates client name, email, phone, and project details, saves inquiries directly to SQLite database, and triggers an email notification via Nodemailer.
- **Floating WhatsApp Widget**: Persistent floating button with pulsing glow on the bottom-right for instant messaging.
- **SEO & Accessibility**: Complete Open Graph, Twitter cards, JSON-LD Schema.org structured data, semantic HTML5, skip-to-content links, and WCAG AA contrast.

### 2. Backend & Database
- **Runtime**: Node.js with Express.js.
- **Database**: SQLite (stored in `./data/portfolio.db`). Zero external database dependencies or complex setup required. Tables are automatically created and seeded on the very first start.
- **Email Service**: Nodemailer configured with HTML notification templates sent to `sabirhamzasabir662@gmail.com`. Includes console fallback in development mode.
- **Dynamic API Endpoints**:
  - `GET /api/health`: Health status and server telemetry.
  - `GET /api/projects`: Fetches all portfolio projects.
  - `POST /api/projects`: Dynamically adds new projects to the database without editing code.
  - `GET /api/services`: Fetches all offered services.
  - `POST /api/contact`: Validates input, saves inquiries to database, and triggers email notification.
  - `GET /api/messages`: View all client inquiries submitted through the website.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended; v20 LTS is already installed on this machine).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already done for you):
```bash
cp .env.example .env
```

To enable live email dispatch to `sabirhamzasabir662@gmail.com`, open `.env` and provide your Gmail App Password:
```env
SMTP_USER=sabirhamzasabir662@gmail.com
SMTP_PASS=your_16_character_app_password
NOTIFICATION_RECEIVER=sabirhamzasabir662@gmail.com
```
*(Note: If left as default, all client messages are still safely stored in the database and logged to the server console!)*

### 3. Start the Server
```bash
npm start
```
The application will start at:
👉 **http://localhost:5000**

---

## 🛠️ Adding New Projects Dynamically

Because projects are driven by the backend, you can add new client work directly via API without touching frontend code:

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "KPK E-Commerce Platform",
    "client": "Peshawar Retail Group",
    "category": "Full-Stack Web Application",
    "sector": "Retail / Commercial",
    "description": "Multi-vendor store with online payment gateway and inventory tracking.",
    "highlights": [
      "Integrated Pakistani Payment Gateways (EasyPaisa/JazzCash)",
      "Real-time stock notifications",
      "Automated order invoicing"
    ],
    "tags": ["Node.js", "React", "SQLite", "E-Commerce"],
    "order_index": 3
  }'
```
Refreshing the portfolio website will immediately display the new project!

---

## ☁️ How to Deploy for Free

### Option 1: Render (Recommended for Full-Stack)
1. Push this project to GitHub.
2. Sign up for free at [render.com](https://render.com).
3. Click **New +** -> **Web Service** and connect your GitHub repository.
4. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `NODE_ENV=production`
   - `SMTP_USER=sabirhamzasabir662@gmail.com`
   - `SMTP_PASS=your_app_password`
6. Click **Deploy**. Render will generate a live HTTPS URL.

### Option 2: Railway
1. Sign up at [railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Railway automatically detects `server.js` and deploys it with free credits.

### Option 3: Vercel / Netlify (Static Frontend)
If you ever want to host just the frontend statically:
- The `public/` directory (or root `index.html`, `css/style.css`, `js/app.js`) is completely self-contained with offline fallbacks.
- Drag and drop the folder into **Netlify Drop** or deploy via **Vercel CLI**.
