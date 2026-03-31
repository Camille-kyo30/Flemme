const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "2.0 👑⚡",
		author: "Camille",
		countDown: 5,
		role: 2,
		description: {
			en: "Send royal decree from the throne to all kingdoms"
		},
		category: "👑 TRÔNE ROYAL",
		guide: {
			en: "{pn} <message>"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		en: {
			missingMessage: "❌ A royal decree must contain a message.",
			
			notification: `
╔══════════════════════════════════════╗
║ 👑🏰 ROYAL DECREE FROM THE THRONE 🏰👑 ║
╠══════════════════════════════════════╣
📡 Message broadcasted to all kingdoms
╚══════════════════════════════════════╝
`,

			sendingNotification:
				"⚡ The Throne is dispatching the decree to %1 kingdoms...",

			sentNotification:
				"✅ The royal decree has reached %1 kingdoms successfully.",

			errorSendingNotification:
				"⚠️ Some kingdoms resisted the decree:\n%1"
		}
	},

	onStart: async function ({
		message,
		api,
		event,
		args,
		commandName,
		envCommands,
		threadsData,
		getLang
	}) {
		const { delayPerGroup } = envCommands[commandName];

		if (!args[0]) return message.reply(getLang("missingMessage"));

		const formSend = {
			body: `${getLang("notification")}\n\n📜 MESSAGE:\n${args.join(" ")}`,
			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item =>
					["photo", "png", "animated_image", "video", "audio"].includes(item.type)
				)
			)
		};

		const allThreadID = (await threadsData.getAll())
			.filter(t =>
				t.isGroup &&
				t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
			);

		message.reply(getLang("sendingNotification", allThreadID.length));

		let sendSucces = 0;
		const sendError = [];
		const waitingSend = [];

		for (const thread of allThreadID) {
			const tid = thread.threadID;

			try {
				waitingSend.push({
					threadID: tid,
					pending: api.sendMessage(formSend, tid)
				});

				await new Promise(resolve =>
					setTimeout(resolve, delayPerGroup)
				);
			} catch (e) {
				sendError.push(tid);
			}
		}

		for (const sent of waitingSend) {
			try {
				await sent.pending;
				sendSucces++;
			} catch (e) {
				const { errorDescription } = e;

				if (
					!sendError.some(item => item.errorDescription == errorDescription)
				) {
					sendError.push({
						threadIDs: [sent.threadID],
						errorDescription
					});
				} else {
					sendError
						.find(item => item.errorDescription == errorDescription)
						.threadIDs.push(sent.threadID);
				}
			}
		}

		let msg = "";

		if (sendSucces > 0) {
			msg += getLang("sentNotification", sendSucces) + "\n";
		}

		if (sendError.length > 0) {
			msg += getLang(
				"errorSendingNotification",
				sendError.reduce((a, b) => a + b.threadIDs.length, 0),
				sendError
					.reduce(
						(a, b) =>
							a +
							`\n🏰 Kingdom error:\n - ${b.errorDescription}\n   ➜ ${b.threadIDs.join("\n   ➜ ")}`,
						""
					)
			);
		}

		return message.reply(msg + "\n\n👑 The Throne remains eternal.");
	}
};
