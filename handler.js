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

            global.db.data.users[m.sender] = {

                monedas: 10,

                name:
                    m.name ||
                    'Sin nombre'
            }
        }

        // =========================
        // CHAT
        // =========================

        if (!global.db.data.chats[m.chat]) {

            global.db.data.chats[m.chat] = {

                welcome: false,
                modoadmin: false,
                antilink: false,
                antillamada: false,
                antispam: false,
                antiprivado: false,
                antionceview: false
            }
        }

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
                            isOwner
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

            let chat =
                global.db.data.chats[m.chat]

            if (
                chat.modoadmin &&
                m.isGroup
            ) {

                let groupMetadata =
                    await this.groupMetadata(
                        m.chat
                    )

                let admins =
                    groupMetadata.participants
                        .filter(v => v.admin)
                        .map(v => v.id)

                let isAdmin =
                    admins.includes(m.sender)

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
                        isOwner
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
