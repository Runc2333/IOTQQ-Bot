const message = require(`${process.cwd()}/controller/messageApi.js`);
const config = require(`${process.cwd()}/controller/configApi.js`);
const user = require(`${process.cwd()}/controller/userApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);

function init() {
	if (config.get("TIMEBOT") === false) {
		var data = {};
		data.ENABLE_TIMEBOT_GROUP = [];
		data.TIMEBOT_IMAGES = {
			"CLOCK01": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/01.jpg",
			"CLOCK02": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/02.jpg",
			"CLOCK03": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/03.jpg",
			"CLOCK04": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/04.jpg",
			"CLOCK05": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/05.jpg",
			"CLOCK06": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/06.jpg",
			"CLOCK07": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/07.jpg",
			"CLOCK08": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/08.jpg",
			"CLOCK09": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/09.jpg",
			"CLOCK10": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/10.jpg",
			"CLOCK11": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/11.jpg",
			"CLOCK12": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/12.jpg",
			"CLOCK13": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/01.jpg",
			"CLOCK14": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/02.jpg",
			"CLOCK15": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/03.jpg",
			"CLOCK16": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/04.jpg",
			"CLOCK17": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/05.jpg",
			"CLOCK18": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/06.jpg",
			"CLOCK19": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/07.jpg",
			"CLOCK20": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/08.jpg",
			"CLOCK21": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/09.jpg",
			"CLOCK22": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/10.jpg",
			"CLOCK23": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/11.jpg",
			"CLOCK00": "https://qqbot2.oss-cn-shanghai.aliyuncs.com/12.jpg"
		};
		config.write("TIMEBOT", data);
		log.write("未在配置文件内找到插件配置, 已自动生成默认配置.", "TIMEBOT", "INFO");
	}
	config.registerSuperCommand("timebot", "timebot.js", "timebot", "用于开启/关闭TimeBot.\n[state]取值:(enable|disable) => (开启|关闭)", "[state]");
	sendTimeSticker();
	log.write("TimeBot已成功加载.", "TIMEBOT", "INFO");
}

function sendTimeSticker(){
	var date = new Date();
	var minutes = date.getMinutes();
	var time = date.getTime();
	var TIMEBOT_IMAGES = config.get("TIMEBOT", "TIMEBOT_IMAGES");
	var ENABLE_TIMEBOT_GROUP = config.get("TIMEBOT", "ENABLE_TIMEBOT_GROUP");
	if(minutes == 0){
		log.write(`${date.getHours()}点了!`, "TIMEBOT", "INFO");
		var stickerSeq = `CLOCK${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}`;
		var sticker = TIMEBOT_IMAGES[stickerSeq];
		console.log(ENABLE_TIMEBOT_GROUP);
		for(i=0;i<ENABLE_TIMEBOT_GROUP.length;i++){
			message.sendImage(ENABLE_TIMEBOT_GROUP[i], sticker);
		}
	}
	var nextFullHour = (Math.ceil(time / 3600000) * 3600000) - time;
	var nextFullMinute = (Math.ceil(time / 60000) * 60000) - time;
	if (nextFullHour < 1000) {
		setTimeout(function () {
			sendTimeSticker();
		}, 60000);
	} else {
		setTimeout(function () {
			sendTimeSticker();
		}, nextFullHour);
	}
	
}

function timebot(packet) {
	if (user.isAdmin(packet.FromUin, packet.FromGroupUin)) {
		var command = packet.Content.match(/(?<=\/)[a-z]{2,10}\s[a-z]{2,10}/i);
		if (command !== null) {
			var parameter = command[0].split(" ")[1];
		} else {
			var msg = "[TIMEBOT] 未知参数.";
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
			return false;
		}
		switch (parameter) {
			case "enable":
				var ENABLE_TIMEBOT_GROUP = config.get("TIMEBOT", "ENABLE_TIMEBOT_GROUP");
				ENABLE_TIMEBOT_GROUP.push(packet.FromGroupUin.toString());
				config.write("TIMEBOT", ENABLE_TIMEBOT_GROUP, "ENABLE_TIMEBOT_GROUP");
				var msg = "[TIMEBOT] 已启用.";
				message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
				break;
			case "disable":
				var ENABLE_TIMEBOT_GROUP = config.get("TIMEBOT", "ENABLE_TIMEBOT_GROUP");
				var index = ENABLE_TIMEBOT_GROUP.indexOf(packet.FromGroupUin.toString());
				if (index !== -1) {
					ENABLE_TIMEBOT_GROUP.splice(index, 1);
				}
				config.write("TIMEBOT", ENABLE_TIMEBOT_GROUP, "ENABLE_TIMEBOT_GROUP");
				var msg = "[TIMEBOT] 已禁用.";
				message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
				break;
			default:
				var msg = "[TIMEBOT] 未知参数.";
				message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
				break;
		}
	} else {
		var msg = "[TIMEBOT] 权限不足.";
		message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
	}
}

module.exports = {
	init,
	timebot
}