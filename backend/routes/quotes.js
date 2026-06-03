const router = require('express').Router();
const { getDb } = require('../db/database');
const stripe = require('../services/stripeService');

// List quotes (all, or filtered by client)
router.get('/', (req, res) => {
  const { clientId, status } = req.query;
  let query = `
    SELECT q.*, c.name as client_name, c.company as client_company
    FROM quotes q JOIN clients c ON c.id = q.client_id
    WHERE 1=1
  `;
  const params = [];
  if (clientId) { query += ' AND q.client_id = ?'; params.push(clientId); }
  if (status) { query += ' AND q.status = ?'; params.push(status); }
  query += ' ORDER BY q.created_at DESC';
  res.json(getDb().prepare(query).all(...params));
});

// Get a single quote
router.get('/:id', (req, res) => {
  const quote = getDb().prepare(`
    SELECT q.*, c.name as client_name, c.company as client_company, c.email as client_email
    FROM quotes q JOIN clients c ON c.id = q.client_id
    WHERE q.id = ?
  `).get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  res.json(quote);
});

// Create a quote
router.post('/', (req, res) => {
  const { clientId, title, description, amount_cents, valid_until, status } = req.body;
  if (!clientId || !title || amount_cents == null) {
    return res.status(400).json({ error: 'clientId, title and amount_cents required' });
  }
  const db = getDb();
  const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  // Human-friendly sequential quote number, e.g. Q-2026-0007
  const seq = (db.prepare('SELECT COUNT(*) as n FROM quotes').get().n || 0) + 1;
  const number = req.body.number || `Q-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;

  const result = db.prepare(
    `INSERT INTO quotes (client_id, number, title, description, amount_cents, status, valid_until)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(clientId, number, title, description || null, amount_cents,
        status || 'draft', valid_until || null);

  res.status(201).json(db.prepare('SELECT * FROM quotes WHERE id = ?').get(result.lastInsertRowid));
});

// Update a quote
router.patch('/:id', (req, res) => {
  const db = getDb();
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });

  const fields = ['number', 'title', 'description', 'amount_cents', 'status', 'valid_until'];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  if (updates.status === 'accepted' && !quote.accepted_at) {
    updates.accepted_at = new Date().toISOString();
  }
  updates.updated_at = new Date().toISOString();
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE quotes SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);
  res.json(db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id));
});

// Delete a quote
router.delete('/:id', (req, res) => {
  const result = getDb().prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Quote not found' });
  res.status(204).end();
});

// Turn an accepted quote into an invoice the client can pay.
router.post('/:id/convert-to-invoice', async (req, res, next) => {
  const db = getDb();
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (quote.invoice_id) {
    return res.status(409).json({ error: 'Quote has already been converted to an invoice' });
  }
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(quote.client_id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  let stripeInvoiceId = null;
  let status = 'draft';
  if (client.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const inv = await stripe.createInvoice(
        client.stripe_customer_id, quote.amount_cents, quote.title
      );
      stripeInvoiceId = inv.id;
      status = inv.status;
    } catch (err) {
      return next(err);
    }
  }

  const invResult = db.prepare(
    `INSERT INTO invoices (client_id, stripe_invoice_id, amount_cents, description, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(quote.client_id, stripeInvoiceId, quote.amount_cents,
        `From quote ${quote.number}: ${quote.title}`, status, quote.valid_until || null);

  db.prepare(
    `UPDATE quotes SET status = 'accepted', accepted_at = COALESCE(accepted_at, ?), invoice_id = ?, updated_at = ? WHERE id = ?`
  ).run(new Date().toISOString(), invResult.lastInsertRowid, new Date().toISOString(), quote.id);

  res.status(201).json({
    quote: db.prepare('SELECT * FROM quotes WHERE id = ?').get(quote.id),
    invoice: db.prepare('SELECT * FROM invoices WHERE id = ?').get(invResult.lastInsertRowid),
  });
});

module.exports = router;
