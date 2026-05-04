import { smsg } from './engine/simple.js'
import { format } from 'util'
import chalk from 'chalk'

export async function handler(chatUpdate) {
    if (!chatUpdate) return
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return

        // --- SISTEMA DE USUARIOS ---
        let user = global.db.data.users[m.sender]
        if (typeof user !== 'object') global.db.data.users[m.sender] = {}
        if (user) {
            if (typeof user.monedas !== 'number') user.monedas = 10
        } else {
            global.db.data.users[m.sender] = { monedas: 10, name: m.name }
        }

        const isOwner = [global.owner[0][0]].map(v => v.replace(/[^0-9]/g, "") + '@s.whatsapp.net').includes(m.sender) || m.fromMe
        
        // --- BUSCADOR EN SWORD ---
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            
            let _prefix = global.prefix
            let match = (_prefix.exec(m.body))
            
            if (match) {
                let usedPrefix = match[0]
                let noPrefix = m.body.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                command = (command || '').toLowerCase()
                
                let isAccept = Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command

                if (isAccept) {
                    await plugin.call(this, m, { conn: this, usedPrefix, noPrefix, args, command, text: args.join(' '), isOwner })
                    break
                }
            }
        }
    } catch (e) {
        console.error(chalk.red(format(e)))
    }
}
