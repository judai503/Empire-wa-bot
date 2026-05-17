// * 👤 CREADOR: El tío Judai
// * 🏰 COMPONENTE: Transmisión Masiva a Grupos (Broadcast)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.sendMessage(m.chat, { 
        text: `⚠️ *[ EMPIRE - BROADCAST ]*\n\nDebes escribir el mensaje que deseas difundir.\n*Ejemplo:* ${usedPrefix}${command} ¡Hola a todos! Nueva actualización disponible.` 
    }, { quoted: m })

    // Obtener la lista de todos los chats en la memoria de Baileys
    let dewi = Object.keys(conn.chats || {})
    // Filtrar para quedarnos únicamente con los grupos de WhatsApp
    let groups = dewi.filter(jid => jid.endsWith('@g.us'))

    await conn.sendMessage(m.chat, { 
        text: `📢 *﹝ EMPIRE - DIFUSIÓN ﹞* 📢\n──────────────────────────────\n\n📡 Enviando comunicado masivo a *${groups.length}* grupos...\n⏳ _Esto puede tomar unos segundos para evitar ban de WhatsApp._` 
    }, { quoted: m })

    let txt = `🏰 *﹝ COMUNICADO OFICIAL EMPIRE ﹞* 🏰\n──────────────────────────────\n\n📢 *Mensaje del Creador Absoluto:*\n\n${text}\n\n──────────────────────────────\n📌 _Este es un mensaje automático del desarrollador._`

    for (let id of groups) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Delay de 2 segundos por grupo para evitar spam/ban
        await conn.sendMessage(id, { text: txt }).catch(_ => {})
    }

    await conn.sendMessage(m.chat, { text: `✅ *Dofusión completada con éxito en todos los grupos activos.*` }, { quoted: m })
}

handler.help = ['bc', 'broadcast']
handler.tags = ['owner']
handler.command = ['bc', 'broadcast', 'txtglobal']

handler.rowner = true 

export default handler
