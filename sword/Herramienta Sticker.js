// * 👤 CREADOR: El tío Judai
// * 🏰 COMPONENTE: Convertidor de Stickers Animados Pro - Crossbow Core
// * 🌐 REPOSITORIO: https://github.com/judai503/Empire-wa-bot

import { Sticker } from 'wa-sticker-formatter'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

const dirCrossbow = path.join(process.cwd(), 'crossbow')
if (!fs.existsSync(dirCrossbow)) {
    fs.mkdirSync(dirCrossbow, { recursive: true })
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const db = global.db.data
    const user = db.users[m.sender] || {}
    const nameUser = user.name || m.sender.split('@')[0]
    const meta1 = user.metadatos ? String(user.metadatos).trim() : 'Empire Bot 🧠'
    const meta2 = user.metadatos ? (user.metadatos2 ? String(user.metadatos2).trim() : '') : `@${nameUser}`

    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        if (!mime && m.quoted && m.quoted.message) {
            const tipoMensaje = Object.keys(m.quoted.message)[0]
            if (m.quoted.message[tipoMensaje]) {
                mime = m.quoted.message[tipoMensaje].mimetype || ''
            }
        }

        let mtype = q.mtype || ''
        if (!mime && /image|video/.test(mtype)) {
            mime = mtype.includes('image') ? 'image/jpeg' : 'video/mp4'
        }

        if (/image|video|gif/.test(mime)) {
            if (/video/.test(mime) && (q.msg || q).seconds > 10) {
                return conn.sendMessage(m.chat, { text: '⚠️ El video animado no debe durar más de 10 segundos.' }, { quoted: m })
            }

            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
            
            let imgBuffer = await downloadMediaMessage(q, 'buffer', {}, { logger: console }).catch(() => null)
            if (!imgBuffer) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(m.chat, { text: '❌ No se pudo descargar el archivo multimedia.' }, { quoted: m })
            }

            let stickerBuffer

            if (/video|gif/.test(mime)) {
                const nombreTemporal = `vid_${Date.now()}`
                const rutaVideoInput = path.join(dirCrossbow, `${nombreTemporal}.mp4`)
                const rutaWebpOutput = path.join(dirCrossbow, `${nombreTemporal}.webp`)

                fs.writeFileSync(rutaVideoInput, imgBuffer)

                // COMPRESIÓN AGRESIVA PARA STICKER ANIMADO ESTÁNDAR (Filtro escalado 512x512 y fps controlados)
                await execPromise(`ffmpeg -i "${rutaVideoInput}" -vcodec libwebp -filter_complex "[0:v] scale=320:320:force_original_aspect_ratio=decrease,fps=12,pad=320:320:(320-iw)/2:(320-ih)/2:color=#00000000" -loop 0 -preset default -an -vsync 0 -s 320x320 "${rutaWebpOutput}"`)

                if (!fs.existsSync(rutaWebpOutput)) {
                    throw new Error('FFmpeg no pudo compilar el formato animado en crossbow.')
                }

                let webpBuffer = fs.readFileSync(rutaWebpOutput)
                
                // Inyectar los metadatos sin alterar el renderizado de la animación
                const stickerProcesado = new Sticker(webpBuffer, {
                    pack: meta1,
                    author: meta2,
                    type: 'raw' // Evita que la librería intente redimensionar lo que ffmpeg ya estructuró
                })
                
                stickerBuffer = await stickerProcesado.toBuffer()

                // Dejar un retraso prudente de 8 segundos antes de borrar los archivos locales
                setTimeout(() => {
                    try {
                        if (fs.existsSync(rutaVideoInput)) fs.unlinkSync(rutaVideoInput)
                        if (fs.existsSync(rutaWebpOutput)) fs.unlinkSync(rutaWebpOutput)
                    } catch (err) {}
                }, 8000)

            } else {
                // Procesamiento limpio para imágenes fijas
                const stickerProcesado = new Sticker(imgBuffer, {
                    pack: meta1,
                    author: meta2,
                    type: 'full',
                    quality: 65
                })
                stickerBuffer = await stickerProcesado.toBuffer()
            }

            // ENVIAR FORZANDO EL FORMATO DE STICKER MMD NATIVO
            await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m, mimetype: 'image/webp' })
            return await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
        } 
        
        else if (args[0] && /https?:\/\//.test(args[0])) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
            const stickerProcesado = new Sticker(args[0], { pack: meta1, author: meta2, type: 'full' })
            let stickerBuffer = await stickerProcesado.toBuffer()
            await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m, mimetype: 'image/webp' })
            return await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
        }

        return conn.sendMessage(m.chat, { 
            text: `⚠️ *Responde a una imagen, video o GIF con el comando:* \n*${usedPrefix + command}*` 
        }, { quoted: m })

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        console.error('Error Crítico en Sticker Crossbow:', e)
        return conn.sendMessage(m.chat, { text: `❌ Error en el render de animación: ${e.message}` }, { quoted: m })
    }
}

handler.help = ['s', 'sticker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler
