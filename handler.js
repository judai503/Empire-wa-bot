// handler.js
import { smsg } from './engine/simple.js'; 
import { format } from 'util';
import chalk from 'chalk';
import fs from 'fs';
import { jidNormalizedUser } from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isNumber = x => typeof x === 'number' && !isNaN(x);

const handler = async function (chatUpdate) {
    if (!chatUpdate) return;
    this.msgqueque = this.msgqueque || [];
    
    let m = chatUpdate.messages?.[0];
    if (!m) return;

    try {
        m = smsg(this, m) || m
        if (!m) return;
        if (m.isBaileys) return; 

        // ==========================================
        // AUTO-INICIALIZACIÓN DE BASE DE DATOS
        // ==========================================
        global.db = global.db || { data: { users: {}, chats: {}, settings: {} } };
        
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        let user = global.db.data.users[m.sender];
        if (user) {
            if (!("name" in user)) user.name = m.pushName || 'Usuario';
            if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0;
            if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0;
            if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0;
            if (!("level" in user) || !isNumber(user.level)) user.level = 0;
            if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0;
            if (!("banned" in user)) user.banned = false;
            if (!("bannedReason" in user)) user.bannedReason = "";
            if (!("premium" in user)) user.premium = false;
            if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1;
            if (!("afkReason" in user)) user.afkReason = "";
        }

        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
        let chat = global.db.data.chats[m.chat];
        if (chat) {
            if (!("welcome" in chat)) chat.welcome = true;
            if (!("sWelcome" in chat)) chat.sWelcome = '';
            if (!("welcomeType" in chat)) chat.welcomeType = 'custom';
            if (!("isBanned" in chat)) chat.isBanned = false;
            if (!("antiLink" in chat)) chat.antiLink = true;
            if (!("modoadmin" in chat)) chat.modoadmin = false;
            if (!("economy" in chat)) chat.economy = true;
        }

        // ==========================================
        // DETECCIÓN DE ROLES Y RANGOS (ULTRA BLINDADO)
        // ==========================================
        const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
        const pushName = (m.pushName || '').toLowerCase().trim();
        
        // Imprime en consola para diagnosticar qué lee Baileys en tiempo real
        console.log(chalk.bgMagenta.black(' [DETECTOR EMPIRE] '), chalk.yellow(`Nombre: ${m.pushName} | ID Remitente: ${m.sender} | Número limpio: ${senderNumber}`));

        // VALIDACIÓN DE OWNER INTEGRANDO DETECCIÓN DE NOMBRE DE PERFIL
        const isROwner = senderNumber === '50360438371' || 
                          senderNumber === '503960438371' || 
                          senderNumber.includes('60438371') || 
                          pushName === 'alex' ||               
                          pushName.includes('judai') ||        
                          (global.owner && Array.isArray(global.owner) && 
                           global.owner.some(owner => owner[0].replace(/\D/g, '') === senderNumber));
            
        const isOwner = isROwner || m.fromMe;
        const isPrems = isROwner || (user && user.premium === true);

        let isAdmin = false;
        let isBotAdmin = false;
        if (m.isGroup) {
            const groupMetadata = await this.groupMetadata(m.chat).catch(_ => ({}));
            const participants = groupMetadata.participants || [];
            const admins = participants.filter(v => v.admin).map(v => v.id);
            isAdmin = admins.includes(m.sender);
            isBotAdmin = admins.includes(jidNormalizedUser(this.user.id));
        }

        if (user) user.exp += Math.ceil(Math.random() * 10);

        // ==========================================
        // PROCESADOR DE PREFIJO & COMANDOS
        // ==========================================
        const prefixRegex = global.prefix || /^[.#]/i;
        const match = prefixRegex.exec(m.body || '');
        if (!match) return; 

        const usedPrefix = match[0];
        const noPrefix = m.body.replace(usedPrefix, '').trim();
        let [command, ...args] = noPrefix.split(' ');
        command = (command || '').toLowerCase();
        
        if (!command) return;
        global.comando = command; 

        // ==========================================
        // VALIDACIONES DE SEGURIDAD
        // ==========================================
        if (chat.isBanned && !isROwner && command !== 'bot') return;

        if (user && user.banned && !isROwner) {
            return this.sendMessage(m.chat, { 
                text: `❌ *Estás bloqueado del bot.*\n\n*Razón:* ${user.bannedReason || 'Infracción de términos.'}` 
            }, { quoted: m });
        }

        if (chat.modoadmin && !isAdmin && !isOwner && m.isGroup) return;

        // ==========================================
        // BÚSQUEDA Y EJECUCIÓN DEL COMPONENTE
        // ==========================================
        let found = false;
        for (let name in global.plugins) {
            let plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            const isAccept = Array.isArray(plugin.command) 
                ? plugin.command.includes(command) 
                : plugin.command === command;

            if (!isAccept) continue;
            found = true;

            if (plugin.rowner && !isROwner) {
                global.dfail('rowner', m, this);
                continue;
            }
            if (plugin.owner && !isOwner) {
                global.dfail('owner', m, this);
                continue;
            }
            if (plugin.premium && !isPrems) {
                global.dfail('premium', m, this);
                continue;
            }
            if (plugin.group && !m.isGroup) {
                global.dfail('group', m, this);
                continue;
            }
            if (plugin.admin && !isAdmin && !isOwner) {
                global.dfail('admin', m, this);
                continue;
            }
            if (plugin.botAdmin && !isBotAdmin) {
                global.dfail('botAdmin', m, this);
                continue;
            }

            try {
                await this.sendPresenceUpdate('composing', m.chat);
                
                await plugin.call(this, m, {
                    conn: this,
                    usedPrefix,
                    noPrefix,
                    args,
                    command,
                    text: args.join(' '),
                    isROwner,
                    isOwner,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chat,
                    user,
                    chatUpdate
                });
            } catch (e) {
                console.error(chalk.red(`❌ Error ejecutando el plugin [${name}]:`), e);
                this.sendMessage(m.chat, { text: `❌ Hubo un error interno al procesar el comando.` }, { quoted: m });
            }
            break; 
        }

        if (found) {
            console.log(chalk.bgGreen.black(' EJECUTANDO '), chalk.white(`[ ${command} ]`), chalk.cyan(`por ${m.pushName || 'User'}`));
        } else {
            console.log(chalk.yellow(`[!] El comando "${command}" no coincide con ningún plugin cargado.`));
        }

    } catch (e) {
        console.error(format(e));
    }
};

global.dfail = (type, m, conn) => {
    const msg = {
        rowner: `🏰 *[ EMPIRE - RESTRICCIÓN ]* 🏰\n\n⚡ El comando *${global.comando}* está reservado exclusivamente para el *Creador Absoluto* del proyecto.`,
        owner: `🛡️ *[ EMPIRE - STAFF ]* 🛡️\n\n⚠️ Acceso denegado. El comando *${global.comando}* solo puede ser gestionado por desarrolladores o configuradores autorizados.`,
        premium: `💎 *[ EMPIRE - PREMIUM ]* 💎\n\n🌟 ¡Vaya! Este comando es exclusivo. Necesitas contar con un rango *Premium* activo para usar *${global.comando}*.`,
        group: `👥 *[ EMPIRE - GRUPOS ]* 👥\n\n❌ Lo siento, el comando *${global.comando}* no se puede usar aquí. Solo funciona dentro de *Grupos*.`,
        admin: `👑 *[ EMPIRE - MODERACIÓN ]* 👑\n\n⚠️ Acción cancelada. Solo los *Administradores* del grupo tienen los permisos para ejecutar *${global.comando}*.`,
        botAdmin: `🤖 *[ EMPIRE - CONFIGURACIÓN ]* 🤖\n\n❌ No puedo procesar *${global.comando}* porque no cuento con el rango de *Administrador*. Otórgame el permiso e intenta de nuevo.`
    }[type];
    if (msg) return conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

const file = fileURLToPath(import.meta.url);
fs.watchFile(file, async () => {
    fs.unwatchFile(file);
    console.log(chalk.magenta("[!] Se detectaron cambios en 'handler.js'. Actualizando módulo..."));
    if (global.reloadHandler) await global.reloadHandler(false);
});

export { handler };
