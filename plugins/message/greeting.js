const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);

//获取打招呼用的语句
module.exports = {
	init: function () {
		config.registerPlugin("global", "/(^{BOT_NAME}$)/", "greeting");
		if (config.get("GREETING") === false) {
			var data = {};
			data["GREETING_STRING"] = ["我在", "在", "欸", "在呢", "什么事？", "一直都在"];
			config.write("GREETING", data);
			log.write("未在配置文件内找到插件配置, 已自动生成默认配置.", "GREETING", "INFO");
		}
	},
	handle: function(packet){
		var greeting = config.get("GREETING", "GREETING_STRING");
		var msg = greeting[parseInt(Math.random() * greeting.length, 10)];
		if(packet.RequestType == 2){
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
		}else{
			try{
				var groupId = packet.groupId;
			}catch(e){
				message.send(packet.FromGroupUin, msg, packet.RequestType);
				return true;
			}
			if(groupId !== undefined){
				message.send(packet.FromGroupUin, msg, packet.RequestType, 0, groupId);
			}
		}
	}
}