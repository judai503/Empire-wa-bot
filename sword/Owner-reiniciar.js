// * 👤 CREADOR: El tío Judai
// * 🏰 COMPONENTE: Forzar Reinicio del Sistema EMPIRE

let handler = async (m, { conn }) => {
    await conn.sendMessage(m.chat, { 
        text: `🏰 *﹝ EMPIRE - SISTEMA ﹞* 🏰\n──────────────────────────────\n\n🔄 *Apagando módulos principales y reiniciando el núcleo...*\n\n⏱️ Regreso en unos segundos, por favor espera...` 
    }, { quoted: m })
    
    // Espera 1.5 segundos para asegurar que el mensaje de WhatsApp se envíe antes de apagar
    setTimeout(() => {
        process.exit(0)
    }, 1500)
}

handler.help = ['restart', 'reiniciar']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar', 'reboot']

// Restricción para que solo tú puedas apagar el servidor
handler.rowner = true 

export default handler
