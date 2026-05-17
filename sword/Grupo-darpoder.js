let handler = async (m, { conn, text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : '';
    if (!who) return m.reply('🛡️ *[ EMPIRE - MODERACIÓN ]* 🛡️\n\n⚠️ Etiqueta o responde al mensaje de la persona a la que deseas darle poder.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
        m.reply(`👑 *[ EMPIRE - ASCENSO ]* 👑\n──────────────────────────────\n\n✅ *¡Poder otorgado con éxito!*\n👤 *Usuario:* @${who.split('@')[0]}\n\n🌟 Ahora cuenta con el rango de *Administrador* en este chat.`, null, { mentions: [who] });
    } catch (e) {
        m.reply('🛡️ *[ EMPIRE - ERROR ]* 🛡️\n\n❌ No se pudo ejecutar la acción. Asegúrate de que el bot sea Administrador.');
    }
};

handler.command = ['darpoder', 'promote'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
