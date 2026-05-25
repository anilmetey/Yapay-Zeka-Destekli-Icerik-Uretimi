const { readData, updateData } = require('./dataStore');

const monthlyLimits = { free: 5, starter: 30, pro: Infinity };

function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function usageKey(userId, date = new Date()) {
  return `${userId}:${monthKey(date)}`;
}

function normalizeTier(tier) {
  return monthlyLimits[tier] ? tier : 'free';
}

function getUsage(userId, tier = 'free') {
  const normalizedTier = normalizeTier(tier);
  const used = readData().usage[usageKey(userId)] || 0;
  const limit = monthlyLimits[normalizedTier];
  return { tier: normalizedTier, used, limit, remaining: limit === Infinity ? null : Math.max(limit - used, 0) };
}

function assertCanGenerate(userId, tier = 'free') {
  const usage = getUsage(userId, tier);
  if (usage.limit !== Infinity && usage.used >= usage.limit) {
    const error = new Error('Monthly post limit reached');
    error.status = 402;
    error.publicMessage = 'Aylık post limitine ulaştınız. Devam etmek için planınızı yükseltin.';
    throw error;
  }
  return usage;
}

function recordGeneration(userId) {
  return updateData((data) => {
    const key = usageKey(userId);
    data.usage[key] = (data.usage[key] || 0) + 1;
    return data.usage[key];
  });
}

module.exports = { assertCanGenerate, getUsage, recordGeneration };
