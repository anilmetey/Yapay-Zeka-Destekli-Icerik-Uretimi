process.env.NODE_ENV = 'test';
process.env.DATA_FILE = `.data/test-${Date.now()}.json`;
process.env.RATE_LIMIT_MAX = '1000';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('health returns metadata', async () => {
  const response = await request(createApp()).get('/health').expect(200);
  assert.equal(response.body.ok, true);
  assert.deepEqual(response.body.platforms, ['instagram', 'tiktok', 'linkedin']);
});

test('validation error is structured', async () => {
  const response = await request(createApp()).post('/api/generate-posts').send({ productName: 'x' }).expect(400);
  assert.equal(response.body.error, 'Gönderilen bilgiler eksik veya hatalı.');
  assert.ok(response.body.requestId);
  assert.ok(response.body.details.length >= 1);
});

test('generation returns structured content and usage', async () => {
  const app = createApp({
    generateText: async () => `Caption:
Premium kahvaltılar için doğal krem peynir. 🧀

Hashtag:
#kahvaltı #organik #peynir

Optimal paylaşım zamanı:
Türkiye saatiyle 10:00`
  });

  const response = await request(app)
    .post('/api/generate-posts')
    .set('x-user-id', 'test-user')
    .send({
      productName: 'Organik Krem Peynir',
      description: 'Katkısız günlük sütle üretilen premium kahvaltılık ürün.',
      platform: 'instagram'
    })
    .expect(200);

  assert.equal(response.body.content.caption, 'Premium kahvaltılar için doğal krem peynir. 🧀');
  assert.deepEqual(response.body.content.hashtags, ['#kahvaltı', '#organik', '#peynir']);
  assert.equal(response.body.usage.tier, 'free');
  assert.equal(response.body.usage.used, 1);
});

test('me endpoint exposes account state', async () => {
  const response = await request(createApp()).get('/api/me').set('x-user-id', 'me-user').expect(200);
  assert.equal(response.body.user.id, 'me-user');
  assert.equal(response.body.tier, 'free');
  assert.equal(response.body.usage.tier, 'free');
});
