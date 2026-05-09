let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!m.isGroup) {
return conn.sendMessage(m.chat, {
text: '❌ ESTE COMANDO SOLO FUNCIONA EN GRUPOS'
}, { quoted: m })
}

// =========================
// OBTENER DATOS
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
        text: '❌ SOLO LOS ADMINISTRADORES PUEDEN QUITAR PODER.'
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
        text: `✨ QUITAR PODER

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
    "🔻 Un administrador ha sido removido.",
    "⚡ Poder retirado correctamente.",
    "✨ Los permisos administrativos fueron eliminados.",
    "🛡️ El rango de administrador ha sido quitado.",
    "🔥 La autoridad del usuario fue revocada."
]

let fraseRandom = frases[Math.floor(Math.random() * frases.length)]

// =========================
// DEGRADAR
// =========================
try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')

    let teks = `

✨ ADMINISTRADOR ELIMINADO

➜ Usuario:
@${who.split('@')[0]}

➜ Acción:
Administrador removido correctamente.

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
        text: '❌ ERROR AL QUITAR ADMINISTRADOR.'
    }, { quoted: m })
}

}

handler.command = ['quitarpoder', 'quitaradmin', 'demote']
handler.group = true

export default handler
