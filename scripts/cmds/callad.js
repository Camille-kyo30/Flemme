const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "2.5",
    author: "Camille 2.0⚡",
    countDown: 5,
    role: 0,
    description: {
      fr: "Envoyer un rapport, retour ou signalement au admin du bot"
    },
    category: "Contacts Admin",
    guide: {
      fr: "{pn} <message>"
    }
  },

  langs: {
    fr: {
      missingMessage: "❌ Veuillez entrer le message que vous souhaitez envoyer à l'admin",
      sendByGroup: "\n- Envoyé depuis le groupe : %1\n- ID du Thread : %2",
      sendByUser: "\n- Envoyé depuis un utilisateur",
      content: "\n📜 Contenu du rapport Trône Royale :\n👑════════════════════════════════════════👑\n%1\n👑════════════════════════════════════════👑",
      success: "✅ Votre message a été envoyé à %1 admin avec succès !\n%2",
      failed: "❌ Une erreur est survenue lors de l'envoi à %1 admin\n%2\nVérifiez la console pour plus de détails",
      reply: "👑 Réponse de l'admin %1 :\n👑════════════════════════════════════════👑\n%2\n👑════════════════════════════════════════👑",
      replySuccess: "✅ Votre réponse a été envoyée à l'admin avec succès !",
      feedback: "📬 Feedback de l'utilisateur %1 :\n- ID utilisateur : %2%3\n\n📜 Contenu Trône Royale :\n👑════════════════════════════════════════👑\n%4\n👑════════════════════════════════════════👑",
      replyUserSuccess: "✅ Votre réponse a été envoyée à l'utilisateur avec succès !",
      noAdmin: "⚠️ Le bot n'a actuellement aucun admin"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    if (!args[0]) return message.reply(getLang("missingMessage"));
    const { senderID, threadID, isGroup } = event;
    const { config } = global.GoatBot;
    if (config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

    const senderName = await usersData.getName(senderID);
    const threadName = isGroup ? (await threadsData.get(threadID)).threadName : "";

    const header = "🏰👑✨═════📨 CALL ADMIN TRÔNE ROYALE 📨═════✨👑🏰\n";
    const userInfo = `👑 Utilisateur : ${senderName}\n🆔 ID : ${senderID}${isGroup ? `\n🏟️ Groupe : ${threadName}\n🆔 Thread : ${threadID}` : ""}`;
    const content = getLang("content", args.join(" "));
    const footer = "👑 Camille 2.0⚡";

    const formMessage = {
      body: `${header}${userInfo}${content}\n${footer}`,
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment([...event.attachments, ...(event.messageReply?.attachments || [])].filter(a => mediaTypes.includes(a.type)))
    };

    const successIDs = [];
    const failedIDs = [];
    const adminNames = await Promise.all(config.adminBot.map(async id => ({ id, name: await usersData.getName(id) })));

    for (const uid of config.adminBot) {
      try {
        const messageSend = await api.sendMessage(formMessage, uid);
        successIDs.push(uid);
        global.GoatBot.onReply.set(messageSend.messageID, {
          commandName,
          messageID: messageSend.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
      } catch (err) {
        failedIDs.push({ adminID: uid, error: err });
      }
    }

    let msg2 = "";
    if (successIDs.length > 0)
      msg2 += getLang("success", successIDs.length, adminNames.filter(a => successIDs.includes(a.id)).map(a => ` <@${a.id}> (${a.name})`).join("\n"));
    if (failedIDs.length > 0)
      msg2 += getLang("failed", failedIDs.length, failedIDs.map(a => ` <@${a.adminID}> (${adminNames.find(n => n.id == a.adminID)?.name || a.adminID})`).join("\n"));

    return message.reply({ body: msg2 + "\n👑 Camille 2.0⚡", mentions: adminNames.map(a => ({ id: a.id, tag: a.name })) });
  },

  onReply: async function ({ args, event, api, message, Reply, usersData, commandName, getLang }) {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const { isGroup } = event;

    switch (type) {
      case "userCallAdmin": {
        const formMessage = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(event.attachments.filter(a => mediaTypes.includes(a.type)))
        };

        api.sendMessage(formMessage, threadID, (err, info) => {
          if (err) return message.err(err);
          message.reply(getLang("replyUserSuccess") + "\n👑 Camille 2.0⚡");
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "adminReply"
          });
        }, messageIDSender);
        break;
      }
      case "adminReply": {
        let sendByGroup = "";
        if (isGroup) {
          const { threadName } = await api.getThreadInfo(event.threadID);
          sendByGroup = getLang("sendByGroup", threadName, event.threadID);
        }

        const formMessage = {
          body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(event.attachments.filter(a => mediaTypes.includes(a.type)))
        };

        api.sendMessage(formMessage, threadID, (err, info) => {
          if (err) return message.err(err);
          message.reply(getLang("replySuccess") + "\n👑 Camille 2.0⚡");
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "userCallAdmin"
          });
        }, messageIDSender);
        break;
      }
      default: break;
    }
  }
};
