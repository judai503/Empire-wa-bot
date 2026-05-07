let handler = async (m, {
    conn,
    args,
    command
}) => {

    // =========================
    // SOLO GRUPOS
    // =========================

    if (!m.isGroup) {

        return m.reply(
`❌ ESTE COMANDO SOLO FUNCIONA EN GRUPOS`
        )
    }

    // =========================
    // DATABASE
    // =========================

    global.db = global.db || {
        data: {}
    }

    global.db.data.chats =
        global.db.data.chats || {}

    if (!global.db.data.chats[m.chat]) {

        global.db.data.chats[m.chat] = {}
    }

    let chat =
        global.db.data.chats[m.chat]

    // =========================
    // GROUP
    // =========================

    let groupMetadata =
        await conn.groupMetadata(m.chat)

    let participants =
        groupMetadata.participants || []

    // =========================
    // SET EMOJI
    // =========================

    if (
        command === 'setemoji' ||
        command === 'emotag'
    ) {

        let emoji = args[0]

        // =========================
        // SIN EMOJI
        // =========================

        if (!emoji) {

            return await conn.sendMessage(
                m.chat,
                {
                    text:
`✨ CONFIGURACIÓN EMOTAG

➜ Uso:
.${command} 😺

➜ Ejemplo:
.setemoji 🐉

➜ Emoji actual:
${chat.tagEmoji || '🌸'}`
                },
                { quoted: m }
            )
        }

        // =========================
        // GUARDAR
        // =========================

        chat.tagEmoji = emoji

        // =========================
        // RESPUESTA
        // =========================

        return await conn.sendMessage(
            m.chat,
            {
                text:
`✨ EMOTAG ACTUALIZADO

➜ Nuevo emoji:
${emoji}

➜ Estado:
✅ GUARDADO CORRECTAMENTE

👥 Ahora el comando .todos usará este emoji`
            },
            { quoted: m }
        )
    }

    // =========================
    // TEXTO
    // =========================

    let text =
        args.join(' ') ||
        'ATENCIÓN GRUPO'

    // =========================
    // EMOJIS
    // =========================

    let animals = [

        '🦖','🦕','🐊','🐉',
        '🐲','🦁','🐯','🐺',
        '🦊','🐼','🐨','🐵',
        '🦄','🐙','🦈','🦅',
        '🐧','🦋','🐢','🐍'
    ]

    let randomAnimal =
        animals[
            Math.floor(
                Math.random() * animals.length
            )
        ]

    let emoji =
        chat.tagEmoji ||
        randomAnimal

    // =========================
    // USERS
    // =========================

    let users =
        participants.map(v => v.id)

    // =========================
    // MESSAGE
    // =========================

    let teks =
`╭━━━〔 👥 TODOS 〕━━⬣

📢 ${text}

👑 Invocado por:
@${m.sender.split('@')[0]}

👥 Participantes:
${participants.length}

╰━━━━━━━━━━━━⬣

${users.map(v =>
`${emoji} @${v.split('@')[0]}`
).join('\n')}

━━━━━━━━━━━━━━⬣
⚔️ EMPIRE BOT`

    // =========================
    // SEND
    // =========================

    await conn.sendMessage(
        m.chat,
        {
            text: teks,
            mentions: users
        },
        { quoted: m }
    )
}

handler.command = [
    'todos',
    'tagall',
    'invocar',
    'emotag',
    'setemoji'
]

export default handler
