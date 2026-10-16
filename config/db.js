const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_FILE 
  ? path.resolve(process.cwd(), process.env.DATABASE_FILE)
  : path.join(dataDir, 'portfolio.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[-] Error connecting to SQLite database:', err.message);
  } else {
    console.log(`[+] Connected to SQLite database at ${dbPath}`);
    initializeDatabase();
  }
});

// Promisified helper wrappers for cleaner async/await
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize schema and seed data if tables are empty
async function initializeDatabase() {
  try {
    // 1. Projects table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        client TEXT NOT NULL,
        category TEXT NOT NULL,
        sector TEXT NOT NULL,
        description TEXT NOT NULL,
        highlights TEXT NOT NULL, -- JSON array string
        tags TEXT NOT NULL,       -- JSON array string
        featured INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Services table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        features TEXT NOT NULL,   -- JSON array string
        icon_name TEXT DEFAULT 'code',
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Contact messages table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        ip_address TEXT,
        email_sent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check and seed projects
    const existingProjects = await dbAll('SELECT COUNT(*) as count FROM projects');
    if (existingProjects[0].count === 0) {
      console.log('[*] Seeding default projects into database...');
      
      // Project 1: Pakistan Tobacco Board
      await dbRun(`
        INSERT INTO projects (title, client, category, sector, description, highlights, tags, featured, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Pakistan Tobacco Board (PTB)',
        'Pakistan Tobacco Board',
        'Custom Enterprise Application',
        'Major Peshawar Organization',
        'Custom enterprise application engineered for the Peshawar headquarters to streamline regulatory reporting, operational auditing, and role-based administrative workflows.',
        JSON.stringify([
          'Role-Based Access Control: Multi-tiered permission hierarchy for officers and administrative staff.',
          'Data Management & Auditing: Secure record storage with automated logs, validation, and instantaneous search indexing.',
          'Automated Reporting: Exportable operational reports (PDF/Excel) saving dozens of manual paperwork hours weekly.'
        ]),
        JSON.stringify(['Enterprise Architecture', 'Relational Database', 'Role-Based Security', 'Reporting Engine', 'Custom Workflows']),
        1,
        1
      ]);

      // Project 2: Arsalan Model School
      await dbRun(`
        INSERT INTO projects (title, client, category, sector, description, highlights, tags, featured, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Arsalan Model School',
        'Arsalan Model School',
        'Integrated School Management Web Application',
        'Education Sector',
        'Modern centralized web application replacing scattered paper ledgers with an intuitive platform to oversee student enrollments, fee records, academic grading, and teacher assignments from any device.',
        JSON.stringify([
          'Student & Staff Profiles: Centralized digital directory with admission history and attendance records.',
          'Fee Management & Receipts: Automated fee collection tracking, pending balance alerts, and 1-click printable student fee slips.',
          'Examinations & Report Cards: Grade calculations, term ranking, and automated generation of printable student report cards.'
        ]),
        JSON.stringify(['School Management System', 'Student Portal', 'Fee Tracking', 'Printable Slips & Cards', 'Responsive UI']),
        1,
        2
      ]);

      console.log('[+] Default projects seeded successfully.');
    }

    // Check and seed services
    const existingServices = await dbAll('SELECT COUNT(*) as count FROM services');
    if (existingServices[0].count === 0) {
      console.log('[*] Seeding default services into database...');

      const defaultServices = [
        {
          title: 'Web Applications',
          slug: 'web-applications',
          description: 'Custom dynamic applications built to solve complex problems. From client portals and SaaS platforms to data-driven interactive tools, engineered with fast load speeds and reliable architectures.',
          features: JSON.stringify([
            'Single-page & multi-page applications',
            'Authentication & role authorizations',
            'API integrations & external data feeds',
            'Real-time data synchronization'
          ]),
          icon_name: 'monitor',
          order_index: 1
        },
        {
          title: 'Business Systems',
          slug: 'business-systems',
          description: 'Enterprise software and internal operational tools that replace slow spreadsheets and manual workflows. Built for high reliability, strict data compliance, and multi-user collaboration.',
          features: JSON.stringify([
            'ERP & CRM custom implementations',
            'School & organization management systems',
            'Inventory, billing, and accounting modules',
            'Automated PDF, Excel & analytics exports'
          ]),
          icon_name: 'briefcase',
          order_index: 2
        },
        {
          title: 'Websites',
          slug: 'websites',
          description: 'High-converting, ultra-fast, and responsive portfolio, corporate, and landing pages designed to showcase your brand, establish credibility, and generate client inquiries across all mobile and desktop devices.',
          features: JSON.stringify([
            '100% responsive and mobile-first design',
            'SEO-optimized structure & meta tags',
            'Sub-second page loading speeds',
            'Direct WhatsApp & form lead generation'
          ]),
          icon_name: 'globe',
          order_index: 3
        },
        {
          title: 'Support & Maintenance',
          slug: 'support',
          description: 'Long-term technical partnership to keep your systems running smoothly. From bug fixes and feature upgrades to database backups, domain configuration, and server performance monitoring.',
          features: JSON.stringify([
            'Regular maintenance & system updates',
            'Database backup & disaster recovery',
            'Hosting, server, and SSL management',
            'Rapid troubleshooting & hotline assistance'
          ]),
          icon_name: 'tool',
          order_index: 4
        }
      ];

      for (const s of defaultServices) {
        await dbRun(`
          INSERT INTO services (title, slug, description, features, icon_name, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [s.title, s.slug, s.description, s.features, s.icon_name, s.order_index]);
      }

      console.log('[+] Default services seeded successfully.');
    }

  } catch (error) {
    console.error('[-] Error initializing database schema:', error);
  }
}

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet
};
