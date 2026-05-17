// sword/settings.js

const settings = async function (m, { conn, command, args }) {
    let chat = global.db.data.chats[m.chat]

    if (!chat) {
        global.db.data.chats[m.chat] = {
            welcome: true,
            modoadmin: false,
            antiLink: true,
            economy: true,
            antionceview: false
        }
        chat = global.db.data.chats[m.chat]
    }

    // Mapeo por si el usuario escribe en minúsculas pero en tu handler está con mayúsculas (como antiLink)
    let dbKey = command;
    if (command === 'antilink') dbKey = 'antiLink';

    // =========================
    // SIN ARGUMENTOS
    // =========================
    if (!args[0]) {
        return conn.sendMessage(m.chat, {
            text: `🏰 *﹝ CONFIGURACIÓN EMPIRE ﹞* 🏰\n──────────────────────────────\n\n` +
                  `⚙️ *Función:* ${command.toUpperCase()}\n\n` +
                  `➜ *Para activar:* .${command} on\n` +
                  `➜ *Para desactivar:* .${command} off\n\n` +
                  `📊 *Estado actual:* ${chat[dbKey] ? '✅ Activado' : '❌ Desactivado'}`
        }, { quoted: m })
    }

    const state = args[0].toLowerCase()

    // =========================
    // VALIDAR
    // =========================
    if (state !== 'on' && state !== 'off') {
        return conn.sendMessage(m.chat, {
            text: `⚠️ *OPCIÓN INVÁLIDA*\n\n➜ Usa: .${command} on\n➜ O: .${command} off`
        }, { quoted: m })
    }

    // =========================
    // GUARDAR EN BD
    // =========================
    chat[dbKey] = state === 'on'

    // =========================
    // RESPUESTA ESTILIZADA
    // =========================
    await conn.sendMessage(m.chat, {
        text: `🏰 *﹝ EMPIRE - ACTUALIZADO ﹞* 🏰\n──────────────────────────────\n\n` +
              `${state === 'on' ? '✅' : '❌'} *Ajuste del grupo modificado.*\n\n` +
              `⚙️ *Función:* ${command}\n` +
              `📊 *Estado:* ${state === 'on' ? 'Activado' : 'Desactivado'}`
    }, { quoted: m })
}

// Comandos válidos que maneja este único archivo por grupo
settings.command = [
    'welcome',
    'antilink',
    'modoadmin',
    'economy',
    'antionceview'
]

settings.group = true;
settings.admin = true; // Solo los admins del grupo pueden alterar los ajustes

export default settings
