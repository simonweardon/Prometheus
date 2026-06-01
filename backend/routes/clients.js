const router = require('express').Router();
const { getDb } = require('../db/database');
const stripe = require('../services/stripeService');

// List all clients
router.get('/', (req, res) => {
  const clients = getDb().prepare(`
    SELECT c.*,
      COUNT(DISTINCT CASE WHEN cs.status = 'active' THEN cs.id END) as active_services,
      COUNT(DISTINCT CASE WHEN p.status NOT IN ('completed') THEN p.id END) as open_projects
    FROM clients c
    LEFT JOIN client_services cs ON cs.client_id = c.id
    LEFT JOIN projects p ON p.client_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(clients);
});

// Get single client with services and projects
router.get('/:id', (req, res) => {
  const db = getDb();
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  client.services = db.prepare(`
    SELECT cs.*, s.name as service_name, s.description, s.price_cents, s.billing_interval
    FROM client_services cs
    JOIN services s ON s.id = cs.service_id
    WHERE cs.client_id = ?
    ORDER BY cs.started_at DESC
  `).all(req.params.id);

  client.projects = db.prepare(`
    SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC
  `).all(req.params.id);

  client.invoices = db.prepare(`
    SELECT * FROM invoices WHERE client_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(req.params.id);

  client.payment_methods = db.prepare(`
    SELECT * FROM payment_methods WHERE client_id = ? ORDER BY is_default DESC, created_at DESC
  `).all(req.params.id);

  res.json(client);
});

// Create client
router.post('/', async (req, res, next) => {
  const { name, email, phone, company, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  try {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO clients (name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone || null, company || null, notes || null);

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);

    // Create Stripe customer
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const customer = await stripe.createCustomer(client);
        db.prepare('UPDATE clients SET stripe_customer_id = ? WHERE id = ?').run(customer.id, client.id);
        client.stripe_customer_id = customer.id;
      } catch (err) {
        console.error('Stripe customer creation failed:', err.message);
      }
    }

    res.status(201).json(client);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A client with this email already exists' });
    }
    next(err);
  }
});

// Update client
router.patch('/:id', (req, res, next) => {
  const db = getDb();
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const fields = ['name', 'email', 'phone', 'company', 'notes'];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.updated_at = new Date().toISOString();
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  try {
    db.prepare(`UPDATE clients SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);
    res.json(db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A client with this email already exists' });
    }
    next(err);
  }
});

// Delete client
router.delete('/:id', (req, res) => {
  const db = getDb();
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// Add payment method to client
router.post('/:id/payment-methods', async (req, res, next) => {
  const { paymentMethodId, setDefault } = req.body;
  if (!paymentMethodId) return res.status(400).json({ error: 'paymentMethodId required' });

  const db = getDb();
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  if (!client.stripe_customer_id) return res.status(400).json({ error: 'Client has no Stripe customer' });

  try {
    const pm = await stripe.attachPaymentMethod(client.stripe_customer_id, paymentMethodId, setDefault);
    const details = pm.type === 'card' ? pm.card : pm.us_bank_account;

    if (setDefault) {
      db.prepare('UPDATE payment_methods SET is_default = 0 WHERE client_id = ?').run(client.id);
    }

    const result = db.prepare(
      'INSERT INTO payment_methods (client_id, stripe_payment_method_id, type, last4, brand, is_default) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(client.id, pm.id, pm.type, details.last4, details.brand || details.bank_name || null, setDefault ? 1 : 0);

    res.status(201).json(db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    next(err);
  }
});

// Remove payment method
router.delete('/:id/payment-methods/:pmId', async (req, res, next) => {
  const db = getDb();
  const pm = db.prepare('SELECT * FROM payment_methods WHERE id = ? AND client_id = ?')
    .get(req.params.pmId, req.params.id);
  if (!pm) return res.status(404).json({ error: 'Payment method not found' });

  try {
    await stripe.detachPaymentMethod(pm.stripe_payment_method_id);
    db.prepare('DELETE FROM payment_methods WHERE id = ?').run(pm.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Create setup intent (for collecting payment method on frontend)
router.post('/:id/setup-intent', async (req, res, next) => {
  const client = getDb().prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  if (!client.stripe_customer_id) return res.status(400).json({ error: 'Client has no Stripe customer' });

  try {
    const intent = await stripe.createSetupIntent(client.stripe_customer_id);
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
