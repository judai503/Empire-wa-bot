let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`📢 *[ EMPIRE - BIENVENIDAS ]* 📢\n\n⚠️ Ingresa el texto de saludo.\n\n*Ejemplo:* \n${usedPrefix + command} ¡Bienvenidos a la comunidad de Empire! Pásenla genial.`);
    
    let chat = global.db.data.chats[m.chat];
    chat.sWelcome = text;
    
    m.reply(`🏰 *[ EMPIRE - CONFIGURACIÓN ]* 🏰\n──────────────────────────────\n\n✅ *Texto de bienvenida guardado con éxito.*\n\n📝 *Mensaje establecido:* ${text}`);
};

handler.command = ['setwelcome', 'configbienvenida'];
handler.group = true;
handler.admin = true;

export default handler;
