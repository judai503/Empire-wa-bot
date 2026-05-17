// index.js
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js'; 
import cfonts from 'cfonts';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import { spawn } from 'child_process';

// Importaciones nativas de Baileys
import {
    default as makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    jidNormalizedUser,
    Browsers
} from '@whiskeysockets/baileys';

// Carga directa de la serialización ligera
import './engine/simple.js'; 

// Configuración de rutas globales
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

const __dirname = global.__dirname(import.meta.url);
global.plugins = {};

if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");

console.clear();
cfonts.say('EMPIRE', {
    font: 'BLOCK',
    align: 'center',
    gradient: ['cyan', 'magenta']
});

// ==========================================
// CARGADOR DINÁMICO DEL HANDLER
// ==========================================
global.handler = null;
global.reloadHandler = async function (announcement = true) {
    try {
        const handlerPath = pathToFileURL(path.join(__dirname, 'handler.js')).href;
        const module = await import(`${handlerPath}?update=${Date.now()}`);
        global.handler = module.handler;
        if (announcement) console.log(chalk.bold.greenBright("[✓] Sistema de eventos 'handler.js' sincronizado con éxito."));
    } catch (e) {
        console.error(chalk.red("❌ Error crítico recargando 'handler.js':"), e);
    }
};

// Cargador de comandos optimizado con marcas de tiempo dinámicas
async function loadPlugins() {
    const pluginFolder = fs.existsSync(path.join(__dirname, 'sword')) ? 'sword' : 'plugins';
    const folderPath = path.join(__dirname, pluginFolder);
    
    console.log(chalk.yellow(`[!] Cargando comandos desde: /${pluginFolder}`));
    
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    global.plugins = {}; 
    
    for (const file of files) {
        try {
            const filePath = pathToFileURL(path.join(folderPath, file)).href;
            // El ?update=${Date.now()} destruye la caché vieja al re-importar
            const plugin = await import(`${filePath}?update=${Date.now()}`);
            global.plugins[file] = plugin.default || plugin;
        } catch (e) {
            console.error(chalk.red(`❌ Error cargando ${file}:`), e);
        }
    }
    console.log(chalk.green(`[✓] Se cargaron ${Object.keys(global.plugins).length} comandos correctamente.`));
}
global.loadPlugins = loadPlugins;

// Base de datos local
const dbPath = './database.json';
global.db = { data: { users: {}, chats: {}, settings: {} } };
if (fs.existsSync(dbPath)) {
    try { global.db.data = JSON.parse(fs.readFileSync(dbPath)); } catch (e) {}
}
setInterval(() => { fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2)); }, 30000);

const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

// Conexión principal
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    
    await loadPlugins();
    await global.reloadHandler(false); 

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));

    let opcion = '1'; 
    if (!fs.existsSync(`./sessions/creds.json`)) {
        console.log(chalk.bold.white('\n   === SELECCIONA TU MÉTODO DE CONEXIÓN ==='));
        console.log(chalk.blueBright(' [1] ') + chalk.white('Conectar con Código QR'));
        console.log(chalk.cyan(' [2] ') + chalk.white('Conectar con Código de Texto (8 dígitos)'));
        opcion = await question(chalk.bold.greenBright('\n➫ Elige una opción (1 o 2): '));
    }

    const connectionOptions = {
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: opcion === '1',
        browser: opcion === '1' ? Browsers.macOS('Safari') : ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        msgRetryCounterCache,
        userDevicesCache,
        keepAliveIntervalMs: 55000,
        maxIdleTimeMs: 60000
    };

    const conn = makeWASocket(connectionOptions);
    global.conn = conn;
    conn.ev.on('creds.update', saveCreds);

    if (!fs.existsSync(`./sessions/creds.json`) && opcion === '2') {
        setTimeout(async () => {
            let phone = await question(chalk.bgBlack(chalk.bold.greenBright("\n🔢 Escribe tu número de WhatsApp (Ej: 50360438371): ")));
            phone = phone.replace(/\D/g, '');
            let codeBot = await conn.requestPairingCode(phone);
            codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
            console.log(chalk.bold.white(chalk.bgMagenta('\n🔑 CÓDIGO DE VINCULACIÓN:')), chalk.bold.yellow(codeBot), '\n');
            rl.close();
        }, 3000);
    } else {
        rl.close();
    }

    // Anti-llamadas
    conn.ev.on('call', async (calls) => {
        for (let call of calls) {
            if (call.status === "offer" && !call.isGroup) {
                console.log(chalk.red(`[!] Llamada rechazada de: @${call.from.split('@')[0]}`));
                await conn.rejectCall(call.id, call.from);
                await conn.sendMessage(call.from, { 
                    text: `⚠️ *[ ANTI-CALL ]* @${call.from.split('@')[0]}, las llamadas están prohibidas. Fuiste bloqueado automáticamente.` 
                }, { mentions: [call.from] });
                await new Promise(resolve => setTimeout(resolve, 2000));
                await conn.updateBlockStatus(call.from, "block");
            }
        }
    });

    // Bienvenidas
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

    // Estado de la conexión
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr && opcion === '1') qrcode.generate(qr, { small: true });
        
        if (connection === 'open') {
            console.log(chalk.green(`\n✅ [EMPIRE] CONECTADO CON ÉXITO ASÍ: ${conn.user.name || 'Bot'}`));
            _quickTest().catch(console.error);
        }
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const fallbackReconnect = [401, 440, 428, 405].includes(reason);
            
            if (!fallbackReconnect && reason !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow('→ Conexión inestable. Reconectando el Bot Principal...'));
                setTimeout(startBot, 5000);
            } else {
                console.log(chalk.red('❌ Sesión cerrada permanentemente de WhatsApp. Elimina la carpeta /sessions y reinicia.'));
            }
        }
    });

    // Lector de Eventos Dinámico
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try { 
            if (global.handler) {
                await global.handler.call(conn, chatUpdate); 
            }
        } catch (e) {
            console.error(e);
        }
    });
}

async function _quickTest() {
    const test = await Promise.all([
        spawn('ffmpeg'), spawn('ffprobe'), spawn('convert'), spawn('magick')
    ].map((p) => {
        return Promise.race([
            new Promise((resolve) => p.on('close', (code) => resolve(code !== 127))),
            new Promise((resolve) => p.on('error', () => resolve(false)))
        ]);
    }));
    const [ffmpeg, ffprobe, convert, magick] = test;
    global.support = { ffmpeg, ffprobe, convert, magick };
}

setInterval(() => {
    const tmpDir = path.join(__dirname, 'tmp');
    if (fs.existsSync(tmpDir)) {
        try {
            fs.readdirSync(tmpDir).forEach(file => fs.unlinkSync(path.join(tmpDir, file)));
        } catch (e) {}
    }
}, 30000);

process.on('uncaughtException', console.error);
process.on('unhandledRejection', (reason) => console.error("Rechazo no manejado:", reason));

// ==========================================
// MONITOR DE COMANDOS EN VIVO (HOT RELOAD)
// ==========================================
const pluginFolder = fs.existsSync(path.join(__dirname, 'sword')) ? 'sword' : 'plugins';
const folderPath = path.join(__dirname, pluginFolder);

if (fs.existsSync(folderPath)) {
    fs.watch(folderPath, async (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
            console.log(chalk.bold.magenta(`\n🛠️ [EMPIRE - RECARGA] Se detectó un cambio en: /${pluginFolder}/${filename}`));
            try {
                // Vuelve a mapear todos los plugins aplicando la marca de tiempo anti-caché
                await global.loadPlugins();
            } catch (e) {
                console.error(chalk.red(`❌ Error recargando comandos tras modificar ${filename}:`), e);
            }
        }
    });
}

startBot();
