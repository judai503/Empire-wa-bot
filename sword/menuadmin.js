let handler = async (m, { conn, usedPrefix }) => {
    let menu = `🏰 *﹝ EMPIRE - PANEL DE ADMINISTRACIÓN ﹞* 🏰
──────────────────────────────
👑 *Gestión exclusiva para Admins del Grupo*
⚙️ *Configuraciones independientes por Chat*
──────────────────────────────

📢 *[ CONFIGURACIÓN DE BIENVENIDAS ]*
» \`${usedPrefix}welcome <on/off>\`
  ➜ Activa o desactiva los saludos automáticos al ingresar.

» \`${usedPrefix}welcometype <custom/description>\`
  ➜ Define qué se mostrará en el saludo:
     • \`custom\`: Usa tu propio texto personalizado.
     • \`description\`: Usa la descripción actual del grupo de WhatsApp.

» \`${usedPrefix}setwelcome <texto>\`
  ➜ Cambia el texto del saludo (Solo si welcometype está en custom).

🛡️ *[ SEGURIDAD Y CONTROL ]*
» \`${usedPrefix}modoadmin <on/off>\`
  ➜ Si se activa, el bot solo responderá a los administradores.

» \`${usedPrefix}antilink <on/off>\`
  ➜ Activa el sistema que elimina enlaces no autorizados.

👑 *[ GESTIÓN DE PODERES Y USUARIOS ]*
» \`${usedPrefix}darpoder @user\`
  ➜ Otorga rango de Administrador a un miembro del grupo.

» \`${usedPrefix}quitarpoder @user\`
  ➜ Remueve el rango de Administrador y lo vuelve usuario común.

» \`${usedPrefix}kick @user\`
  ➜ Expulsa a un participante de forma inmediata.

» \`${usedPrefix}warn @user\`
  ➜ Suma una advertencia al usuario (Al llegar a 3 es eliminado).

» \`${usedPrefix}unwarn @user\`
  ➜ Le quita una advertencia al usuario seleccionado.

──────────────────────────────
📊 *EMPIRE SYSTEM V3.0 • Control y Gestión.*`;

    await conn.sendMessage(m.chat, { text: menu }, { quoted: m });
};

handler.command = ['menuadmin', 'adminpanel', 'admin', 'panel'];
handler.group = true;
handler.admin = true;

export default handler;
