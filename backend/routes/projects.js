const router = require('express').Router();
const { getDb } = require('../db/database');

// List all projects (optionally filter by client or status)
router.get('/', (req, res) => {
  const { clientId, status } = req.query;
  let query = `
    SELECT p.*, c.name as client_name, c.company as client_company
    FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE 1=1
  `;
  const params = [];
  if (clientId) { query += ' AND p.client_id = ?'; params.push(clientId); }
  if (status) { query += ' AND p.status = ?'; params.push(status); }
  query += ' ORDER BY p.due_date ASC, p.created_at DESC';
  res.json(getDb().prepare(query).all(...params));
});

// Get single project
router.get('/:id', (req, res) => {
  const project = getDb().prepare(`
    SELECT p.*, c.name as client_name, c.company as client_company
    FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Create project
router.post('/', (req, res) => {
  const { clientId, name, description, status, due_date } = req.body;
  if (!clientId || !name) return res.status(400).json({ error: 'clientId and name required' });

  const client = getDb().prepare('SELECT id FROM clients WHERE id = ?').get(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const result = getDb().prepare(
    'INSERT INTO projects (client_id, name, description, status, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(clientId, name, description || null, status || 'pending', due_date || null);

  res.status(201).json(getDb().prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid));
});

// Update project
router.patch('/:id', (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const fields = ['name', 'description', 'status', 'due_date'];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  updates.updated_at = new Date().toISOString();
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE projects SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
});

// Delete project
router.delete('/:id', (req, res) => {
  const result = getDb().prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
  res.status(204).end();
});

module.exports = router;
