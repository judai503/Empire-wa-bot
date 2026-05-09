let handler = async (m, { conn, command }) => {

// SOLO GRUPOS
if (!m.isGroup) {
    return m.reply('❌ ESTE COMANDO SOLO FUNCIONA EN GRUPOS')
}

// METADATA
let groupMetadata = await conn.groupMetadata(m.chat)
let participants = groupMetadata.participants || []

// VERIFICAR ADMIN REAL
let isAdmin = participants.some(p =>
    p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin')
)

if (!isAdmin) {
    return m.reply('❌ SOLO LOS ADMINISTRADORES PUEDEN USAR ESTE COMANDO')
}

// ABRIR GRUPO
await conn.groupSettingUpdate(m.chat, 'not_announcement')

let name = groupMetadata.subject

let text = `

✨ GRUPO ABIERTO

➜ Grupo:
${name}

➜ Estado:
Todos pueden escribir ahora.

➜ Administrador:
@${m.sender.split('@')[0]}
`

return conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender]
}, { quoted: m })

}

handler.command = [
'abrir',
'open',
'grupoabrir',
'abrirgrupo',
'grupo abrir'
]

export default handler
