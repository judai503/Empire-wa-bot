import { smsg } from './engine/simple.js'
import { format } from 'util'
import chalk from 'chalk'
import { jidNormalizedUser } from '@whiskeysockets/baileys'

const handler = async function (chatUpdate) {
    if (!chatUpdate) return
    let m = chatUpdate.messages?.[0]
    if (!m) return

    try {
        // Procesar mensaje
        m = smsg(this, m) || m
        if (!m) return

        // Forzar base de datos
        global.db = global.db || { data: { users: {}, chats: {}, settings: {} } }
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { welcome: true, sWelcome: '', welcomeType: 'custom' }
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { name: m.name || 'Usuario' }

        let chat = global.db.data.chats[m.chat]
        let user = global.db.data.users[m.sender]

        // --- DETECCIÓN DE OWNER ---
        const isOwner = global.owner.some(owner => 
            owner[0].replace(/\D/g, '') + '@s.whatsapp.net' === m.sender
        ) || m.fromMe // <--- Aquí permitimos que responda aunque seas tú

        // --- DETECCIÓN DE ADMINS ---
        let isAdmin = false
        let isBotAdmin = false
        if (m.isGroup) {
            const groupMetadata = await this.groupMetadata(m.chat).catch(_ => ({}))
            const participants = groupMetadata.participants || []
            const admins = participants.filter(v => v.admin).map(v => v.id)
            isAdmin = admins.includes(m.sender)
            isBotAdmin = admins.includes(jidNormalizedUser(this.user.id))
        }

        // --- LÓGICA DE PREFIJO ---
        const prefix = global.prefix || /^[.#]/i
        const match = prefix.exec(m.body || '')
        
        // Si no es comando, ignorar
        if (!match) return

        const usedPrefix = match[0]
        const noPrefix = m.body.replace(usedPrefix, '').trim()
        let [command, ...args] = noPrefix.split(' ')
        command = (command || '').toLowerCase()

        if (!command) return

        // LOG EN CONSOLA (Si ves esto, el bot llegó aquí)
        console.log(chalk.bgGreen.black(' EJECUTANDO '), chalk.white(`[ ${command} ]`), chalk.cyan(`por ${m.pushName || 'Owner'}`))

        // --- BÚSQUEDA DE PLUGINS ---
        let found = false
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            const isAccept = Array.isArray(plugin.command) 
                ? plugin.command.includes(command) 
                : plugin.command === command

            if (!isAccept) continue
            found = true

            // Saltarse validaciones si es el Owner para probar
            if (plugin.owner && !isOwner) return m.reply('❌ Solo dueño.')
            if (plugin.admin && !isAdmin && !isOwner) return m.reply('❌ Solo admins.')

            try {
                await plugin.call(this, m, {
                    conn: this,
                    usedPrefix,
                    args,
                    command,
                    text: args.join(' '),
                    isOwner,
                    isAdmin,
                    isBotAdmin,
                    chat,
                    user
                })
            } catch (e) {
                console.error(chalk.red(`Error en ${name}:`), e)
                this.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
            }
            break 
        }

        if (!found) console.log(chalk.yellow(`[!] El comando "${command}" no existe en los plugins.`))

    } catch (e) {
        console.error(format(e))
    }
}

export { handler }
