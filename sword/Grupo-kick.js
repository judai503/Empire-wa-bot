let handler = async (m, { conn, text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : '';
    if (!who) return m.reply('🛡️ *[ EMPIRE - MODERACIÓN ]* 🛡️\n\n⚠️ Etiqueta o responde al mensaje de quien deseas eliminar.');
    if (who === conn.user.id) return m.reply('🛡️ *[ EMPIRE - ALERTA ]* 🛡️\n\n❌ No puedo eliminarme a mí mismo del grupo.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        m.reply(`🚀 *[ EMPIRE - EXPULSIÓN ]* 🚀\n──────────────────────────────\n\n💥 El usuario *@${who.split('@')[0]}* ha sido removido con éxito del grupo por desacato a las reglas.`, null, { mentions: [who] });
    } catch (e) {
        m.reply('🛡️ *[ EMPIRE - ERROR ]* 🛡️\n\n❌ Error al intentar eliminar al usuario.');
    }
};

handler.command = ['kick', 'sacar', 'eliminar'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
