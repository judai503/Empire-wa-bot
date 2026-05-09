let handler = async (m, {
    conn,
    args,
    command
}) => {

    // =========================
    // SOLO GRUPOS
    // =========================

    if (!m.isGroup) {
        return m.reply(`❌ ESTE COMANDO SOLO FUNCIONA EN GRUPOS`)
    }

    // =========================
    // OBTENER PARTICIPANTES Y ADMINS
    // =========================

    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants || []
    let groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id)
    let isAdmin = groupAdmins.includes(m.sender)

    // =========================
    // VALIDACIÓN DE ADMIN
    // =========================

    if (!isAdmin) {
        return m.reply(`❌ ESTE COMANDO ES SOLO PARA ADMINISTRADORES`)
    }

    // =========================
    // DATABASE
    // =========================

    global.db = global.db || { data: {} }
    global.db.data.chats = global.db.data.chats || {}

    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = {}
    }

    let chat = global.db.data.chats[m.chat]

    // =========================
    // SET EMOJI / EMOTAG
    // =========================

    if (command === 'setemoji' || command === 'emotag') {
        let emoji = args[0]

        if (!emoji) {
            return await conn.sendMessage(
                m.chat,
                {
                    text: `✨ CONFIGURACIÓN EMOTAG\n\n➜ Uso:\n.${command} 😺\n\n➜ Ejemplo:\n.setemoji 🐉\n\n➜ Emoji actual:\n${chat.tagEmoji || '🌸'}`
                },
                { quoted: m }
            )
        }

        chat.tagEmoji = emoji

        return await conn.sendMessage(
            m.chat,
            {
                text: `✨ EMOTAG ACTUALIZADO\n\n➜ Nuevo emoji:\n${emoji}\n\n➜ Estado:\n✅ GUARDADO CORRECTAMENTE\n\n👥 Ahora el comando .todos usará este emoji`
            },
            { quoted: m }
        )
    }

    // =========================
    // LÓGICA DE INVOCACIÓN (.todos)
    // =========================

    let text = args.join(' ') || 'ATENCIÓN GRUPO'

    let animals = ['🦖','🦕','🐊','🐉','🐲','🦁','🐯','🐺',' foxes','🦊','🐼','🐨','🐵','🦄','🐙','🦈','🦅','🐧','🦋','🐢','🐍']
    let randomAnimal = animals[Math.floor(Math.random() * animals.length)]
    let emoji = chat.tagEmoji || randomAnimal

    let users = participants.map(v => v.id)

    let teks = `╭━━━〔 👥 TODOS 〕━━⬣\n\n📢 ${text}\n\n👑 Invocado por:\n@${m.sender.split('@')[0]}\n\n👥 Participantes:\n${participants.length}\n\n╰━━━━━━━━━━━━⬣\n\n${users.map(v => `${emoji} @${v.split('@')[0]}`).join('\n')}\n\n━━━━━━━━━━━━━━⬣\n⚔️ EMPIRE BOT`

    await conn.sendMessage(
        m.chat,
        {
            text: teks,
            mentions: users
        },
        { quoted: m }
    )
}

handler.command = ['todos', 'tagall', 'invocar', 'emotag', 'setemoji']

export default handler
