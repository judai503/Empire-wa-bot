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

// =========================
// DIRNAME
// =========================

const __dirname = path.dirname(
    fileURLToPath(import.meta.url)
)

// =========================
// CREAR CARPETAS
// =========================

if (!fs.existsSync('./sessions')) {
    fs.mkdirSync('./sessions', { recursive: true })
}

if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp', { recursive: true })
}

if (!fs.existsSync('./sword')) {
    fs.mkdirSync('./sword', { recursive: true })
}

// =========================
// READLINE
// =========================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = (text) =>
    new Promise((resolve) =>
        rl.question(text, resolve)
    )

// =========================
// GLOBALS
// =========================

global.plugins = {}

global.timestamp = {
    start: Date.now()
}

// =========================
// BANNER
// =========================

function banner() {

    console.clear()

    console.log(
        chalk.yellow(
            figlet.textSync(
                'EMPIRE',
                {
                    horizontalLayout: 'default'
                }
            )
        )
    )

    console.log(
        chalk.cyanBright(
            '⚔️ EMPIRE BOT MD'
        )
    )

    console.log(
        chalk.greenBright(
            `👑 OWNER: ${global.owner[0][1]}`
        )
    )

    console.log(
        chalk.magentaBright(
            `🕒 ${new Date().toLocaleString()}`
        )
    )

    console.log(
        chalk.gray(
            '━━━━━━━━━━━━━━━━━━━━━━━'
        )
    )
}

// =========================
// LOAD PLUGINS
// =========================

async function loadPlugins() {

    const folder =
        path.join(__dirname, 'sword')

    const files = fs
        .readdirSync(folder)
        .filter(file => file.endsWith('.js'))

    for (const file of files) {

        try {

            const dir =
                pathToFileURL(
                    path.join(folder, file)
                ).href

            const plugin =
                await import(
                    `${dir}?update=${Date.now()}`
                )

            global.plugins[file] =
                plugin.default || plugin

            console.log(
                chalk.green('✓'),
                chalk.cyan(file)
            )

        } catch (e) {

            console.log(
                chalk.red(`✗ ${file}`)
            )

            console.error(e)
        }
    }
}

// =========================
// WATCH PLUGINS
// =========================

function watchPlugins() {

    const folder =
        path.join(__dirname, 'sword')

    fs.watch(folder, async (_, filename) => {

        if (!filename) return
        if (!filename.endsWith('.js')) return

        const file =
            path.join(folder, filename)

        if (!fs.existsSync(file)) return

        try {

            const dir =
                pathToFileURL(file).href

            const plugin =
                await import(
                    `${dir}?update=${Date.now()}`
                )

            global.plugins[filename] =
                plugin.default || plugin

            console.log(
                chalk.yellow(
                    `🛠️ Plugin actualizado: ${filename}`
                )
            )

        } catch (e) {

            console.log(
                chalk.red(
                    `❌ Error recargando ${filename}`
                )
            )

            console.error(e)
        }
    })
}

// =========================
// CLEAN TMP
// =========================

function cleanTmp() {

    const tmp = './tmp'

    if (!fs.existsSync(tmp)) return

    const files = fs.readdirSync(tmp)

    for (const file of files) {

        try {

            fs.unlinkSync(
                path.join(tmp, file)
            )

        } catch {}
    }
}

// =========================
// START BOT
// =========================

async function startBot() {

    banner()

    // =========================
    // AUTH
    // =========================

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        './sessions'
    )

    const {
        version
    } = await fetchLatestBaileysVersion()

    // =========================
    // LOAD PLUGINS
    // =========================

    await loadPlugins()

    watchPlugins()

    // =========================
    // SOCKET
    // =========================

    const conn = makeWASocket({

        version,

        logger: pino({
            level: 'silent'
        }),

        printQRInTerminal: false,

        browser: Browsers.macOS('Chrome'),

        auth: {

            creds: state.creds,

            keys: makeCacheableSignalKeyStore(
                state.keys,
                pino({
                    level: 'fatal'
                })
            )
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

        console.log(
            chalk.yellowBright(
                '\n📲 INGRESA EL NÚMERO PARA VINCULAR EL BOT\n'
            )
        )

        const phoneNumber = await question(
            chalk.cyanBright(
                '➡️ Número (Ejemplo: 50377777777): '
            )
        )

        setTimeout(async () => {

            try {

                const code =
                    await conn.requestPairingCode(
                        phoneNumber
                            .replace(/[^0-9]/g, '')
                            .trim()
                    )

                const formatted =
                    code
                        ?.match(/.{1,4}/g)
                        ?.join('-') || code

                console.log(
                    chalk.black.bgGreen.bold(
                        '\n CÓDIGO DE VINCULACIÓN '
                    ),

                    chalk.white.bgMagenta.bold(
                        ` ${formatted} `
                    )
                )

            } catch (e) {

                console.log(
                    chalk.red(
                        '❌ Error generando pairing code'
                    )
                )

                console.error(e)
            }

        }, 3000)
    }

    // =========================
    // SAVE CREDS
    // =========================

    conn.ev.on(
        'creds.update',
        saveCreds
    )

    // =========================
    // CONNECTION UPDATE
    // =========================

    conn.ev.on(
        'connection.update',
        async (update) => {

            const {
                qr,
                connection,
                lastDisconnect
            } = update

            // =========================
            // QR
            // =========================

            if (qr) {

                console.log(
                    chalk.greenBright(
                        '\n📱 ESCANEA EL QR\n'
                    )
                )

                qrcode.generate(
                    qr,
                    {
                        small: true
                    }
                )
            }

            // =========================
            // CONNECTING
            // =========================

            if (connection === 'connecting') {

                console.log(
                    chalk.yellow(
                        '🔄 Conectando a WhatsApp...'
                    )
                )
            }

            // =========================
            // OPEN
            // =========================

            if (connection === 'open') {

                banner()

                console.log(
                    chalk.greenBright(
                        '✅ CONECTADO EXITOSAMENTE'
                    )
                )

                console.log(
                    chalk.cyanBright(
                        `🤖 BOT: ${global.botname}`
                    )
                )

                console.log(
                    chalk.yellowBright(
                        `⚡ Plugins: ${Object.keys(global.plugins).length}`
                    )
                )

                console.log(
                    chalk.magentaBright(
                        `🧠 Usuario: ${conn.user?.name || 'Desconocido'}`
                    )
                )

                console.log(
                    chalk.gray(
                        '━━━━━━━━━━━━━━━━━━━━━━━'
                    )
                )
            }

            // =========================
            // CLOSE
            // =========================

            if (connection === 'close') {

                const reason =
                    new Boom(
                        lastDisconnect?.error
                    )?.output?.statusCode

                console.log(
                    chalk.red(
                        `❌ Conexión cerrada (${reason})`
                    )
                )

                if (
                    reason !==
                    DisconnectReason.loggedOut
                ) {

                    console.log(
                        chalk.yellow(
                            '🔄 Reconectando...'
                        )
                    )

                    setTimeout(
                        () => startBot(),
                        5000
                    )

                } else {

                    console.log(
                        chalk.redBright(
                            '\n⚠️ Sesión cerrada'
                        )
                    )

                    console.log(
                        chalk.redBright(
                            '🗑️ Elimina la carpeta sessions'
                        )
                    )
                }
            }
        }
    )

    // =========================
    // MESSAGES
    // =========================

    conn.ev.on(
        'messages.upsert',
        async (chatUpdate) => {

            try {

                await handler.call(
                    conn,
                    chatUpdate
                )

            } catch (e) {

                console.log(
                    chalk.redBright(
                        '❌ Error en handler'
                    )
                )

                console.error(e)
            }
        }
    )

    // =========================
    // DECODE JID
    // =========================

    conn.decodeJid = (jid) => {

        if (!jid) return jid

        return /:\d+@/gi.test(jid)
            ? jidNormalizedUser(jid)
            : jid
    }

    return conn
}

// =========================
// CLEAN TMP
// =========================

setInterval(
    cleanTmp,
    1000 * 60 * 60
)

// =========================
// START
// =========================

startBot()

// =========================
// ERRORS
// =========================

process.on(
    'uncaughtException',
    console.error
)

process.on(
    'unhandledRejection',
    console.error
)
