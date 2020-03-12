const message = require(`${process.cwd()}/controller/messageApi.js`);
const config = require(`${process.cwd()}/controller/configApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);

const TIMEBOT_IMAGES = config.get("TIMEBOT", "TIMEBOT_IMAGES");
const ENABLE_TIMEBOT_GROUP = config.get("global", "ENABLE_TIMEBOT_GROUP");

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
	}
	sendTimeSticker();
	log.write("TimeBot已成功加载.", "TIMEBOT", "INFO");
}

function sendTimeSticker(){
	var date = new Date();
	var minutes = date.getMinutes();
	var time = date.getTime();
	if(minutes == 0){
		log.write(`${date.getHours()}点了!`, "TIMEBOT", "INFO");
		var stickerSeq = `CLOCK${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}`;
		var sticker = TIMEBOT_IMAGES[stickerSeq];
		var seq = 0;
		var groupId = Array();
		for(i=0;i<ENABLE_TIMEBOT_GROUP.length;i++){
			groupId.push(ENABLE_TIMEBOT_GROUP[i]);
			setTimeout(function(){
				message.sendImage(groupId[seq], sticker);
				seq++;
			},i*2000);
		}
	}
	var nextFullHour = (Math.ceil(time / 3600000) * 3600000) - time;
	var nextFullMinute = (Math.ceil(time / 60000)*60000) - time;
	setTimeout(function(){
		sendTimeSticker();
	}, nextFullMinute);
}

module.exports = {
	init
}