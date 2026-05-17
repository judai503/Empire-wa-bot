import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// ==========================================
// CONFIGURACIÓN DE DUEÑOS Y STAFF
// ==========================================
global.owner = [
    ['50360438371', 'El tío Judai', true] // Tu número principal
]

global.prems = [] // Aquí puedes meter números premium extras en el futuro

// ==========================================
// IDENTIDAD Y ESTILOS DEL BOT
// ==========================================
global.botname = 'EMPIRE'
global.packname = 'EMPIRE BOT'
global.author = 'Judai'

// Prefijo global admitido (Soporta . y #)
global.prefix = /^[.#]/i

// Iconos globales para modular tus mensajes en los plugins
global.icons = {
    success: '✅',
    error: '❌',
    wait: '⏳',
    admin: '👑',
    bot: '🤖'
}

// Dejado vacío al no contar con canal de soporte aún
global.rcanal = '' 

// ==========================================
// ECONOMÍA RPG
// ==========================================
global.rpg = {
    initialMoney: 10
}

// ==========================================
// BASE DE DATOS (PERSISTENCIA SEGURA)
// ==========================================
global.db = global.db || { data: {} }
if (!global.db.data) {
    global.db.data = {
        users: {},
        chats: {},
        settings: {}
    }
}

// Función optimizada para asegurar la carga limpia de la base de datos
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
// AUTO-RECARGA EN CALIENTE (Hot Reload)
// ==========================================
const file = fileURLToPath(import.meta.url)

watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.bold.cyanBright("🛠️ [CONFIG] Se detectaron cambios y se actualizó 'config.js'"))
    await import(`${file}?update=${Date.now()}`)
})
