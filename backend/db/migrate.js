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
