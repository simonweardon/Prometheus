require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { getDb, migrate } = require('./database');

migrate();

const db = getDb();

// Provision an admin from the environment. Set ADMIN_EMAIL and ADMIN_PASSWORD
// in your deploy env to create your own login on first start. This is
// create-only, so restarts won't overwrite a password you later change in-app;
// use `npm run create-admin -- <email> <password>` to reset one explicitly.
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  const found = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!found) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(
      adminEmail, hash, process.env.ADMIN_NAME || 'Admin'
    );
    console.log(`Admin created from env: ${adminEmail}`);
  }
}

// Seed a default dev admin if no admin exists at all (skipped in production).
const anyAdmin = db.prepare('SELECT id FROM users LIMIT 1').get();
if (!anyAdmin && process.env.NODE_ENV !== 'production') {
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
