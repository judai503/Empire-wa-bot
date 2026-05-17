let handler = async (m, { conn, text }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : '';
    if (!who) return m.reply('🛡️ *[ EMPIRE - MODERACIÓN ]* 🛡️\n\n⚠️ Etiqueta o responde al mensaje de un usuario para advertirlo.');

    let user = global.db.data.users[who];
    if (!user) {
        global.db.data.users[who] = { warn: 0 };
        user = global.db.data.users[who];
    }

    user.warn += 1;

    if (user.warn >= 3) {
        user.warn = 0; 
        m.reply(`🚨 *[ EMPIRE - SANCIÓN MÁXIMA ]* 🚨\n──────────────────────────────\n\n🛑 El usuario *@${who.split('@')[0]}* acumuló *3/3 advertencias* y procederá a ser eliminado del grupo inmediatamente.`, null, { mentions: [who] });
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove').catch(() => {
            m.reply('🛡️ *[ EMPIRE - ERROR ]* 🛡️\n\n❌ No pude eliminar al usuario porque no soy Administrador.');
        });
    } else {
        m.reply(`⚠️ *[ EMPIRE - ADVERTENCIA ]* ⚠️\n──────────────────────────────\n\n👤 *Usuario:* @${who.split('@')[0]}\n📊 *Historial:* [ ${user.warn} / 3 ]\n\n📢 Por favor, sigue las normas del grupo para evitar ser removido automáticamente.`, null, { mentions: [who] });
    }
};

handler.command = ['warn', 'advertir'];
handler.group = true;
handler.admin = true;

export default handler;
