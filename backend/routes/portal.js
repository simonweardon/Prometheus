const router = require('express').Router();
const { getDb } = require('../db/database');
const stripe = require('../services/stripeService');

// Every handler here is mounted behind requireClient, so req.clientId is the
// authenticated client and all queries are scoped to it — a client can only
// ever see and act on their own data.

// Profile + a small billing/account summary for the dashboard header.
router.get('/me', (req, res) => {
  const db = getDb();
  const client = db.prepare(
    'SELECT id, name, email, phone, company, stage, created_at FROM clients WHERE id = ?'
  ).get(req.clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const summary = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_cents END), 0) as total_paid_cents,
      COALESCE(SUM(CASE WHEN status = 'open' THEN amount_cents END), 0) as total_outstanding_cents,
      COUNT(CASE WHEN status = 'open' THEN 1 END) as open_invoice_count
    FROM invoices WHERE client_id = ?
  `).get(req.clientId);

  client.services = db.prepare(`
    SELECT cs.status, s.name as service_name, s.description, s.price_cents, s.billing_interval
    FROM client_services cs JOIN services s ON s.id = cs.service_id
    WHERE cs.client_id = ? ORDER BY cs.started_at DESC
  `).all(req.clientId);

  client.projects = db.prepare(
    'SELECT name, description, status, due_date FROM projects WHERE client_id = ? ORDER BY created_at DESC'
  ).all(req.clientId);

  res.json({ ...client, ...summary });
});

// The client's own invoices.
router.get('/invoices', (req, res) => {
  res.json(getDb().prepare(
    'SELECT * FROM invoices WHERE client_id = ? ORDER BY created_at DESC'
  ).all(req.clientId));
});

// The client's own quotes.
router.get('/quotes', (req, res) => {
  res.json(getDb().prepare(
    'SELECT * FROM quotes WHERE client_id = ? ORDER BY created_at DESC'
  ).all(req.clientId));
});

// Saved payment methods (no secrets exposed).
router.get('/payment-methods', (req, res) => {
  res.json(getDb().prepare(
    'SELECT id, type, last4, brand, is_default FROM payment_methods WHERE client_id = ? ORDER BY is_default DESC'
  ).all(req.clientId));
});

// Get a Stripe-hosted link the client can use to pay an invoice in-browser.
router.get('/invoices/:id/pay-link', async (req, res, next) => {
  const db = getDb();
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND client_id = ?')
    .get(req.params.id, req.clientId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status === 'paid') return res.status(400).json({ error: 'Invoice is already paid' });
  if (!invoice.stripe_invoice_id) {
    return res.status(400).json({ error: 'This invoice is not yet ready for online payment. Please contact us.' });
  }
  try {
    const stripeInv = await stripe.retrieveInvoice(invoice.stripe_invoice_id);
    if (!stripeInv.hosted_invoice_url) {
      return res.status(400).json({ error: 'Payment page is not available for this invoice yet.' });
    }
    res.json({ url: stripeInv.hosted_invoice_url });
  } catch (err) {
    next(err);
  }
});

// Pay an invoice immediately using the client's default saved payment method.
router.post('/invoices/:id/pay', async (req, res, next) => {
  const db = getDb();
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND client_id = ?')
    .get(req.params.id, req.clientId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status === 'paid') return res.status(400).json({ error: 'Invoice is already paid' });
  if (!invoice.stripe_invoice_id) {
    return res.status(400).json({ error: 'This invoice cannot be paid online yet. Please contact us.' });
  }

  try {
    const paid = await stripe.payInvoice(invoice.stripe_invoice_id);
    const paidAt = paid.status === 'paid' ? new Date().toISOString() : null;
    db.prepare('UPDATE invoices SET status = ?, paid_at = ? WHERE id = ?')
      .run(paid.status, paidAt, invoice.id);
    res.json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice.id));
  } catch (err) {
    next(err);
  }
});

// Collect a new card/bank account for the client (returns a SetupIntent secret).
router.post('/setup-intent', async (req, res, next) => {
  const client = getDb().prepare('SELECT * FROM clients WHERE id = ?').get(req.clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  if (!client.stripe_customer_id) {
    return res.status(400).json({ error: 'Billing is not set up for your account yet. Please contact us.' });
  }
  try {
    const intent = await stripe.createSetupIntent(client.stripe_customer_id);
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
});

// Client accepts a quote.
router.post('/quotes/:id/accept', (req, res) => {
  const db = getDb();
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND client_id = ?')
    .get(req.params.id, req.clientId);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!['draft', 'sent'].includes(quote.status)) {
    return res.status(400).json({ error: `Quote cannot be accepted from status "${quote.status}"` });
  }
  const now = new Date().toISOString();
  db.prepare("UPDATE quotes SET status = 'accepted', accepted_at = ?, updated_at = ? WHERE id = ?")
    .run(now, now, quote.id);
  res.json(db.prepare('SELECT * FROM quotes WHERE id = ?').get(quote.id));
});

// Client declines a quote.
router.post('/quotes/:id/decline', (req, res) => {
  const db = getDb();
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND client_id = ?')
    .get(req.params.id, req.clientId);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!['draft', 'sent'].includes(quote.status)) {
    return res.status(400).json({ error: `Quote cannot be declined from status "${quote.status}"` });
  }
  db.prepare("UPDATE quotes SET status = 'declined', updated_at = ? WHERE id = ?")
    .run(new Date().toISOString(), quote.id);
  res.json(db.prepare('SELECT * FROM quotes WHERE id = ?').get(quote.id));
});

module.exports = router;
