// * 👤 CREADOR: Barboza Developer
 //* ⚡ CANAL: Barboza Developer x Zona Developers
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

        if (!search.data.status || !search.data.result.length) {
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
        }

        let track = search.data.result[0]
        // CORRECCIÓN: Se usan backticks `` y el signo $ para la variable
        let trackUrl = `https://open.spotify.com/track/${track.id}`

        // 2. DESCARGA
        let dl = await axios.get(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${key}`)

        if (!dl.data.status) {
            return conn.reply(m.chat, '❌ Error al obtener el enlace de descarga.', m)
        }

        let data = dl.data.data
        let txt = `✨ *SPOTIFY DOWNLOAD*\n\n` +
                  `➜ *Título:* ${data.name}\n` +
                  `➜ *Artista:* ${data.artist}\n` +
                  `➜ *Álbum:* ${data.album}\n` +
                  `➜ *Duración:* ${data.duration}\n\n` +
                  `_Enviando audio, espera un momento..._`

        // Enviar imagen con información
        await conn.sendMessage(m.chat, {
            image: { url: data.imageHD || data.image },
            caption: txt
        }, { quoted: m })

        // Enviar el archivo de audio
        await conn.sendMessage(m.chat, {
            audio: { url: data.url },
            mimetype: 'audio/mpeg',
            fileName: `${data.name}.mp3`
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        // Manejo de error seguro
        if (conn && m.chat) {
            conn.reply(m.chat, '❌ Ocurrió un error inesperado. Verifica la consola.', m)
        }
    }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = ['spotify', 'spotdl', 'spotifydl']

export default handler
