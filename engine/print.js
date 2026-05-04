import fs from 'fs'
import chalk from 'chalk'

/**
 * Carga o inicializa la base de datos JSON
 */
global.loadDatabase = async function loadDatabase() {
    let databasePath = './database.json'
    
    if (fs.existsSync(databasePath)) {
        try {
            global.db.data = JSON.parse(fs.readFileSync(databasePath))
        } catch (e) {
            console.error(chalk.red('❌ Error al leer la base de datos:'), e)
            global.db.data = { users: {}, chats: {}, settings: {} }
        }
    } else {
        // Si no existe, la crea vacía
        global.db.data = { users: {}, chats: {}, settings: {} }
        fs.writeFileSync(databasePath, JSON.stringify(global.db.data, null, 2))
        console.log(chalk.yellow('📦 Base de datos creada.'))
    }
}

/**
 * Guarda los datos actuales en el archivo JSON
 */
global.saveDatabase = function saveDatabase() {
    fs.writeFileSync('./database.json', JSON.stringify(global.db.data, null, 2))
}

// Auto-guardado cada 30 segundos
setInterval(() => {
    if (global.db.data) global.saveDatabase()
}, 30 * 1000)
