const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { config } = require('./config');
const { platformPrompts } = require('./platformPrompts');
const { getUsage } = require('./usageStore');
const { getSubscription, getUserTier, listGenerations } = require('./dataStore');
const { createCheckoutSession, plans } = require('./stripeClient');
const { constructStripeEvent, applyStripeEvent } = require('./webhookService');
const { generatePostSchema, upgradeSchema, validate } = require('./validators');
const { generatePost } = require('./postService');
const { requireApiSecret, attachUser } = require('./auth');
const logger = require('./logger');

function createApp(options = {}) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use((req, res, next) => {
    req.id = randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
  });
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.' }
  }));

  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res, next) => {
    try {
      const event = constructStripeEvent(req);
      applyStripeEvent(event);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  });

  app.use(express.json({ limit: '2mb' }));
  app.use(requireApiSecret);
  app.use(attachUser);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'socialboost-api', ollamaModel: config.ollamaModel, platforms: Object.keys(platformPrompts) });
  });

  app.get('/openapi.json', (_req, res) => {
    res.type('application/json').send(fs.readFileSync(path.resolve(process.cwd(), 'docs/openapi.json'), 'utf8'));
  });

  app.get('/api/me', (req, res) => {
    const tier = getUserTier(req.user.id);
    res.json({ user: req.user, tier, subscription: getSubscription(req.user.id), usage: getUsage(req.user.id, tier) });
  });

  app.post('/api/accounts/connect', (req, res) => {
    const { platform } = req.body;
    if (!['instagram', 'tiktok'].includes(platform)) return res.status(400).json({ error: 'Geçersiz platform' });
    
    const user = req.user;
    const isConnected = user.connectedAccounts?.includes(platform);
    
    let newAccounts = user.connectedAccounts || [];
    if (isConnected) {
      newAccounts = newAccounts.filter(p => p !== platform);
    } else {
      newAccounts.push(platform);
    }
    
    // Save updated user
    const { upsertUser } = require('./dataStore');
    const updatedUser = upsertUser({ ...user, connectedAccounts: newAccounts });
    
    res.json({ success: true, connectedAccounts: updatedUser.connectedAccounts });
  });

  app.get('/api/usage', (req, res) => {
    const tier = req.query.tier || getUserTier(req.user.id);
    res.json(getUsage(req.user.id, tier));
  });

  app.get('/api/generations', (req, res) => {
    res.json({ generations: listGenerations(req.user.id) });
  });

  app.post('/api/generate-posts', async (req, res, next) => {
    try {
      const input = validate(generatePostSchema, req.body);
      const result = await generatePost({ input, userId: req.user.id, requestId: req.id, generateText: options.generateText });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/upgrade', async (req, res, next) => {
    try {
      const { plan } = validate(upgradeSchema, req.body);
      const session = await createCheckoutSession(plan, req.user.id);
      res.json({ url: session.url });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/plans', (_req, res) => {
    res.json({ free: { name: 'SocialBoost Free', amount: 0, monthlyPosts: 5 }, starter: { ...plans.starter, monthlyPosts: 30 }, pro: { ...plans.pro, monthlyPosts: null } });
  });

  const frontendPath = path.resolve(__dirname, '../../socialboost-frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/health' || req.path === '/openapi.json') {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  app.use((req, res, next) => {
    res.status(404).json({ error: `Bulunamadı (404): ${req.method} ${req.path}` });
  });

  app.use((error, req, res, _next) => {
    logger.error('request_failed', { requestId: req.id, status: error.status || 500, error: error.message });
    res.status(error.status || 500).json({ error: error.publicMessage || 'Beklenmeyen bir hata oluştu.', requestId: req.id, details: error.details });
  });

  return app;
}

module.exports = { createApp };
