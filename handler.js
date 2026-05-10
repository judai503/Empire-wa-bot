import { smsg } from './engine/simple.js'
import { format } from 'util'
import chalk from 'chalk'

const handler = async function (chatUpdate) {

    if (!chatUpdate) return

    let m = chatUpdate.messages?.[0]
    if (!m) return

    try {

        m = smsg(this, m) || m
        if (!m) return

        // =========================
        // DATABASE
        // =========================

        if (global.db?.data == null) {

            if (global.loadDatabase) {
                await global.loadDatabase()
            }
        }

        global.db = global.db || {
            data: {}
        }

        global.db.data.users =
            global.db.data.users || {}

        global.db.data.chats =
            global.db.data.chats || {}

        // =========================
        // USER
        // =========================

        let user =
            global.db.data.users[m.sender]

        if (typeof user !== 'object') {

            global.db.data.users[m.sender] = {}

            user =
                global.db.data.users[m.sender]
        }

        // =========================
        // USER DATA
        // =========================

        if (!('name' in user))
            user.name =
                m.name || 'Sin nombre'

        if (!('monedas' in user))
            user.monedas = 100

        if (!('exp' in user))
            user.exp = 0

        if (!('nivel' in user))
            user.nivel = 1

        if (!('diamantes' in user))
            user.diamantes = 0

        if (!('energia' in user))
            user.energia = 100

        if (!('bank' in user))
            user.bank = 0

        if (!('lastclaim' in user))
            user.lastclaim = 0

        if (!('premium' in user))
            user.premium = false

        if (!('banned' in user))
            user.banned = false

        // =========================
        // CHAT
        // =========================

        let chat =
            global.db.data.chats[m.chat]

        if (typeof chat !== 'object') {

            global.db.data.chats[m.chat] = {}

            chat =
                global.db.data.chats[m.chat]
        }

        // =========================
        // CHAT DATA
        // =========================

        if (!('welcome' in chat))
            chat.welcome = false

        if (!('modoadmin' in chat))
            chat.modoadmin = false

        if (!('antilink' in chat))
            chat.antilink = false

        if (!('antillamada' in chat))
            chat.antillamada = false

        if (!('antispam' in chat))
            chat.antispam = false

        if (!('antiprivado' in chat))
            chat.antiprivado = false

        if (!('antionceview' in chat))
            chat.antionceview = false

        // =========================
        // OWNER
        // =========================

        const isOwner =

            [global.owner[0][0]]
                .map(v =>
                    v.replace(
                        /[^0-9]/g,
                        ''
                    ) + '@s.whatsapp.net'
                )
                .includes(m.sender)

            || m.fromMe

        // =========================
        // ADMINS
        // =========================

        let isAdmin = false
        let isBotAdmin = false

        if (m.isGroup) {

            let groupMetadata =
                await this.groupMetadata(
                    m.chat
                )

            let participants =
                groupMetadata.participants

            let admins =
                participants
                    .filter(v => v.admin)
                    .map(v => v.id)

            isAdmin =
                admins.includes(m.sender)

            isBotAdmin =
                admins.includes(
                    this.user.id
                        .split(':')[0] +
                    '@s.whatsapp.net'
                )
        }

        // =========================
        // BEFORE EVENTS
        // =========================

        for (let name in global.plugins) {

            let plugin =
                global.plugins[name]

            if (!plugin) continue

            if (
                typeof plugin.before ===
                'function'
            ) {

                try {

                    await plugin.before.call(
                        this,
                        m,
                        {
                            conn: this,
                            chatUpdate,
                            isOwner,
                            isAdmin,
                            isBotAdmin,
                            user,
                            chat
                        }
                    )

                } catch (e) {

                    console.log(
                        chalk.redBright(
                            `❌ Error before ${name}`
                        )
                    )

                    console.error(e)
                }
            }
        }

        // =========================
        // PREFIX
        // =========================

        const prefix =
            global.prefix || /^[.#]/i

        const match =
            prefix.exec(m.body || '')

        if (!match) return

        const usedPrefix =
            match[0]

        const noPrefix =
            m.body.replace(
                usedPrefix,
                ''
            )

        let [command, ...args] =
            noPrefix
                .trim()
                .split(' ')

        command =
            (command || '')
                .toLowerCase()

        // =========================
        // LOGS
        // =========================

        console.log(
            chalk.gray('['),
            chalk.green(command),
            chalk.gray(']'),
            chalk.cyan(
                m.pushName || 'Sin nombre'
            )
        )

        // =========================
        // PLUGINS
        // =========================

        for (let name in global.plugins) {

            let plugin =
                global.plugins[name]

            if (!plugin) continue
            if (plugin.disabled) continue

            let isAccept =

                Array.isArray(plugin.command)

                    ? plugin.command.includes(command)

                    : plugin.command === command

            if (!isAccept) continue

            // =========================
            // MODO ADMIN
            // =========================

            if (
                chat.modoadmin &&
                m.isGroup
            ) {

                if (!isAdmin && !isOwner) {

                    return m.reply(
                        '❌ El modo admin está activado'
                    )
                }
            }

            try {

                await plugin.call(
                    this,
                    m,
                    {
                        conn: this,
                        usedPrefix,
                        noPrefix,
                        args,
                        command,
                        text: args.join(' '),

                        isOwner,
                        isAdmin,
                        isBotAdmin,

                        user,
                        chat
                    }
                )

            } catch (e) {

                console.log(
                    chalk.redBright(
                        `❌ Error en plugin ${name}`
                    )
                )

                console.error(e)
            }

            break
        }

    } catch (e) {

        console.error(
            chalk.red(
                format(e)
            )
        )
    }
}

export {
    handler
}
