require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { getDb, migrate } = require('./database');

migrate();

// Seed a default admin user if none exists
const db = getDb();
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
if (!existing) {
  const hash = bcrypt.hashSync('changeme', 10);
  db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(
    'admin@example.com', hash, 'Admin'
  );
  console.log('Default admin created: admin@example.com / changeme');
}

// Seed a demo client (with portal login) so both dashboards have something to
// show out of the box. Skipped if any client already exists, and disabled
// entirely in production.
const clientCount = db.prepare('SELECT COUNT(*) as n FROM clients').get().n;
if (clientCount === 0 && process.env.NODE_ENV !== 'production') {
  const portalHash = bcrypt.hashSync('changeme', 10);
  const clientId = db.prepare(
    `INSERT INTO clients (name, email, company, stage, password_hash, portal_enabled)
     VALUES (?, ?, ?, ?, ?, 1)`
  ).run('Ada Lovelace', 'client@example.com', 'Analytical Engines Ltd', 'building', portalHash).lastInsertRowid;

  const serviceId = db.prepare(
    `INSERT INTO services (name, description, price_cents, billing_interval)
     VALUES (?, ?, ?, ?)`
  ).run('AI Agent Retainer', 'Ongoing development and tuning of custom AI agents', 250000, 'monthly').lastInsertRowid;

  db.prepare('INSERT INTO client_services (client_id, service_id) VALUES (?, ?)').run(clientId, serviceId);

  db.prepare(
    `INSERT INTO projects (client_id, name, description, status, due_date)
     VALUES (?, ?, ?, ?, date('now', '+21 days'))`
  ).run(clientId, 'Customer Support Agent', 'Build and launch a support automation agent', 'in_progress');

  db.prepare(
    `INSERT INTO invoices (client_id, amount_cents, description, status, due_date)
     VALUES (?, ?, ?, 'open', date('now', '+14 days'))`
  ).run(clientId, 250000, 'AI Agent Retainer — current month');
  db.prepare(
    `INSERT INTO invoices (client_id, amount_cents, description, status, paid_at)
     VALUES (?, ?, ?, 'paid', datetime('now', '-20 days'))`
  ).run(clientId, 250000, 'AI Agent Retainer — last month');

  db.prepare(
    `INSERT INTO quotes (client_id, number, title, description, amount_cents, status, valid_until)
     VALUES (?, ?, ?, ?, ?, 'sent', date('now', '+30 days'))`
  ).run(clientId, 'Q-' + new Date().getFullYear() + '-0001', 'Phase 2: Sales Agent',
        'Design and build an outbound sales automation agent', 800000);

  console.log('Demo client created: client@example.com / changeme');
}
