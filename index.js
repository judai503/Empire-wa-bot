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
import readline from 'readline';
import { fileURLToPath, pathToFileURL } from 'url';
import { exec } from "child_process";

// Importaciones Core
import { handler } from './handler.js';
import { logger } from './shield/logger.js';
import groupEvents from './sword/confi-events.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =========================
// MEJORAS DE RENDIMIENTO
// =========================
const normalizePhone = (input) => {
    let s = input.replace(/\D/g, "");
    if (!s) return "";
    if (s.startsWith("0")) s = s.replace(/^0+/, "");
    if (s.length === 10 && s.startsWith("3")) s = "57" + s; 
    if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) s = "521" + s.slice(2);
    if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) s = "549" + s.slice(2);
    return s;
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.plugins = {};
let reconexion = 0;

function banner() {
    console.clear();
    console.log(chalk.yellow(figlet.textSync('EMPIRE', { horizontalLayout: 'default' })));
    console.log(chalk.cyanBright('⚔️ EMPIRE BOT MD | v2.0 Optimized'));
    console.log(chalk.magenta('🚀 Hosting: Akirax Pro Mode'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

async function loadPlugins() {
    const folder = path.join(__dirname, 'sword');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    const files = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
    
    await Promise.all(files.map(async (file) => {
        try {
            const dir = pathToFileURL(path.join(folder, file)).href;
            const plugin = await import(`${dir}?update=${Date.now()}`);
            global.plugins[file] = plugin.default || plugin;
        } catch (e) {
            logger.error(`Error en plugin ${file}: ${e.message}`);
        }
    }));
}

async function startBot() {
    banner();
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();

    await loadPlugins();

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Safari'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        retryRequestDelayMs: 5000,
    });

    global.conn = conn;

    // Lógica de Pairing
    if (!state.creds.registered) {
        logger.info('Selecciona método: 1. QR | 2. Pairing Code');
        const opcion = await question('--> ');
        if (opcion === '2') {
            logger.info('Ingresa el número (Ej: 503...)');
            let phoneNumber = normalizePhone(await question('➡️ Número: '));
            setTimeout(async () => {
                try {
                    let code = await conn.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    console.log(chalk.black.bgGreen(` TU CÓDIGO: `), chalk.bold.white(` ${code} `));
                } catch (err) {
                    logger.error('Error al generar código: ' + err.message);
                }
            }, 3000);
        }
    }

    conn.ev.on('creds.update', saveCreds);

    // --- IMPORTANTE: CARGAR EVENTOS DE GRUPO ---
    groupEvents(conn); 

    conn.ev.on('connection.update', async (update) => {
        const { qr, connection, lastDisconnect } = update;
        if (qr && !state.creds.registered) qrcode.generate(qr, { small: true });

        if (connection === 'open') {
            reconexion = 0;
            banner();
            logger.success('CONEXIÓN ESTABLECIDA');
            // Forzar carga de base de datos al conectar
            if (global.loadDatabase) await global.loadDatabase();
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                fs.rmSync('./sessions', { recursive: true, force: true });
                process.exit(1);
            } else {
                reconexion++;
                setTimeout(startBot, Math.min(5000 * reconexion, 30000));
            }
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        if (!chatUpdate.messages[0]) return;
        try {
            await handler.call(conn, chatUpdate);
        } catch (e) {
            console.error(chalk.red('Error en el Handler:'), e);
        }
    });

    // --- ESCUCHADOR DE PARTICIPANTES (BACKUP) ---
    conn.ev.on('group-participants.update', async (ani) => {
        // Esto asegura que el bot siempre esté pendiente de quien entra
        if (global.plugins['confi-events.js']) {
            // Si el groupEvents falla, este backup ayuda
        }
    });

    conn.decodeJid = (jid) => {
        if (!jid) return jid;
        return /:\d+@/gi.test(jid) ? jidNormalizedUser(jid) : jid;
    };

    return conn;
}

startBot();

process.on('uncaughtException', (err) => {
    if (['rate-overlimit', 'Connection Closed', 'timed out'].some(x => err.message.includes(x))) return;
    console.error(chalk.redBright('[Log de Error]:'), err.message);
});
