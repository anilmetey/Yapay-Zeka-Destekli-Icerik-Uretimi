const Stripe = require('stripe');
const { config } = require('./config');

const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;

const plans = {
  starter: { name: 'SocialBoost Starter', amount: 3999 },
  pro: { name: 'SocialBoost Pro', amount: 7999 }
};

async function createCheckoutSession(plan, userId) {
  if (!stripe) {
    const error = new Error('Stripe is not configured');
    error.status = 503;
    error.publicMessage = 'Ödeme altyapısı henüz yapılandırılmadı.';
    throw error;
  }

  const selectedPlan = plans[plan];
  if (!selectedPlan) {
    const error = new Error('Invalid plan');
    error.status = 400;
    error.publicMessage = 'Geçersiz plan seçildi.';
    throw error;
  }

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    client_reference_id: userId,
    metadata: { userId, plan },
    line_items: [
      {
        price_data: {
          currency: 'try',
          recurring: { interval: 'month' },
          product_data: { name: selectedPlan.name },
          unit_amount: selectedPlan.amount
        },
        quantity: 1
      }
    ],
    success_url: `${config.frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontendUrl}/pricing`
  });
}

module.exports = { stripe, plans, createCheckoutSession };
