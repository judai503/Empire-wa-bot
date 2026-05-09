import os from 'os'

let handler = async (m, { conn }) => {

const speed = Date.now() - global.timestamp.start

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

const cpu = os.cpus()[0].model

let text = `

🏓 PONG!

➜ Velocidad:
${speed} ms

➜ Uptime:
${formatUptime(uptime)}

➜ RAM usada:
${usedRam} MB

➜ RAM total:
${totalRam} GB

➜ CPU:
${cpu}

➜ Estado:
Online ✅
`

await conn.sendMessage(
    m.chat,
    {
        text
    },
    { quoted: m }
)

}

handler.command = ['ping']

export default handler
