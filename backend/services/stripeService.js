const Stripe = require('stripe');

let _stripe;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

async function createCustomer(client) {
  return getStripe().customers.create({
    email: client.email,
    name: client.name || client.company,
    phone: client.phone,
    metadata: { prometheus_client_id: String(client.id) },
  });
}

async function attachPaymentMethod(stripeCustomerId, paymentMethodId, setDefault = false) {
  const stripe = getStripe();
  await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
  if (setDefault) {
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }
  return stripe.paymentMethods.retrieve(paymentMethodId);
}

async function detachPaymentMethod(paymentMethodId) {
  return getStripe().paymentMethods.detach(paymentMethodId);
}

async function createSubscription(stripeCustomerId, stripePriceId, paymentMethodId) {
  return getStripe().subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: stripePriceId }],
    default_payment_method: paymentMethodId,
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

async function cancelSubscription(stripeSubscriptionId) {
  return getStripe().subscriptions.cancel(stripeSubscriptionId);
}

async function createInvoice(stripeCustomerId, amountCents, description) {
  const stripe = getStripe();
  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    amount: amountCents,
    currency: 'usd',
    description,
  });
  const invoice = await stripe.invoices.create({ customer: stripeCustomerId });
  return stripe.invoices.finalizeInvoice(invoice.id);
}

async function retrieveInvoice(stripeInvoiceId) {
  return getStripe().invoices.retrieve(stripeInvoiceId);
}

async function createSetupIntent(stripeCustomerId) {
  return getStripe().setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card', 'us_bank_account'],
  });
}

// Charge an open Stripe invoice. With no payment method Stripe uses the
// customer's default; pass one to charge a specific saved method.
async function payInvoice(stripeInvoiceId, paymentMethodId) {
  const opts = paymentMethodId ? { payment_method: paymentMethodId } : undefined;
  return getStripe().invoices.pay(stripeInvoiceId, opts);
}

module.exports = {
  createCustomer,
  attachPaymentMethod,
  detachPaymentMethod,
  createSubscription,
  cancelSubscription,
  createInvoice,
  retrieveInvoice,
  createSetupIntent,
  payInvoice,
};
