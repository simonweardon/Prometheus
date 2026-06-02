const router = require('express').Router();
const { getDb } = require('../db/database');

// List all services/products
router.get('/', (req, res) => {
  const services = getDb().prepare(`
    SELECT s.*,
      COUNT(CASE WHEN cs.status = 'active' THEN 1 END) as active_client_count
    FROM services s
    LEFT JOIN client_services cs ON cs.service_id = s.id
    GROUP BY s.id
    ORDER BY s.name
  `).all();
  res.json(services);
});

// Get single service
router.get('/:id', (req, res) => {
  const service = getDb().prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

// Create service
router.post('/', (req, res) => {
  const { name, description, price_cents, billing_interval, stripe_price_id } = req.body;
  if (!name || price_cents == null) {
    return res.status(400).json({ error: 'name and price_cents required' });
  }
  const interval = billing_interval || 'monthly';
  const result = getDb().prepare(
    'INSERT INTO services (name, description, price_cents, billing_interval, stripe_price_id) VALUES (?, ?, ?, ?, ?)'
  ).run(name, description || null, price_cents, interval, stripe_price_id || null);

  res.status(201).json(getDb().prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid));
});

// Update service
router.patch('/:id', (req, res) => {
  const db = getDb();
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const fields = ['name', 'description', 'price_cents', 'billing_interval', 'stripe_price_id', 'active'];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  updates.updated_at = new Date().toISOString();
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE services SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);
  res.json(db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id));
});

// Delete service (only if no active subscriptions)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const active = db.prepare(
    "SELECT id FROM client_services WHERE service_id = ? AND status = 'active'"
  ).get(req.params.id);
  if (active) {
    return res.status(409).json({ error: 'Cannot delete a service with active client subscriptions' });
  }
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// Assign a service to a client
router.post('/:id/assign', async (req, res, next) => {
  const { clientId, notes, createSubscription } = req.body;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const db = getDb();
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  let stripeSubId = null;

  if (createSubscription && client.stripe_customer_id && service.stripe_price_id) {
    try {
      const stripeService = require('../services/stripeService');
      const defaultPm = db.prepare(
        'SELECT stripe_payment_method_id FROM payment_methods WHERE client_id = ? AND is_default = 1'
      ).get(clientId);
      if (!defaultPm) return res.status(400).json({ error: 'Client has no default payment method' });
      const sub = await stripeService.createSubscription(
        client.stripe_customer_id, service.stripe_price_id, defaultPm.stripe_payment_method_id
      );
      stripeSubId = sub.id;
    } catch (err) {
      return next(err);
    }
  }

  try {
    const result = db.prepare(
      'INSERT INTO client_services (client_id, service_id, notes, stripe_subscription_id) VALUES (?, ?, ?, ?)'
    ).run(clientId, req.params.id, notes || null, stripeSubId);
    res.status(201).json(db.prepare('SELECT * FROM client_services WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Client already has this service' });
    }
    next(err);
  }
});

// Update client service status
router.patch('/:id/assignments/:assignmentId', async (req, res, next) => {
  const { status } = req.body;
  if (!['active', 'paused', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be active, paused, or cancelled' });
  }

  const db = getDb();
  const assignment = db.prepare(
    'SELECT cs.*, c.stripe_customer_id FROM client_services cs JOIN clients c ON c.id = cs.client_id WHERE cs.id = ? AND cs.service_id = ?'
  ).get(req.params.assignmentId, req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  if (status === 'cancelled' && assignment.stripe_subscription_id) {
    try {
      await require('../services/stripeService').cancelSubscription(assignment.stripe_subscription_id);
    } catch (err) {
      console.error('Stripe subscription cancellation failed:', err.message);
    }
  }

  const endedAt = status === 'cancelled' ? new Date().toISOString() : null;
  db.prepare('UPDATE client_services SET status = ?, ended_at = ? WHERE id = ?')
    .run(status, endedAt, assignment.id);
  res.json(db.prepare('SELECT * FROM client_services WHERE id = ?').get(assignment.id));
});

module.exports = router;
