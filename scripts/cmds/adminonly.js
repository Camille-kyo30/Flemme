const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin"],
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "bật/tắt chế độ chỉ admin mới có thể sử dụng bot",
			en: "turn on/off only admin can use bot"
		},
		category: "owner",
		guide: {
			vi:
				"{pn} [on | off]: bật/tắt chế độ admin only\n" +
				"{pn} noti [on | off]: bật/tắt thông báo non-admin",
			en:
				"{pn} [on | off]: turn on/off admin only mode\n" +
				"{pn} noti [on | off]: toggle non-admin notification"
		}
	},

	langs: {
		vi: {
			turnedOn: "Đã bật chế độ chỉ admin mới có thể sử dụng bot",
			turnedOff: "Đã tắt chế độ chỉ admin mới có thể sử dụng bot",
			turnedOnNoti: "Đã bật thông báo non-admin",
			turnedOffNoti: "Đã tắt thông báo non-admin"
		},
		en: {
			turnedOn: "Admin-only mode enabled",
			turnedOff: "Admin-only mode disabled",
			turnedOnNoti: "Non-admin notification enabled",
			turnedOffNoti: "Non-admin notification disabled"
		}
	},

	onStart: function ({ args, message, getLang }) {
		const isNoti = args[0] === "noti";
		const mode = isNoti ? args[1] : args[0];

		const value =
			mode === "on" ? true :
			mode === "off" ? false :
			null;

		if (value === null)
			return message.SyntaxError();

		if (isNoti) {
			config.hideNotiMessage.adminOnly = !value;
		} else {
			config.adminOnly.enable = value;
		}

		fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

		return message.reply(
			getLang(
				value
					? (isNoti ? "turnedOnNoti" : "turnedOn")
					: (isNoti ? "turnedOffNoti" : "turnedOff")
			)
		);
	}
};
