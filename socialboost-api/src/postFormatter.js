const platformHashtagLimits = { instagram: 7, tiktok: 5, linkedin: 4 };

function stripDecorations(text) {
  return String(text || '').replace(/\*\*/g, '').replace(/^İşte,?\s*/i, '').replace(/^Tamamdır,?\s*/i, '').trim();
}

function cleanMarketingText(text) {
  return stripDecorations(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^umarım\b/i.test(line))
    .filter((line) => !/^işte\b/i.test(line))
    .join('\n')
    .replace(/\n?Ek Not:?[\s\S]*$/i, '')
    .replace(/\n?Ek Öneriler:?[\s\S]*$/i, '')
    .replace(/\n-{2,}[\s\S]*$/g, '')
    .trim();
}

function extractSection(text, labels) {
  const cleanText = stripDecorations(text);
  const stopLabels = [
    'Caption',
    'Post',
    'Hook',
    'Video açıklaması',
    'Video aciklamasi',
    'Hashtag',
    'Hashtags',
    'Optimal paylaşım zamanı',
    'Optimal paylasim zamani',
    'Önerilen Paylaşım Zamanı',
    'Onerilen Paylasim Zamani',
    'Optimal timing',
    'Ek Not',
    'Ek Öneriler'
  ].join('|');

  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*(${stopLabels})\\s*:?|$)`, 'i');
    const match = cleanText.match(regex);
    if (match?.[1]) return match[1].trim().replace(/^[-*]\s*/gm, '').trim();
  }
  return '';
}

function extractHashtags(text) {
  return [...new Set(String(text || '').match(/#[\p{L}\p{N}_]+/gu) || [])];
}

function normalizeGeneratedPost(rawText, platform) {
  const text = stripDecorations(rawText);
  const caption =
    extractSection(text, ['Caption', 'Post', 'Video açıklaması', 'Video aciklamasi']) ||
    text.split('\n').filter(Boolean).slice(0, 6).join('\n');
  const optimalTime = extractSection(text, [
    'Optimal paylaşım zamanı',
    'Optimal paylasim zamani',
    'Önerilen Paylaşım Zamanı',
    'Onerilen Paylasim Zamani',
    'Optimal timing'
  ]);

  return {
    platform,
    caption: cleanMarketingText(caption),
    hook: cleanMarketingText(extractSection(text, ['Hook'])),
    hashtags: extractHashtags(text).slice(0, platformHashtagLimits[platform] || 7),
    optimalTime: cleanMarketingText(optimalTime),
    raw: text
  };
}

module.exports = { normalizeGeneratedPost };
