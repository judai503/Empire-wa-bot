let handler = async (m, { chat, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`📢 *[ EMPIRE - BIENVENIDAS ]* 📢\n\n⚠️ *Uso correcto:* \`${usedPrefix + command} custom\` o \`${usedPrefix + command} description\``);
    
    let type = args[0].toLowerCase();
    if (type === 'description' || type === 'desc') {
        chat.welcomeType = 'description';
        m.reply('🏰 *[ EMPIRE - AJUSTES ]* 🏰\n──────────────────────────────\n\n✅ *Configuración Guardada:* Ahora los nuevos miembros recibirán de forma automática la *Descripción del Grupo* como saludo inicial.');
    } else if (type === 'custom' || type === 'texto') {
        chat.welcomeType = 'custom';
        m.reply('🏰 *[ EMPIRE - AJUSTES ]* 🏰\n──────────────────────────────\n\n✅ *Configuración Guardada:* Ahora el bot utilizará el *Texto Personalizado* configurado mediante el comando \`.setwelcome\`.');
    } else {
        m.reply(`🛡️ *[ EMPIRE - ALERTA ]* 🛡️\n\n❌ Opción inválida. Usa \`${usedPrefix + command} custom\` o \`${usedPrefix + command} description\``);
    }
};

handler.command = ['welcometype'];
handler.group = true;
handler.admin = true;

export default handler;
