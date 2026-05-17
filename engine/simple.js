export function smsg(conn, m) {
    if (!m) return m
    
    // Serializar ID del mensaje
    m.id = m.key.id
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat.endsWith('@g.us')
    
    // Determinar remitente de forma segura
    m.sender = conn.decodeJid ? conn.decodeJid(m.key.participant || m.key.remoteJid) : (m.key.participant || m.key.remoteJid)
    
    // Identificar si el mensaje proviene de un Bot o del mismo Baileys (Evita bucles)
    m.isBaileys = m.id.startsWith('BAE5') || m.id.startsWith('NJX-') || m.id.length === 16

    // Extraer el cuerpo del texto de cualquier tipo de mensaje
    m.body = m.message?.conversation || 
             m.message?.extendedTextMessage?.text || 
             m.message?.imageMessage?.caption || 
             m.message?.videoMessage?.caption || 
             m.message?.buttonsResponseMessage?.selectedButtonId || 
             m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || 
             m.message?.templateButtonReplyMessage?.selectedId || 
             ''

    m.text = m.body // Tu handler usa m.text en varias validaciones de strings
    m.name = m.pushName || 'Usuario'

    // ==========================================
    // SERIALIZACIÓN DE MENSAJES CITADOS (QUOTED)
    // ==========================================
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (quoted) {
        m.quoted = {}
        m.quoted.message = quoted
        m.quoted.id = m.message.extendedTextMessage.contextInfo.stanzaId
        m.quoted.chat = m.message.extendedTextMessage.contextInfo.remoteJid || m.chat
        m.quoted.fromMe = m.message.extendedTextMessage.contextInfo.participant === conn.user?.jid
        m.quoted.sender = conn.decodeJid ? conn.decodeJid(m.message.extendedTextMessage.contextInfo.participant) : m.message.extendedTextMessage.contextInfo.participant
        
        // Extraer texto del mensaje citado
        m.quoted.text = quoted.conversation || 
                        quoted.extendedTextMessage?.text || 
                        quoted.imageMessage?.caption || 
                        quoted.videoMessage?.caption || 
                        ''
        
        // Función rápida para responder directamente al mensaje citado
        m.quoted.reply = (text) => conn.sendMessage(m.chat, { text: text }, { quoted: m })
    } else {
        m.quoted = null
    }

    // Función nativa simplificada para responder al mensaje actual
    m.reply = (text) => conn.sendMessage(m.chat, { text: text }, { quoted: m })

    return m
}
