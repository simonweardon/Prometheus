const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'prometheus.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Add a column to an existing table if it isn't there yet. CREATE TABLE
// IF NOT EXISTS never alters a table that already exists, so databases
// created before these columns were introduced need this top-up.
function ensureColumn(db, table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    console.log(`Migrated: added ${table}.${column}`);
  }
}

function migrate() {
  const db = getDb();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  // Additive migrations for databases created before these columns existed.
  ensureColumn(db, 'clients', 'stage', "stage TEXT NOT NULL DEFAULT 'lead'");
  ensureColumn(db, 'clients', 'password_hash', 'password_hash TEXT');
  ensureColumn(db, 'clients', 'portal_enabled', 'portal_enabled INTEGER NOT NULL DEFAULT 0');

  console.log('Database migrated successfully');
}

module.exports = { getDb, migrate };
