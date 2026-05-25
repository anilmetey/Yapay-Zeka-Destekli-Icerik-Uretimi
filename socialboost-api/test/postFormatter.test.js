const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeGeneratedPost } = require('../src/postFormatter');

test('normalizes noisy output', () => {
  const result = normalizeGeneratedPost(
    `İşte, Premium kahvaltılar için doğal krem peynir. 🧀

Umarım işinize yarar.

Ek Not: gösterme.

Optimal paylaşım zamanı: Türkiye saatiyle 10:00

Hashtag: #kahvaltı #organik #peynir #lezzet #istanbul #dogal #sut #fazla`,
    'instagram'
  );

  assert.equal(result.caption, 'Premium kahvaltılar için doğal krem peynir. 🧀');
  assert.equal(result.optimalTime, 'Türkiye saatiyle 10:00');
  assert.equal(result.hashtags.length, 7);
});
