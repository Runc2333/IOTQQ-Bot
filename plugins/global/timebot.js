const message = require(`${process.cwd()}/controller/messageApi.js`);
const config = require(`${process.cwd()}/controller/configReader.js`);
const log = require(`${process.cwd()}/controller/logWriter.js`);

const TIMEBOT_IMAGES = config.get("TIMEBOT_IMAGES");
const ENABLE_TIMEBOT_GROUP = config.get("ENABLE_TIMEBOT_GROUP");

function init(){
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
		var sticker = TIMEBOT_IMAGES[0][stickerSeq];
		var seq = 0;
		var groupId = Array();
		for(i=0;i<ENABLE_TIMEBOT_GROUP.length;i++){
			groupId.push(ENABLE_TIMEBOT_GROUP[i]);
			setTimeout(function(){
				message.sendImage(groupId[seq], sticker);
				seq++;
			},i*1000);
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