// Create or update an admin (staff) user.
//
//   node db/createAdmin.js <email> [password] [name]
//
// If no password is given, a strong one is generated and printed once.
// Re-running with an existing email resets that user's password.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getDb, migrate } = require('./database');

const email = process.argv[2];
let password = process.argv[3];
const name = process.argv[4] || 'Admin';

if (!email) {
  console.error('Usage: node db/createAdmin.js <email> [password] [name]');
  process.exit(1);
}

let generated = false;
if (!password) {
  // 18 random bytes -> URL-safe-ish password
  password = crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, '').slice(0, 20);
  generated = true;
} else if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

migrate(); // ensure tables exist
const db = getDb();
const hash = bcrypt.hashSync(password, 10);
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

if (existing) {
  db.prepare('UPDATE users SET password_hash = ?, name = ? WHERE id = ?').run(hash, name, existing.id);
  console.log(`Updated admin: ${email}`);
} else {
  db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, name);
  console.log(`Created admin: ${email}`);
}

if (generated) {
  console.log(`Generated password: ${password}`);
  console.log('Store it now — it will not be shown again.');
}
