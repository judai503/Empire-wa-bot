let handler = async (m, { text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : '';
    if (!who) return m.reply('🛡️ *[ EMPIRE - MODERACIÓN ]* 🛡️\n\n⚠️ Etiqueta o responde al mensaje de quien deseas perdonar.');

    let user = global.db.data.users[who];
    if (!user || !user.warn || user.warn === 0) {
        return m.reply(`🛡️ *[ EMPIRE - INFRAESTRUCTURA ]* 🛡️\n\n✅ El usuario *@${who.split('@')[0]}* se encuentra limpio de advertencias en este chat.`, null, { mentions: [who] });
    }

    user.warn -= 1;
    m.reply(`😇 *[ EMPIRE - PERDÓN ]* 😇\n──────────────────────────────\n\n✅ *Advertencia removida del historial.*\n👤 *Usuario:* @${who.split('@')[0]}\n📊 *Historial actual:* [ ${user.warn} / 3 ]`, null, { mentions: [who] });
};

handler.command = ['unwarn', 'quitarwarn'];
handler.group = true;
handler.admin = true;

export default handler;
