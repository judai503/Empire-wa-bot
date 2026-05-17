// * 👤 CREADOR: El tío Judai
// * 🏰 COMPONENTE: Sistema de Auto-Actualización EMPIRE (FORZADO CON RESET)
// * 🌐 REPOSITORIO: https://github.com/judai503/Empire-wa-bot

import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, {
        text: `🚀 *﹝ EMPIRE - REPOSITORIO ﹞* 🚀\n──────────────────────────────\n\n🔄 *Iniciando sincronización forzada...*\n\n📡 Conectando con: \`judai503/Empire-wa-bot\` (Rama: main)\n📥 Limpiando caché local del hosting y descargando código limpio...`
    }, { quoted: m })

    try {
        // 1. Asegurar la URL remota
        await execPromise('git remote set-url origin https://github.com/judai503/Empire-wa-bot.git').catch(() => {})
        
        // 2. Traer los cambios del servidor sin combinarlos todavía
        await execPromise('git fetch origin main')
        
        // 3. CRÍTICO: Forzar a Git a borrar cualquier cambio hecho en el panel y ponerse IGUAL a GitHub
        await execPromise('git reset --hard origin/main')

        // 4. Confirmar el estado de la descarga
        let updateText = `🏰 *﹝ EMPIRE - ACTUALIZADO ﹞* 🏰\n──────────────────────────────\n\n⚡ *¡Sincronización forzada completada con éxito!*\n\n El hosting se ha alineado al 100% con tu repositorio de GitHub.\n\n🔄 *Reiniciando los sistemas principales...*`
        
        await conn.sendMessage(m.chat, { text: updateText }, { quoted: m })

        // Forzar apagado para que PM2/AkiraX lo levante con el código nuevo
        setTimeout(() => {
            process.exit(0)
        }, 2000)

    } catch (e) {
        console.error(e)
        let errorText = `🛡️ *﹝ EMPIRE - CRITICAL ERROR ﹞* 🛡️\n──────────────────────────────\n\n❌ *Fallo severo al resetear el repositorio.*\n\n\`\`\`${e.message}\`\`\``
        
        conn.sendMessage(m.chat, { text: errorText }, { quoted: m })
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'gitpull']

handler.rowner = true 

export default handler
