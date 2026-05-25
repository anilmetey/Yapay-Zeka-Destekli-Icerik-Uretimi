const { config } = require('./config');
const { stripe, plans } = require('./stripeClient');
const { upsertSubscription } = require('./dataStore');

function planFromAmount(amount) {
  return Object.entries(plans).find(([, plan]) => plan.amount === amount)?.[0] || 'starter';
}

function constructStripeEvent(req) {
  if (!stripe || !config.stripeWebhookSecret) {
    const error = new Error('Stripe webhook is not configured');
    error.status = 503;
    error.publicMessage = 'Stripe webhook yapılandırılmadı.';
    throw error;
  }
  return stripe.webhooks.constructEvent(req.body, req.header('stripe-signature'), config.stripeWebhookSecret);
}

function applyStripeEvent(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    return upsertSubscription({
      userId: session.client_reference_id || session.metadata?.userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      plan: session.metadata?.plan || planFromAmount(session.amount_total),
      status: 'active',
      source: 'stripe'
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    return upsertSubscription({
      userId: subscription.metadata?.userId || subscription.customer,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      plan: 'free',
      status: 'canceled',
      source: 'stripe'
    });
  }

  return null;
}

module.exports = { constructStripeEvent, applyStripeEvent };
