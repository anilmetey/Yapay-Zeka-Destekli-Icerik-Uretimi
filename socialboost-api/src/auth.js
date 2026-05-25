const { config } = require('./config');
const { upsertUser } = require('./dataStore');

function requireApiSecret(req, _res, next) {
  if (config.nodeEnv !== 'production' || !config.apiSecret) return next();
  const token = req.header('x-api-key') || req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (token === config.apiSecret) return next();

  const error = new Error('Unauthorized');
  error.status = 401;
  error.publicMessage = 'Yetkisiz istek.';
  return next(error);
}

function attachUser(req, _res, next) {
  req.user = upsertUser({
    id: req.header('x-user-id') || 'demo-user',
    email: req.header('x-user-email') || undefined
  });
  next();
}

module.exports = { requireApiSecret, attachUser };
