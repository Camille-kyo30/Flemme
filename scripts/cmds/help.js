module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "aide"],
    version: "4.0 👑⚡",
    author: "Camille",
    category: "system",
    shortDescription: {
      fr: "📺 Menu interactif premium",
      en: "📺 Premium interactive menu"
    }
  },

  onStart: async ({ message, event, prefix }) => {

    const allCmds = Object.values(global.GoatBot.commands)
      .filter(cmd => !cmd.config.isHidden)
      .sort((a, b) => a.config.category.localeCompare(b.config.category));

    const pageSize = 10;
    const totalPages = Math.ceil(allCmds.length / pageSize);

    let page = 1;

    const renderPage = (page) => {
      let start = (page - 1) * pageSize;
      let cmds = allCmds.slice(start, start + pageSize);

      let text = "";
      let currentCategory = "";

      text += "╔══════════════════════╗\n";
      text += "  📺👑 MENU ROYAL V4 ⚡\n";
      text += "╠══════════════════════╣\n\n";

      for (const cmd of cmds) {
        if (cmd.config.category !== currentCategory) {
          currentCategory = cmd.config.category;
          text += `【 📂 ${currentCategory.toUpperCase()} 】\n`;
        }

        let desc = cmd.config.shortDescription?.fr || "Aucune description";

        text += `➤ ${prefix}${cmd.config.name}\n`;
        text += `   ⚡ ${desc}\n`;
      }

      text += "\n╠══════════════════════╣\n";
      text += `📄 Page ${page}/${totalPages}\n`;
      text += "↩️ reply: next / prev\n";
      text += "╚══════════════════════╝\n";
      text += "\n👑 Camille • Mini Sonic ⚡\n";

      return text;
    };

    const msg = await message.reply(renderPage(page));

    global.GoatBot.onReply.set(msg.messageID, {
      commandName: "help",
      author: event.senderID,
      page
    });
  },

  onReply: async ({ message, event, Reply, prefix }) => {
    if (event.senderID != Reply.author) return;

    const allCmds = Object.values(global.GoatBot.commands)
      .filter(cmd => !cmd.config.isHidden)
      .sort((a, b) => a.config.category.localeCompare(b.config.category));

    const pageSize = 10;
    const totalPages = Math.ceil(allCmds.length / pageSize);

    let page = Reply.page;

    if (event.body.toLowerCase() === "next") page++;
    if (event.body.toLowerCase() === "prev") page--;

    if (page > totalPages) page = 1;
    if (page < 1) page = totalPages;

    let start = (page - 1) * pageSize;
    let cmds = allCmds.slice(start, start + pageSize);

    let text = "";
    let currentCategory = "";

    text += "╔══════════════════════╗\n";
    text += "  📺👑 MENU ROYAL V4 ⚡\n";
    text += "╠══════════════════════╣\n\n";

    for (const cmd of cmds) {
      if (cmd.config.category !== currentCategory) {
        currentCategory = cmd.config.category;
        text += `【 📂 ${currentCategory.toUpperCase()} 】\n`;
      }

      let desc = cmd.config.shortDescription?.fr || "Aucune description";

      text += `➤ ${prefix}${cmd.config.name}\n`;
      text += `   ⚡ ${desc}\n`;
    }

    text += "\n╠══════════════════════╣\n";
    text += `📄 Page ${page}/${totalPages}\n`;
    text += "↩️ reply: next / prev\n";
    text += "╚══════════════════════╝\n";
    text += "\n👑 Camille • Mini Sonic ⚡\n";

    const newMsg = await message.reply(text);

    global.GoatBot.onReply.set(newMsg.messageID, {
      commandName: "help",
      author: event.senderID,
      page
    });
  }
};
