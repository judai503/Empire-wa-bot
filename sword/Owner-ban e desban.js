// * 👤 CREADOR: El tío Judai
// * 🏰 COMPONENTE: Control de Accesos (Ban/Unban)

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    
    if (!who) return conn.sendMessage(m.chat, { 
        text: `⚠️ *[ EMPIRE - SEGURIDAD ]*\n\nDebes etiquetar o responder al mensaje de quien deseas penalizar.\n*Ejemplo:* ${usedPrefix}${command} @tag` 
    }, { quoted: m })

    let user = global.db.data.users[who]
    if (!user) global.db.data.users[who] = { banned: false, bannedReason: "" }
    
    if (command === 'banuser' || command === 'ban') {
        if (global.db.data.users[who].banned) return conn.sendMessage(m.chat, { text: `❌ Este usuario ya se encuentra suspendido.` }, { quoted: m })
        
        global.db.data.users[who].banned = true
        global.db.data.users[who].bannedReason = text ? text.replace(/@\d+/g, '').trim() : "Violación de los términos del proyecto."
        
        await conn.sendMessage(m.chat, { 
            text: `🛡️ *﹝ EMPIRE - BAN DE USUARIO ﹞* 🛡️\n──────────────────────────────\n\n👤 *Usuario:* @${who.split('@')[0]}\n🛑 *Estado:* Suspendido del sistema\n📝 *Razón:* _${global.db.data.users[who].bannedReason}_\n\n⚖️ _A partir de ahora, el bot ignorará todos sus comandos de forma automática._`,
            mentions: [who]
        }, { quoted: m })
    }

    if (command === 'unbanuser' || command === 'unban') {
        if (!global.db.data.users[who].banned) return conn.sendMessage(m.chat, { text: `❌ Este usuario no está suspendido.` }, { quoted: m })
        
        global.db.data.users[who].banned = false
        global.db.data.users[who].bannedReason = ""
        
        await conn.sendMessage(m.chat, { 
            text: `✅ *﹝ EMPIRE - ACCESO RESTAURADO ﹞* ✅\n──────────────────────────────\n\n👤 *Usuario:* @${who.split('@')[0]}\n🟢 *Estado:* Readmitido con éxito\n\n✨ _Ya puede volver a usar los servicios y comandos globales de EMPIRE._`,
            mentions: [who]
        }, { quoted: m })
    }
}

handler.help = ['banuser @tag', 'unbanuser @tag']
handler.tags = ['owner']
handler.command = ['banuser', 'ban', 'unbanuser', 'unban']

handler.rowner = true 

export default handler
