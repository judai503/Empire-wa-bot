// * 👤 CREADOR: Barboza Developer
// * ⚡ CANAL: Barboza Developer x Zona Developers
// adaptado por el tio judai

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definimos query y verificamos si hay texto
    let query = text || (m.quoted && (m.quoted.text || m.quoted.caption))
    
    if (!query) {
        return conn.reply(m.chat, `✨ *INGRESA EL NOMBRE DE UNA CANCIÓN*\n\n➜ Ejemplo:\n${usedPrefix + command} Provenza`, m)
    }

    try {
        // Clave de API (Reverse de tu lógica original)
        const _0x4a1b = 'ZWt1c2Fz'
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        // 1. BÚSQUEDA EN SPOTIFY
        let search = await axios.get(`https://api.evogb.org/search/spotify?query=${encodeURIComponent(query)}&key=${key}`)

        if (!search.data.status || !search.data.result || !search.data.result.length) {
            return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda.', m)
        }

        let track = search.data.result[0]
        
        // CORRECCIÓN PERMANENTE: Construcción correcta del enlace real de Spotify usando el ID devuelto
        let trackUrl = `https://open.spotify.com/track/${track.id}`

        // 2. DESCARGA
        let dl = await axios.get(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${key}`)

        if (!dl.data.status || !dl.data.data) {
            return conn.reply(m.chat, '❌ Error de la API al procesar el enlace de descarga.', m)
        }

        let data = dl.data.data
        let txt = `🏰 *﹝ EMPIRE - SPOTIFY DOWNLOAD ﹞* 🏰\n──────────────────────────────\n\n` +
                  `🎵 *Título:* ${data.name || 'Desconocido'}\n` +
                  `👤 *Artista:* ${data.artist || 'Desconocido'}\n` +
                  `💿 *Álbum:* ${data.album || 'Desconocido'}\n` +
                  `⏱️ *Duración:* ${data.duration || 'Desconocida'}\n\n` +
                  `*📥 Enviando el audio, por favor espera...*`

        // Validar que exista una portada válida antes de mandar
        let coverUrl = data.imageHD || data.image || track.image || 'https://raw.githubusercontent.com/wandersonsc01/spotify-downloader/main/assets/icon.png'

        // Enviar imagen con información
        await conn.sendMessage(m.chat, {
            image: { url: coverUrl },
            caption: txt
        }, { quoted: m })

        // Enviar el archivo de audio
        await conn.sendMessage(m.chat, {
            audio: { url: data.url },
            mimetype: 'audio/mpeg',
            fileName: `${data.name || 'audio'}.mp3`
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        if (conn && m.chat) {
            conn.reply(m.chat, '❌ Ocurrió un error inesperado al procesar la descarga de Spotify.', m)
        }
    }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = ['spotify', 'spotdl', 'spotifydl']

export default handler
