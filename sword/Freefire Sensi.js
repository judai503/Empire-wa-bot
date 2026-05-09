import fs from 'fs'
import path from 'path'

const cooldown = new Map()

let handler = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat
    const now = Date.now()
    const cdTime = 15 * 1000 // 15 segundos de cooldown

    // ⏳ VERIFICACIÓN DE COOLDOWN PERSONALIZADA
    if (cooldown.has(chat)) {
        const last = cooldown.get(chat)
        const remaining = cdTime - (now - last)
        if (remaining > 0) {
            // Mensaje personalizado: "Espera tu turno (faltan X segundos)"
            return conn.reply(m.chat, `⚠️ Espera tu turno (faltan ${Math.ceil(remaining / 1000)} segundos)`, m)
        }
    }

    cooldown.set(chat, now)
    setTimeout(() => cooldown.delete(chat), cdTime)

    // NUEVA RUTA ACTUALIZADA SEGÚN TU GITHUB
    const folder = './freefire/Sensi'

    if (!fs.existsSync(folder)) {
        // Si no existe, intenta crearla para evitar errores
        fs.mkdirSync(folder, { recursive: true })
        return conn.reply(m.chat, '❌ La carpeta "freefire/Sensi" no existe o está vacía.', m)
    }

    const files = fs.readdirSync(folder).filter(file =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
    )

    if (files.length === 0) {
        return conn.reply(m.chat, '❌ No se encontraron imágenes en la ruta freefire/Sensi.', m)
    }

    const randomFile = files[Math.floor(Math.random() * files.length)]
    const filePath = path.join(folder, randomFile)

    // FRASES TÓXICAS PARA EL COMANDO
    const frases = [
        '🔥 Acá tu sensi manco, a ver si así dejas de dar pena.',
        '😹 Naco, usa esto y deja de pegar puro amarillo.',
        '💀 A ver si ahora sí das una, que pareces bot de Garena.',
        '🎯 Esta es la buena… pero con esos dedos de cartón no creo.',
        '🤡 Usa esto y deja de fallar, que el aire no te hizo nada.',
        '👀 Con esta ni excuses tienes, el manco eres tú, no el internet.',
        '⚰️ Último intento antes de que borres el juego por malo.',
        '🧠 Configuración de pro… lástima que la usa un principiante.',
        '🐢 Para que dejes de jugar como tortuga con reumatismo.',
        '🔥 Sensi bendecida… no la desperdicies.',
        '☀️ Tiras puro amarillo, pareces sol de kinder.',
        '✈️ Tiras la mira tan alto que vas a bajar un avión.',
        '🧲 Tu mira tiene imán para el suelo, ¡súbela naco!',
        '🤢 Juegas como si el celular te diera toques eléctricos.',
        '💩 Pegas tan poco que el enemigo se cura mientras le disparas.',
        '📉 Tienes el DPI en negativo, pareces una piedra.',
        '🥱 Hasta los bots se salen del grupo cuando te ven entrar.',
        '🧟 Te mueves con menos gracia que un zombie de entrenamiento.',
        '🤦‍♂️ El único rojo que das es el de la batería baja.',
        '🎭 Eres como un sartén: solo sirves para que te peguen por atrás.'
    ]

    const fraseRandom = frases[Math.floor(Math.random() * frases.length)]

    await conn.sendMessage(m.chat, {
        image: fs.readFileSync(filePath),
        caption: fraseRandom
    }, { quoted: m })
}

handler.help = ['sensi']
handler.tags = ['entretenimiento']
handler.command = ['sensi', 'sensibilidad', 'config', 'manco']
handler.group = true 

export default handler
