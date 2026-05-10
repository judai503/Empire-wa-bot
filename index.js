import './config.js'

import {
    default as makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    jidNormalizedUser,
    Browsers
} from '@whiskeysockets/baileys'

import { Boom } from '@hapi/boom'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import figlet from 'figlet'
import qrcode from 'qrcode-terminal'
import readline from 'readline'
import { fileURLToPath, pathToFileURL } from 'url'

import { handler } from './handler.js'
import { logger } from './shield/logger.js'
import groupEvents from './sword/confi-events.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// =========================
// CREAR CARPETAS
// =========================
const folders = ['./sessions', './tmp', './sword', './shield']
for (const folder of folders) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
    }
}

// =========================
// READLINE
// =========================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

global.plugins = {}
global.timestamp = { start: Date.now() }

function banner() {
    console.clear()
    console.log(chalk.yellow(figlet.textSync('EMPIRE', { horizontalLayout: 'default' })))
    console.log(chalk.cyanBright('⚔️ EMPIRE BOT MD'))
    console.log(chalk.greenBright(`👑 OWNER: ${global.owner[0][1]}`))
    console.log(chalk.magentaBright(`🕒 ${new Date().toLocaleString()}`))
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━'))
}

async function loadPlugins() {
    const folder = path.join(__dirname, 'sword')
    const files = fs.readdirSync(folder).filter(file => file.endsWith('.js'))

    for (const file of files) {
        try {
            const dir = pathToFileURL(path.join(folder, file)).href
            const plugin = await import(`${dir}?update=${Date.now()}`)
            global.plugins[file] = plugin.default || plugin
            logger.success(`Plugin cargado: ${file}`)
        } catch (e) {
            logger.error(`Error cargando ${file}`)
            console.error(e)
        }
    }
}

function watchPlugins() {
    const folder = path.join(__dirname, 'sword')
    fs.watch(folder, async (_, filename) => {
        if (!filename || !filename.endsWith('.js')) return
        const file = path.join(folder, filename)
        if (!fs.existsSync(file)) return
        try {
            const dir = pathToFileURL(file).href
            const plugin = await import(`${dir}?update=${Date.now()}`)
            global.plugins[filename] = plugin.default || plugin
            logger.info(`Plugin actualizado: ${filename}`)
        } catch (e) {
            logger.error(`Error recargando ${filename}`)
            console.error(e)
        }
    })
}

function cleanTmp() {
    const tmp = './tmp'
    if (!fs.existsSync(tmp)) return
    const files = fs.readdirSync(tmp)
    for (const file of files) {
        try { fs.unlinkSync(path.join(tmp, file)) } catch {}
    }
}

async function startBot() {
    banner()

    const { state, saveCreds } = await useMultiFileAuthState('./sessions')
    const { version } = await fetchLatestBaileysVersion()

    await loadPlugins()
    watchPlugins()

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
        },
        markOnlineOnConnect: true,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        keepAliveIntervalMs: 30000,
        defaultQueryTimeoutMs: 0
    })

    global.conn = conn

    // =========================
    // PAIRING CODE
    // =========================
    if (!state.creds.registered) {
        logger.info('Ingresa el número para vincular el bot')
        const phoneNumber = await question('➡️ Número: ')
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(phoneNumber.replace(/[^0-9]/g, '').trim())
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code
                logger.success(`Código: ${formatted}`)
            } catch (e) {
                logger.error('Error generando pairing code')
                console.error(e)
            }
        }, 3000)
    }

    conn.ev.on('creds.update', saveCreds)

    // =========================
    // CONNECTION UPDATE
    // =========================
    conn.ev.on('connection.update', async (update) => {
        const { qr, connection, lastDisconnect } = update

        if (qr) {
            logger.info('Escanea el QR')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'connecting') {
            logger.info('Conectando a WhatsApp...')
        }

        if (connection === 'open') {
            banner()
            
            // ✅ MOVIDO AQUÍ: Se activa solo cuando ya hay conexión real
            groupEvents(conn) 

            logger.success('CONECTADO EXITOSAMENTE')
            logger.info(`BOT: ${global.botname}`)
            logger.info(`Plugins: ${Object.keys(global.plugins).length}`)
            logger.info(`Usuario: ${conn.user?.name || 'Desconocido'}`)
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            logger.error(`Conexión cerrada (${reason})`)
            if (reason !== DisconnectReason.loggedOut) {
                logger.warning('Reconectando...')
                setTimeout(() => startBot(), 5000)
            } else {
                logger.error('Sesión cerrada')
                logger.warning('Elimina la carpeta sessions')
            }
        }
    })

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            await handler.call(conn, chatUpdate)
        } catch (e) {
            logger.error('Error en handler')
            console.error(e)
        }
    })

    conn.decodeJid = (jid) => {
        if (!jid) return jid
        return /:\d+@/gi.test(jid) ? jidNormalizedUser(jid) : jid
    }

    return conn
}

setInterval(cleanTmp, 1000 * 60 * 60)
startBot()

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)
