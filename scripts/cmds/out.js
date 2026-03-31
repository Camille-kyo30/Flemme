module.exports = {
  config: {
    name: "leave",
    aliases: ["out"],
    version: "2.0 👑",
    author: "Camille",
    countDown: 5,
    role: 1,
    shortDescription: "Quitte un royaume (groupe)",
    category: "👑 TRÔNE ROYAL",
    guide: {
      en: "{pn} [threadID / vide = groupe actuel]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      let id;

      if (!args[0]) {
        id = event.threadID;
      } else {
        id = parseInt(args[0]);
      }

      const msg = `
╔══════════════════════════════╗
║      👑 DÉPART DU TRÔNE      ║
╠══════════════════════════════╣
🏰 Le gardien du système quitte ce royaume...
💬 Merci pour votre utilisation.
╚══════════════════════════════╝
`;

      await api.sendMessage(msg, id);

      // petite pause dramatique ⚡
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), id);
      }, 1000);

    } catch (err) {
      return message.reply(
        "❌ Impossible de quitter ce royaume.\n⚠️ Vérifie les permissions du Trône."
      );
    }
  }
};
