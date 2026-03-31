const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "3.0 👑⚡",
    author: "Camille",
    countDown: 5,
    role: 0,
    description: {
      fr: "📨 Transmettre une parole au Trône Royal"
    },
    category: "👑 Trône Royal",
    guide: {
      fr: "{pn} <message>"
    }
  },

  langs: {
    fr: {
      missingMessage: "❌ Veuillez formuler votre requête au Trône.",

      sendByGroup: "\n🏟️ Royaume : %1\n🆔 ID territoire : %2",

      content:
        "\n╠══════════════ 📜 PAROLE AU TRÔNE 📜 ══════════════╣\n%1\n╠══════════════════════════════════════════╣",

      success:
        "✅ Votre parole a été transmise au Trône (%1 souverain(s)).\n%2",

      failed:
        "❌ Échec de transmission vers %1 souverain(s)\n%2",

      reply: `
╔══════════════════════════════════════════╗
║           👑 DÉCRET DU TRÔNE 👑          ║
╠══════════════════════════════════════════╣
🏰 Autorité : %1

📜 Décision royale :
%2
╚══════════════════════════════════════════╝
`,

      replySuccess: "✅ Le décret du Trône a été envoyé avec succès.",

      feedback: `
╔══════════════════════════════════════════╗
║        👑 MESSAGE AU TRÔNE ROYAL 👑      ║
╠══════════════════════════════════════════╣
🏰 Destinataire : Sa Majesté & Conseil Royal

👤 Sujet du Royaume : %1
🆔 Identifiant : %2%3

╠══════════════ 📜 PAROLE TRANSMISE 📜 ══════════════╣
%4
╠══════════════════════════════════════════╣
║   ⚖️ Le Trône observe… chaque mot compte. ⚖️   ║
╚══════════════════════════════════════════╝
`,

      replyUserSuccess:
        "✅ Le décret royal a été transmis au sujet avec succès.",

      noAdmin:
        "⚠️ Le Trône est vide... aucun souverain n'est présent."
    }
  },

  onStart: async function ({
    args,
    message,
    event,
    usersData,
    threadsData,
    api,
    commandName,
    getLang
  }) {
    if (!args[0]) return message.reply(getLang("missingMessage"));

    const { senderID, threadID, isGroup } = event;
    const { config } = global.GoatBot;

    if (config.adminBot.length === 0)
      return message.reply(getLang("noAdmin"));

    const senderName = await usersData.getName(senderID);
    const threadName = isGroup
      ? (await threadsData.get(threadID)).threadName
      : "";

    const formMessage = {
      body:
        getLang(
          "feedback",
          senderName,
          senderID,
          isGroup ? getLang("sendByGroup", threadName, threadID) : "",
          args.join(" ")
        ),
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])].filter(a =>
          mediaTypes.includes(a.type)
        )
      )
    };

    const successIDs = [];
    const failedIDs = [];

    const adminNames = await Promise.all(
      config.adminBot.map(async id => ({
        id,
        name: await usersData.getName(id)
      }))
    );

    for (const uid of config.adminBot) {
      try {
        const info = await api.sendMessage(formMessage, uid);
        successIDs.push(uid);

        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
      } catch (err) {
        failedIDs.push(uid);
      }
    }

    let msg = "";

    if (successIDs.length > 0) {
      msg += getLang(
        "success",
        successIDs.length,
        adminNames
          .filter(a => successIDs.includes(a.id))
          .map(a => `👑 ${a.name}`)
          .join("\n")
      );
    }

    if (failedIDs.length > 0) {
      msg += "\n" + getLang("failed", failedIDs.length, failedIDs.join(", "));
    }

    return message.reply(msg);
  },

  onReply: async function ({
    args,
    event,
    api,
    message,
    Reply,
    usersData,
    commandName,
    getLang
  }) {
    const { type, threadID, message
