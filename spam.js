const axios = require('axios');
const fs = require('fs');

// Fungsi untuk membaca konfigurasi dari asraf.txt
const readConfig = () => {
  const config = fs.readFileSync('asraf.txt', 'utf8').split('\n');
  const configObj = {};
  config.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      configObj[key.trim()] = value.trim();
    }
  });
  return configObj;
};

// Membaca token bot interaktif dari token.json
const tokenBotInteraktif = JSON.parse(fs.readFileSync('token.json')).token;

// Mengambil token bot spam, chat ID, dan teks dari asraf.txt
let { token, chatId, text } = readConfig();

// Variabel untuk menyimpan interval ID
let spamInterval;

// Tentukan ID Telegram owner bot (ID owner yang diberikan)
const ownerId = 6938735999;

// Fungsi untuk mengirim pesan spam
const sendMessage = async () => {
  try {
    await axios.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`);
    console.log('Pesan terkirim');
  } catch (error) {
    console.error('Error saat mengirim pesan:', error);
    if (error.response && error.response.status === 400) {
      console.log('API TELAH DOWN🔥');
    }
  }
};

// Fungsi untuk mulai spam setiap 1 detik
const startSpamming = () => {
  if (!spamInterval) {
    spamInterval = setInterval(sendMessage, 1000);
    console.log('Spam dimulai!');
  } else {
    console.log('Spam sudah berjalan.');
  }
};

// Fungsi untuk berhenti spam
const stopSpamming = () => {
  if (spamInterval) {
    clearInterval(spamInterval);
    spamInterval = null;
    console.log('Spam dihentikan.');
  } else {
    console.log('Tidak ada spam yang berjalan.');
  }
};

// Fungsi untuk mengedit token di asraf.txt
const editToken = (newToken) => {
  try {
    const config = fs.readFileSync('asraf.txt', 'utf8').split('\n');
    const updatedConfig = config.map(line => {
      if (line.startsWith('token=')) {
        return `token=${newToken}`;
      }
      return line;
    });
    fs.writeFileSync('asraf.txt', updatedConfig.join('\n'));
    token = newToken; // Update token di memori
    console.log('Token berhasil diperbarui!');
  } catch (error) {
    console.error('Error saat memperbarui token:', error);
  }
};

// Setup bot Telegram untuk mendengarkan perintah
const { Telegraf } = require('telegraf');
const bot = new Telegraf(tokenBotInteraktif);

// Middleware untuk memeriksa apakah perintah datang dari owner
const checkOwner = (ctx, next) => {
  if (ctx.message.from.id !== ownerId) {
    return ctx.reply('Perintah ini hanya bisa digunakan oleh owner bot!');
  }
  return next();
};

// Gunakan middleware untuk semua perintah
bot.use(checkOwner);

// Perintah /attack untuk mulai spam
bot.command('attack', (ctx) => {
  ctx.reply('Attack dimulai!');
  startSpamming();  // Mulai spam jika perintah /attack diterima
});

// Perintah /stop untuk menghentikan spam
bot.command('stop', (ctx) => {
  ctx.reply('Spam dihentikan!');
  stopSpamming();  // Hentikan spam jika perintah /stop diterima
});

// Perintah /edittoken untuk mengedit token
bot.command('edittoken', (ctx) => {
  const newToken = ctx.message.text.split(' ')[1]; // Ambil token baru dari perintah
  if (newToken) {
    editToken(newToken);
    ctx.reply('Token berhasil diubah!');
  } else {
    ctx.reply('Harap berikan token baru setelah perintah /edittoken');
  }
});

// Perintah /help untuk memberikan panduan
bot.command('help', (ctx) => {
  const helpMessage = `
    ✨ *Panduan Bot Telegram* ✨

    👤 Perintah hanya bisa dijalankan oleh Owner (ID: ${ownerId}).
    
    Perintah yang tersedia:
    /attack - Mulai spam pesan
    /stop - Hentikan spam pesan
    /edittoken [TOKEN_BARU] - Ubah token bot di asraf.txt
    /help - Tampilkan panduan ini
    
    🚨 *Peringatan:* Hati-hati dalam menggunakan perintah spam!
  `;
  ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});

// Mulai bot
bot.launch().then(() => {
  console.log('Bot sudah aktif dan menunggu perintah...');
  // Menampilkan panduan saat bot dijalankan
  console.log(`
    ✨ *Panduan Bot Telegram* ✨

    👤 Perintah hanya bisa dijalankan oleh Owner (ID: ${ownerId}).
    
    Perintah yang tersedia:
    /attack - Mulai spam pesan
    /stop - Hentikan spam pesan
    /edittoken [TOKEN_BARU] - Ubah token bot di asraf.txt
    /help - Tampilkan panduan ini
    
    🚨 *Peringatan:* Hati-hati dalam menggunakan perintah spam!
  `);
});
