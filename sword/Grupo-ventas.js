
// sword/Grupo-stock.js
import fs from 'fs'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, command, usedPrefix }) => {
    const dbPath = './stock_db.json'
    const chat = m.chat

    // =========================
    // BASE DE DATOS Y CARPETAS
    // =========================
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}))
    if (!fs.existsSync('./stock')) fs.mkdirSync('./stock')

    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    if (!db[chat]) db[chat] = {}

    const allowed = ['pago', 'diamantes', 'pp', 'roblox', 'pavos', 'precios']

    // =========================
    // DETERMINAR TIPO (SET / DEL)
    // =========================
    let type = null
    if (command.startsWith('set')) {
        type = command.replace('set', '')
    } else if (command.startsWith('del')) {
        type = command.replace('del', '')
    } else {
        type = command
    }

    // VALIDACIÓN DE NOMBRES
    if (type && !allowed.includes(type) && command !== 'stocklist') {
        return conn.sendMessage(chat, { 
            text: `❌ *NOMBRE NO PERMITIDO*\n\n📦 *Permitidos:*\n${allowed.map(v => `• ${v}`).join('\n')}` 
        }, { quoted: m })
    }

    // =========================
    // VER STOCK (COMANDO DIRECTO)
    // =========================
    if (allowed.includes(command)) {
        const info = db[chat]?.[type]
        const img = `./stock/${chat}_${type}.jpg`

        if (info === undefined && !fs.existsSync(img)) {
            return conn.sendMessage(chat, { text: '❌ Este stock no tiene información registrada.' }, { quoted: m })
        }

        if (fs.existsSync(img)) {
            return await conn.sendMessage(chat, {
                image: fs.readFileSync(img),
                caption: info || ''
            }, { quoted: m })
        }

        return conn.sendMessage(chat, { text: info }, { quoted: m })
    }

    // =========================
    // CONFIGURAR STOCK (SET)
    // =========================
    if (command.startsWith('set')) {
        // Validación de Admin (Usando la lógica de tu otro comando)
        let groupMetadata = await conn.groupMetadata(chat)
        let admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id)
        if (!admins.includes(m.sender)) {
            return conn.sendMessage(chat, { text: '❌ SOLO ADMINS.' }, { quoted: m })
        }

        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        let textToSave = args.join(' ') || (m.quoted ? (m.quoted.text || m.quoted.caption) : (m.caption || ''))

        // GUARDAR IMAGEN
        if (/image/.test(mime)) {
            const stream = await downloadContentFromMessage(q.msg || q, 'image')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            fs.writeFileSync(`./stock/${chat}_${type}.jpg`, buffer)
        }

        db[chat][type] = textToSave.trim()
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

        return conn.sendMessage(chat, { 
            text: `✅ *STOCK ACTUALIZADO*\n\n📦 *Tipo:* ${type}\n✨ *Estado:* Guardado con éxito.` 
        }, { quoted: m })
    }

    // =========================
    // ELIMINAR STOCK (DEL)
    // =========================
    if (command.startsWith('del')) {
        let groupMetadata = await conn.groupMetadata(chat)
        let admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id)
        if (!admins.includes(m.sender)) {
            return conn.sendMessage(chat, { text: '❌ SOLO ADMINS.' }, { quoted: m })
        }

        delete db[chat][type]
        const img = `./stock/${chat}_${type}.jpg`
        if (fs.existsSync(img)) fs.unlinkSync(img)

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

        return conn.sendMessage(chat, { 
            text: `🗑️ *STOCK ELIMINADO*\n\n📦 *Tipo:* ${type}` 
        }, { quoted: m })
    }

    // =========================
    // LISTA DE STOCKS
    // =========================
    if (command === 'stocklist') {
        let text = `📦 *LISTA DE STOCKS ACTUALES*\n━━━━━━━━━━━━━━\n\n`
        for (const k of allowed) {
            const exist = db[chat]?.[k] !== undefined || fs.existsSync(`./stock/${chat}_${k}.jpg`)
            text += `${exist ? '✅' : '❌'} *${k}*\n`
        }
        text += `\n_Usa .set[nombre] para actualizar_`
        return conn.sendMessage(chat, { text: text }, { quoted: m })
    }
}

handler.command = [
    'pago', 'diamantes', 'pp', 'roblox', 'pavos', 'precios',
    'setpago', 'setdiamantes', 'setpp', 'setroblox', 'setpavos', 'setprecios',
    'delpago', 'deldiamantes', 'delpp', 'delroblox', 'delpavos', 'delprecios',
    'stocklist'
]
handler.group = true

export default handler
