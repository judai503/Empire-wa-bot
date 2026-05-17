// * 📂 COMANDO: Uchiha Spotify Downloader
// * 📝 DESCRIPCIÓN: Extractor de audio de Spotify (Búsqueda + Descarga).
// * 👤 CREADOR: Barboza Developer
// * ⚡ CANAL: Barboza Developer x Zona Developers
// * 🏰 ADAPTACIÓN: El tío Judai (Empire Bot Core)

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Créditos obligatorios del creador original
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"
    
    if (!text) {
        return conn.sendMessage(m.chat, { 
            text: `🎵 *﹝ EMPIRE - SPOTIFY ﹞* 🎵\n──────────────────────────────\n\n⚠️ *Por favor, ingresa el nombre de una canción o un enlace de Spotify.*\n\n💡 *Ejemplo:* ${usedPrefix + command} Mask Off` 
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    try {
        // Desencriptación nativa de la API oficial de Barboza
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpointBase = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn")
        const apiKey = b("c2FzdWtl")

        let trackUrl = text
        const isUrl = text.match(/^(https?:\/\/)?(open\.spotify\.com|spotify\.link)\/.+$/gi)

        // 1. SI ES TEXTO, HACEMOS LA BÚSQUEDA PRIMERO
        if (!isUrl) {
            const searchApi = `${endpointBase}/search/spotify?query=${encodeURIComponent(text)}&key=${apiKey}`
            const sRes = await axios.get(searchApi)
            const sData = sRes.data

            if (!sData.status || !sData.result || !sData.result.length) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(m.chat, { text: '🏮 *[ ERROR ]* No se encontró ninguna canción con ese nombre.' }, { quoted: m })
            }
            trackUrl = sData.result[0].link
        }

        // 2. HACEMOS LA DESCARGA DIRECTA DE LA PISTA
        const downloadApi = `${endpointBase}/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${apiKey}`
        const dlRes = await axios.get(downloadApi)
        const dlData = dlRes.data

        if (!dlData.status || !dlData.data) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return conn.sendMessage(m.chat, { text: '🏮 *[ FALLO ]* Error interno al intentar extraer el audio de Spotify.' }, { quoted: m })
        }

        const info = dlData.data

        // Estructura visual premium al estilo Empire Bot manteniendo créditos intactos
        let txt = `🎵 *﹝ EMPIRE SPOTIFY ﹞* 🎵\n──────────────────────────────\n\n`
        txt += `📌 *Tɪ́ᴛᴜʟᴏ:* ${info.name || 'Desconocido'}\n`
        txt += `👤 *Aʀᴛɪsᴛᴀ:* ${info.artist || 'Desconocido'}\n`
        txt += `💿 *Áʟʙᴜμ:* ${info.album || 'Desconocido'}\n`
        txt += `⏱️ *Dᴜʀᴀᴄɪᴏ́ɴ:* ${info.duration || '--:--'}\n\n`
        txt += `⚙️ *Esᴛᴀᴅᴏ:* 🟢 Audio Inyectado con Éxito\n`
        txt += `──────────────────────────────\n`
        txt += `⚡ *${dev}* \n`
        txt += `📡 *${chn}*`

        // Enviar portada HD de la canción
        await conn.sendMessage(m.chat, { 
            image: { url: info.imageHD || info.image }, 
            caption: txt 
        }, { quoted: m })

        // Enviar el archivo de audio nativo .mp3
        await conn.sendMessage(m.chat, { 
            audio: { url: info.url }, 
            mimetype: 'audio/mpeg', 
            fileName: `${info.name}.mp3` 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })

    } catch (e) {
        console.error('Error en Spotify Plugin:', e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.sendMessage(m.chat, { text: `❌ *Fallo de conexión con la API:* ${e.message}` }, { quoted: m })
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = ['spotify', 'sp', 'music', 'spt']

export default handler
