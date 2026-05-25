const axios = require('axios');
const { config } = require('./config');

async function generateWithOllama(prompt) {
  try {
    const response = await axios.post(
      config.ollamaUrl,
      {
        model: config.ollamaModel,
        prompt,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9 }
      },
      { timeout: 120000 }
    );
    return String(response.data.response || '').trim();
  } catch (error) {
    console.warn('Ollama error or not running. Returning mock response for demo purposes.', error.message);
    return `**Caption:**\nHarika Bir Başlangıç!\n\nYapay zeka motoruna bağlanılamadığı için bu örnek metni görüyorsunuz. (Ollama yüklü değil veya çalışmıyor).\n\n**Optimal paylaşım zamanı:**\n14:00\n\n**Hashtags:**\n#SocialBoost #Demo #YapayZeka`;
  }
}

module.exports = { generateWithOllama };
