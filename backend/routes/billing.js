const router = require('express').Router();
const { getDb } = require('../db/database');
const stripe = require('../services/stripeService');

// List invoices (all or by client)
router.get('/invoices', (req, res) => {
  const { clientId } = req.query;
  let query = `
    SELECT i.*, c.name as client_name, c.email as client_email
    FROM invoices i JOIN clients c ON c.id = i.client_id
    WHERE 1=1
  `;
  const params = [];
  if (clientId) { query += ' AND i.client_id = ?'; params.push(clientId); }
  query += ' ORDER BY i.created_at DESC';
  res.json(getDb().prepare(query).all(...params));
});

// Get single invoice
router.get('/invoices/:id', (req, res) => {
  const invoice = getDb().prepare(`
    SELECT i.*, c.name as client_name, c.email as client_email
    FROM invoices i JOIN clients c ON c.id = i.client_id
    WHERE i.id = ?
  `).get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

// Create a manual invoice for a client
router.post('/invoices', async (req, res, next) => {
  const { clientId, amount_cents, description, due_date } = req.body;
  if (!clientId || !amount_cents) {
    return res.status(400).json({ error: 'clientId and amount_cents required' });
  }

  const db = getDb();
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  let stripeInvoiceId = null;
  let status = 'draft';

  if (client.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const inv = await stripe.createInvoice(client.stripe_customer_id, amount_cents, description || 'Invoice');
      stripeInvoiceId = inv.id;
      status = inv.status;
    } catch (err) {
      return next(err);
    }
  }

  const result = db.prepare(
    'INSERT INTO invoices (client_id, stripe_invoice_id, amount_cents, description, status, due_date) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(clientId, stripeInvoiceId, amount_cents, description || null, status, due_date || null);

  res.status(201).json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(result.lastInsertRowid));
});

// Sync invoice status from Stripe
router.post('/invoices/:id/sync', async (req, res, next) => {
  const db = getDb();
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (!invoice.stripe_invoice_id) return res.status(400).json({ error: 'No Stripe invoice linked' });

  try {
    const stripeInv = await stripe.retrieveInvoice(invoice.stripe_invoice_id);
    const paidAt = stripeInv.status_transitions?.paid_at
      ? new Date(stripeInv.status_transitions.paid_at * 1000).toISOString()
      : null;
    db.prepare('UPDATE invoices SET status = ?, paid_at = ? WHERE id = ?')
      .run(stripeInv.status, paidAt, invoice.id);
    res.json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice.id));
  } catch (err) {
    next(err);
  }
});

// Billing summary for a client
router.get('/summary/:clientId', (req, res) => {
  const db = getDb();
  const client = db.prepare('SELECT id, name, email, stripe_customer_id FROM clients WHERE id = ?').get(req.params.clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const summary = db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) as total_paid_cents,
      SUM(CASE WHEN status = 'open' THEN amount_cents ELSE 0 END) as total_outstanding_cents,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoice_count,
      COUNT(CASE WHEN status = 'open' THEN 1 END) as open_invoice_count
    FROM invoices WHERE client_id = ?
  `).get(req.params.clientId);

  const monthly = db.prepare(`
    SELECT SUM(s.price_cents) as monthly_recurring_cents
    FROM client_services cs
    JOIN services s ON s.id = cs.service_id
    WHERE cs.client_id = ? AND cs.status = 'active' AND s.billing_interval = 'monthly'
  `).get(req.params.clientId);

  res.json({ client, ...summary, monthly_recurring_cents: monthly?.monthly_recurring_cents || 0 });
});

module.exports = router;
