import './config.js';
import {
    default as makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    jidNormalizedUser,
    Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import qrcode from 'qrcode-terminal';
import { fileURLToPath, pathToFileURL } from 'url';

import { handler } from './handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.plugins = {};

// =========================
// CARGADOR DE COMANDOS
// =========================
async function loadPlugins() {
    // Intentamos buscar en 'sword' o en 'plugins'
    const pluginFolder = fs.existsSync(path.join(__dirname, 'sword')) ? 'sword' : 'plugins';
    const folderPath = path.join(__dirname, pluginFolder);
    
    console.log(chalk.yellow(`[!] Cargando comandos desde: /${pluginFolder}`));
    
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of files) {
        try {
            const filePath = pathToFileURL(path.join(folderPath, file)).href;
            const plugin = await import(`${filePath}?update=${Date.now()}`);
            global.plugins[file] = plugin.default || plugin;
        } catch (e) {
            console.error(chalk.red(`❌ Error cargando ${file}:`), e);
        }
    }
    console.log(chalk.green(`[✓] Se cargaron ${Object.keys(global.plugins).length} comandos.`));
}

// =========================
// BASE DE DATOS
// =========================
const dbPath = './database.json';
global.db = { data: { users: {}, chats: {}, settings: {} } };
if (fs.existsSync(dbPath)) {
    try { global.db.data = JSON.parse(fs.readFileSync(dbPath)); } catch (e) {}
}
setInterval(() => { fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2)); }, 30000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    
    await loadPlugins(); // <--- Cargar antes de conectar

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Safari'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    });

    global.conn = conn;
    conn.ev.on('creds.update', saveCreds);

    // Bienvenida directa
    conn.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
        if (action !== 'add') return;
        const chat = global.db.data.chats[id] || {};
        if (!chat.welcome) return;
        const metadata = await conn.groupMetadata(id).catch(_ => ({}));
        for (let user of participants) {
            let jid = typeof user === 'string' ? user : user.id;
            let text = chat.welcomeType === 'description' ? (metadata.desc || '¡Bienvenido!') : (chat.sWelcome || '¡Bienvenido!');
            let msg = `👤 ᴜsᴜᴀʀɪᴏ: @${jid.split('@')[0]}\n🏰 ɢʀᴜᴘᴏ: ${metadata.subject}\n\n『 ${text} 』\n\n> 📱 ᴛɪᴋᴛᴏᴋ: El tío Judai`;
            await conn.sendMessage(id, { text: msg, mentions: [jid] });
        }
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'open') {
            console.log(chalk.cyan(figlet.textSync('EMPIRE', { horizontalLayout: 'default' })));
            console.log(chalk.green('✅ BOT ONLINE Y COMANDOS LISTOS'));
        }
        if (connection === 'close') setTimeout(startBot, 5000);
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try { await handler.call(conn, chatUpdate); } catch (e) {}
    });
}

startBot();
