import os from 'os'

let handler = async (m, { conn }) => {
    // Captura el tiempo inicial en milisegundos
    const startTime = Date.now()

    const uptime = process.uptime()

    const formatUptime = (seconds) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor(seconds % 60)
        return `${h}h ${m}m ${s}s`
    }

    const usedRam = (
        process.memoryUsage().heapUsed / 1024 / 1024
    ).toFixed(2)

    const totalRam = (
        os.totalmem() / 1024 / 1024 / 1024
    ).toFixed(2)

    const cpu = os.cpus()[0]?.model || 'Desconocido'
    
    // Calcula la diferencia exacta de ejecución
    const speed = Date.now() - startTime

    let text = `🏰 *﹝ EMPIRE - PING & STATUS ﹞* 🏰\n──────────────────────────────\n\n` +
               `🏓 *¡PONG!* \n\n` +
               `⚡ *Velocidad:* ${speed} ms\n` +
               `⏱️ *Activo:* ${formatUptime(uptime)}\n` +
               `📉 *RAM en uso:* ${usedRam} MB\n` +
               `🎛️ *RAM Total:* ${totalRam} GB\n` +
               `💻 *Procesador:* ${cpu}\n\n` +
               `📊 *Estado:* En línea ✅`

    await conn.sendMessage(
        m.chat,
        { text },
        { quoted: m }
    )
}

handler.command = ['ping', 'velocidad', 'status']

export default handler
