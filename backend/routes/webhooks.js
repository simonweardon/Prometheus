const router = require('express').Router();
const Stripe = require('stripe');
const { getDb } = require('../db/database');

// Stripe sends raw body — must be mounted before express.json()
router.post('/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = Stripe(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  const db = getDb();

  switch (event.type) {
    case 'invoice.paid': {
      const inv = event.data.object;
      const paidAt = new Date(inv.status_transitions.paid_at * 1000).toISOString();
      db.prepare("UPDATE invoices SET status = 'paid', paid_at = ? WHERE stripe_invoice_id = ?")
        .run(paidAt, inv.id);
      break;
    }
    case 'invoice.payment_failed':
    case 'invoice.voided': {
      const inv = event.data.object;
      db.prepare('UPDATE invoices SET status = ? WHERE stripe_invoice_id = ?')
        .run(inv.status, inv.id);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      db.prepare("UPDATE client_services SET status = 'cancelled', ended_at = ? WHERE stripe_subscription_id = ?")
        .run(new Date().toISOString(), sub.id);
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const status = sub.status === 'active' ? 'active' : sub.status === 'paused' ? 'paused' : 'cancelled';
      db.prepare('UPDATE client_services SET status = ? WHERE stripe_subscription_id = ?').run(status, sub.id);
      break;
    }
  }

  res.json({ received: true });
});

module.exports = router;
