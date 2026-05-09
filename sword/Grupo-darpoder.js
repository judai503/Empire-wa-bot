let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!m.isGroup) {
return conn.sendMessage(m.chat, {
text: '❌ ESTE COMANDO SOLO FUNCIONA EN GRUPOS'
}, { quoted: m })
}

// =========================
// OBTENER DATOS ACTUALIZADOS
// =========================
let groupMetadata = await conn.groupMetadata(m.chat)
let participants = groupMetadata.participants || []
let groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id)

// LIMPIEZA DE IDs
let botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
let isAdmin = groupAdmins.includes(m.sender)
let botIsAdmin = groupAdmins.includes(botId)

if (!isAdmin) {
    return conn.sendMessage(m.chat, {
        text: '❌ SOLO LOS ADMINISTRADORES PUEDEN DAR PODER.'
    }, { quoted: m })
}

if (!botIsAdmin) {
    return conn.sendMessage(m.chat, {
        text: '❌ NECESITO SER ADMIN PARA USAR ESTE COMANDO.'
    }, { quoted: m })
}

// =========================
// SELECCIONAR USUARIO
// =========================
let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
    ? m.quoted.sender
    : args[0]
    ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net'
    : ''

if (!who) {
    return conn.sendMessage(m.chat, {
        text: `✨ DAR PODER

➜ Uso:
.${command} @usuario

➜ Ejemplo:
.${command} @${m.sender.split('@')[0]}`
}, { quoted: m })
}

// =========================
// FRASES
// =========================
let frases = [
    "👑 Un nuevo administrador ha sido elegido.",
    "⚡ Poder otorgado correctamente.",
    "✨ Ahora formas parte del equipo administrativo.",
    "🛡️ Se han concedido permisos de administrador.",
    "🔥 El poder del grupo ha sido transferido."
]

let fraseRandom = frases[Math.floor(Math.random() * frases.length)]

// =========================
// PROMOVER
// =========================
try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')

    let teks = `

✨ NUEVO ADMINISTRADOR

➜ Usuario:
@${who.split('@')[0]}

➜ Acción:
Administrador otorgado correctamente.

➜ Administrador:
@${m.sender.split('@')[0]}

➜ Mensaje:
${fraseRandom}
`

    await conn.sendMessage(m.chat, {
        text: teks,
        mentions: [who, m.sender]
    }, { quoted: m })

} catch (e) {
    conn.sendMessage(m.chat, {
        text: '❌ ERROR AL DAR ADMINISTRADOR.'
    }, { quoted: m })
}

}

handler.command = ['darpoder', 'daradmin', 'promote']
handler.group = true

export default handler
