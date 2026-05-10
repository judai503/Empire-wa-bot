import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// =========================
// CONFIGURACIÓN DE DUEÑO
// =========================
global.owner = [
    ['50360438371', 'El tío Judai', true]
]

// =========================
// IDENTIDAD DEL BOT
// =========================
global.botname = 'EMPIRE'
global.packname = 'EMPIRE BOT'
global.author = 'Judai'

global.prefix = /^[.#]/i

global.icons = {
    success: '✅',
    error: '❌',
    wait: '⏳',
    admin: '👑',
    bot: '🤖'
}

// =========================
// ECONOMÍA RPG
// =========================
global.rpg = {
    initialMoney: 10
}

// =========================
// BASE DE DATOS (IMPORTANTE)
// =========================
// No borres lo que ya existe si el bot se reinicia
global.db = global.db || { data: {} }
global.db.data = global.db.data || {
    users: {},
    chats: {},
    settings: {}
}

// Función para asegurar que la DB cargue correctamente
global.loadDatabase = async function () {
    if (global.db.data) return global.db.data
    return global.db.data = {
        users: {},
        chats: {},
        settings: {}
    }
}

// =========================
// AUTO-RECARGA DE CONFIG
// =========================
const file = fileURLToPath(import.meta.url)

watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("🛠️ Se actualizó config.js"))
    await import(`${file}?update=${Date.now()}`)
})
