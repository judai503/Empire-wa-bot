let handler = async (m, { conn, text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : '';
    if (!who) return m.reply('🛡️ *[ EMPIRE - MODERACIÓN ]* 🛡️\n\n⚠️ Etiqueta o responde al mensaje de la persona a la que deseas quitarle el poder.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
        m.reply(`💥 *[ EMPIRE - DEGRADACIÓN ]* 💥\n──────────────────────────────\n\n⚠️ *¡Poder removido del usuario!*\n👤 *Usuario:* @${who.split('@')[0]}\n\n📉 Ha sido removido del staff y vuelve a ser un miembro común.`, null, { mentions: [who] });
    } catch (e) {
        m.reply('🛡️ *[ EMPIRE - ERROR ]* 🛡️\n\n❌ No se pudo ejecutar la acción.');
    }
};

handler.command = ['quitarpoder', 'demote'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
