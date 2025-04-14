const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getGreetingMessage } = require('../utils/greetings');

function startWhatsAppBot() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    console.log('Scan this QR code to login:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
  });

  client.on('message', async (message) => {
    const msg = message.body.trim().toLowerCase();

    if (msg) {
      const greeting = getGreetingMessage();
      await message.reply(`${greeting} 👋\n\nHow can I assist you today? Call us directly at +91-XXXXXXX.`);
      // For "call" buttons, you'll need a front-end or WhatsApp Business API.
    }
  });

  client.initialize();
}

module.exports = { startWhatsAppBot };
