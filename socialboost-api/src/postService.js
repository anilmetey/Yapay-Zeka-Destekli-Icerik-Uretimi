const { randomUUID } = require('crypto');
const { buildPrompt } = require('./platformPrompts');
const { generateWithOllama } = require('./ollamaClient');
const { normalizeGeneratedPost } = require('./postFormatter');
const { assertCanGenerate, getUsage, recordGeneration } = require('./usageStore');
const { saveGeneration, getUserTier } = require('./dataStore');

async function generatePost({ input, userId, requestId, generateText = generateWithOllama }) {
  const tier = input.userTier || getUserTier(userId);
  const beforeUsage = assertCanGenerate(userId, tier);
  const rawPost = await generateText(buildPrompt({ ...input, userTier: tier }));
  const content = normalizeGeneratedPost(rawPost, input.platform);

  recordGeneration(userId);
  const generation = saveGeneration({
    id: randomUUID(),
    userId,
    requestId,
    platform: input.platform,
    productName: input.productName,
    content,
    createdAt: new Date().toISOString()
  });

  return {
    id: generation.id,
    requestId,
    post: content.raw,
    content,
    platform: input.platform,
    usage: getUsage(userId, beforeUsage.tier),
    timestamp: generation.createdAt
  };
}

module.exports = { generatePost };
