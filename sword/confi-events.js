// sword/settings.js

const settings = async function (
    m,
    {
        conn,
        command,
        args
    }
) {

    let chat =
        global.db.data.chats[m.chat]

    if (!chat) {

        global.db.data.chats[m.chat] = {

            welcome: false,
            modoadmin: false,
            antilink: false,
            antillamada: false,
            antispam: false,
            antiprivado: false,
            antionceview: false
        }

        chat =
            global.db.data.chats[m.chat]
    }

    // =========================
    // SIN ARGUMENTOS
    // =========================

    if (!args[0]) {

        return conn.sendMessage(
            m.chat,
            {
                text:
`✨ CONFIGURACIÓN ${command.toUpperCase()}

➜ Uso:
.${command} on

➜ Desactivar:
.${command} off

➜ Estado actual:
${chat[command] ? '✅ Activado' : '❌ Desactivado'}`
            }
        )
    }

    const state =
        args[0].toLowerCase()

    // =========================
    // VALIDAR
    // =========================

    if (
        state !== 'on' &&
        state !== 'off'
    ) {

        return conn.sendMessage(
            m.chat,
            {
                text:
`⚠️ OPCIÓN INVÁLIDA

➜ Usa:
.${command} on

➜ O:
.${command} off`
            }
        )
    }

    // =========================
    // GUARDAR
    // =========================

    chat[command] =
        state === 'on'

    // =========================
    // RESPUESTA
    // =========================

    await conn.sendMessage(
        m.chat,
        {
            text:
`${state === 'on'
    ? '✅'
    : '❌'} CONFIGURACIÓN ACTUALIZADA

➜ Función:
${command}

➜ Estado:
${state === 'on'
    ? 'Activado'
    : 'Desactivado'}`
        }
    )
}

settings.command = [

    'welcome',
    'antilink',
    'modoadmin',
    'antispam',
    'antiprivado',
    'antionceview',
    'antillamada'
]

export default settings
