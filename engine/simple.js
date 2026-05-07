export function smsg(conn, m) {

    if (!m) return m

    m.chat = m.key.remoteJid

    m.fromMe = m.key.fromMe

    m.sender =
        m.key.participant ||
        m.key.remoteJid

    m.isGroup =
        m.chat.endsWith('@g.us')

    m.body =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        ''

    m.name = m.pushName || 'Sin nombre'

    return m
}
