// config.js

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// ==========================================
// CONFIGURACIÓN DE DUEÑOS Y STAFF (BLINDADO)
// ==========================================
global.owner = [
    ['503960438371', 'El tío Judai', true],
    ['50360438371', 'El tío Judai', true]
]

global.prems = [] 

// ==========================================
// IDENTIDAD Y ESTILOS DEL BOT
// ==========================================
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

global.rcanal = '' 

// ==========================================
// ECONOMÍA RPG
// ==========================================
global.rpg = {
    initialMoney: 10
}

// ==========================================
// BASE DE DATOS
// ==========================================
global.db = global.db || { data: {} }
if (!global.db.data) {
    global.db.data = {
        users: {},
        chats: {},
        settings: {}
    }
}

global.loadDatabase = async function () {
    if (global.db.data && Object.keys(global.db.data).length > 0) return global.db.data
    global.db.data = {
        users: {},
        chats: {},
        settings: {}
    }
    return global.db.data
}

// ==========================================
// AUTO-RECARGA
// ==========================================
const file = fileURLToPath(import.meta.url)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.bold.cyanBright("🛠️ [CONFIG] Se detectaron cambios y se actualizó 'config.js'"))
    await import(`${file}?update=${Date.now()}`)
})
