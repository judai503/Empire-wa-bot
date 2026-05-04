import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from '@whiskeysockets/baileys'
import pino from 'pino'
import { handler } from './handler.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import chalk from 'chalk'
import figlet from 'figlet'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
const __dirname = path.dirname(fileURLToPath(import.meta.url))

global.plugins = {}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions')
    const { version } = await fetchLatestBaileysVersion()

    // --- CARGA DE ESPADAS (COMANDOS) ---
    const swordFolder = path.join(__dirname, 'sword')
    if (!fs.existsSync(swordFolder)) fs.mkdirSync(swordFolder)
    const swordFiles = fs.readdirSync(swordFolder).filter(file => file.endsWith('.js'))
    
    for (let file of swordFiles) {
        try {
            const plugin = await import(`./sword/${file}`)
            global.plugins[file] = plugin.default || plugin
        } catch (e) {
            console.error(`Error al desenvainar ${file}:`, e)
        }
    }

    const conn = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    })

    if (!conn.authState.creds.registered) {
        const phoneNumber = await question(chalk.cyan.bold('\nIntroduce tu número para EMPIRE:\n> '))
        const code = await conn.requestPairingCode(phoneNumber.trim())
        console.log(chalk.black.bgGreen.bold(` CÓDIGO DE VINCULACIÓN: `), chalk.white.bgMagenta.bold(` ${code} `))
    }

    conn.ev.on('creds.update', saveCreds)
    conn.ev.on('messages.upsert', async (chatUpdate) => { await handler.call(conn, chatUpdate) })

    conn.ev.on('connection.update', (update) => {
        const { connection } = update
        if (connection === 'open') {
            console.log(chalk.yellow(figlet.textSync('EMPIRE', { font: 'Standard' })))
            console.log(chalk.green.bold(`✅ ¡BIENVENIDO ${global.owner[0][1]}! EMPIRE ESTÁ ONLINE`))
        }
    })

    conn.decodeJid = (jid) => {
        if (!jid) return jid
        return /:\d+@/gi.test(jid) ? jidNormalizedUser(jid) : jid
    }

    return conn
}

startBot()
