import chalk from 'chalk'

let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
    // Verificamos si quien lo usa es "El tío Judai"
    let status = isOwner ? '👑 Dueño (Administrador)' : '👤 Usuario de Empire'
    let user = global.db.data.users[m.sender]
    
    let text = `
⚔️ *SISTEMA EMPIRE ACTIVO* ⚔️
━━━━━━━━━━━━━━━━━━
✨ *Bot:* ${global.botname}
👤 *Tu Rango:* ${status}
💰 *Tus Monedas:* ${user.monedas}
🏷️ *Tu ID:* @${m.sender.split('@')[0]}
━━━━━━━━━━━━━━━━━━
¡La espada ha sido desenvainada con éxito!`.trim()

    await conn.sendMessage(m.chat, { 
        text: text,
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: 'Empire - Judai Society',
                body: 'Prueba de Conexión Exitosa',
                thumbnailUrl: 'https://qu.ax/ZpYp.jpg', // Cambia esto por tu imagen favorita
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.command = ['test', 'prueba', 'empire'] // Puedes usar .test o .prueba
export default handler
