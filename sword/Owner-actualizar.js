// * 👤 CREADOR: El tío Judai
// * 🏰 COMPONENTE: Sistema de Auto-Actualización EMPIRE
// * 🌐 REPOSITORIO: https://github.com/judai503/Empire-wa-bot

import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, usedPrefix, command }) => {
    // Mensaje inicial estilizado de EMPIRE
    await conn.sendMessage(m.chat, {
        text: `🚀 *﹝ EMPIRE - REPOSITORIO ﹞* 🚀\n──────────────────────────────\n\n🔄 *Iniciando proceso de sincronización...*\n\n📡 Conectando con: \`judai503/Empire-wa-bot\` (Rama: main)\n📥 Buscando actualizaciones en el servidor Git, por favor espera...`
    }, { quoted: m })

    try {
        // Asegurar que Git apunte a tu rama remota correcta
        await execPromise('git remote set-url origin https://github.com/judai503/Empire-wa-bot.git').catch(() => {})
        
        // Ejecutar la descarga de cambios
        const { stdout, stderr } = await execPromise('git pull origin main')

        // Validar si ya está al día
        if (stdout.includes('Already up to date') || stdout.includes('Ya está al día')) {
            return conn.sendMessage(m.chat, {
                text: `🏰 *﹝ EMPIRE - NÚCLEO ﹞* 🏰\n──────────────────────────────\n\n✅ *El bot ya se encuentra en su versión más reciente.*\n\n📊 *Estado:* Sincronizado con GitHub.\n✨ No hay cambios pendientes por aplicar.`
            }, { quoted: m })
        }

        // Si se descargaron archivos nuevos
        let updateText = `🏰 *﹝ EMPIRE - ACTUALIZADO ﹞* 🏰\n──────────────────────────────\n\n⚡ *¡Actualización descargada con éxito!*\n\n📝 *Archivos modificados:*\n\`\`\`${stdout}\`\`\`\n\n🔄 *Reiniciando el sistema principal para aplicar los cambios...*`
        
        await conn.sendMessage(m.chat, { text: updateText }, { quoted: m })

        // Forzar el apagado controlado (El panel AkiraX o PM2 lo encenderá al instante con el código nuevo)
        setTimeout(() => {
            process.exit(0)
        }, 2000)

    } catch (e) {
        console.error(e)
        // Manejo de errores por conflictos de archivos editados en el panel
        let errorText = `🛡️ *﹝ EMPIRE - CRITICAL ERROR ﹞* 🛡️\n──────────────────────────────\n\n❌ *Ocurrió un fallo al intentar sincronizar con GitHub.*\n\n⚠️ *Causa común:* Modificaste archivos directamente desde el panel de tu hosting y Git no puede combinarlos con los de GitHub de forma automática.\n\n📝 *Detalle técnico:*\n\`\`\`${e.message}\`\`\``
        
        conn.sendMessage(m.chat, { text: errorText }, { quoted: m })
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'gitpull']

// RESTRICCIÓN: Solo tú (Owner/Creador del bot) puedes usar este comando
handler.rowner = true 

export default handler
