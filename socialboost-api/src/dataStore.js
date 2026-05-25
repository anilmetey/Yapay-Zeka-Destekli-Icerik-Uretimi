const fs = require('fs');
const path = require('path');
const { config } = require('./config');

const emptyData = { usage: {}, generations: [], users: {}, subscriptions: {} };

function resolveDataFile() {
  return path.resolve(process.cwd(), config.dataFile);
}

function ensureDataFile() {
  const file = resolveDataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(emptyData, null, 2));
  return file;
}

function readData() {
  try {
    return { ...emptyData, ...JSON.parse(fs.readFileSync(ensureDataFile(), 'utf8')) };
  } catch (_error) {
    return { ...emptyData };
  }
}

function writeData(data) {
  fs.writeFileSync(ensureDataFile(), JSON.stringify(data, null, 2));
}

function updateData(mutator) {
  const data = readData();
  const result = mutator(data);
  writeData(data);
  return result;
}

function saveGeneration(generation) {
  return updateData((data) => {
    data.generations.unshift(generation);
    data.generations = data.generations.slice(0, 500);
    return generation;
  });
}

function listGenerations(userId, limit = 20) {
  return readData().generations.filter((generation) => generation.userId === userId).slice(0, limit);
}

function upsertUser(user) {
  return updateData((data) => {
    const existing = data.users[user.id] || {};
    const next = {
      connectedAccounts: existing.connectedAccounts || [],
      ...existing,
      ...user,
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.users[user.id] = next;
    return next;
  });
}

function getUser(userId) {
  return readData().users[userId] || null;
}

function upsertSubscription(subscription) {
  return updateData((data) => {
    const existing = data.subscriptions[subscription.userId] || {};
    const next = {
      ...existing,
      ...subscription,
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.subscriptions[subscription.userId] = next;
    return next;
  });
}

function getSubscription(userId) {
  return readData().subscriptions[userId] || null;
}

function getUserTier(userId) {
  const subscription = getSubscription(userId);
  return subscription?.status === 'active' ? subscription.plan : 'free';
}

module.exports = {
  readData,
  updateData,
  saveGeneration,
  listGenerations,
  upsertUser,
  getUser,
  upsertSubscription,
  getSubscription,
  getUserTier
};
