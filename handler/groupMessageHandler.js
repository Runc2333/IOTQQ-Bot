const fs = require("fs");
const config = require("../controller/configReader.js");
const log = require("../controller/logWriter.js");
const message = require("../controller/messageApi.js");
const groupCommandHandler = require("./commandHandler.js");

function handleTextMsg(packet){
	//获取基本信息
	var BOT_NAME = config.get("BOT_NAME");
	//获取正则表达式
	var REGEX = config.get("MESSAGE_GLOBAL_REGEX")[0];
	var GROUP_REGEX = config.get("MESSAGE_GROUP_REGEX");
	try{
		if(GROUP_REGEX[0][packet.FromGroupUin.toString()][0] !== undefined){
			Object.assign(REGEX, GROUP_REGEX[0][packet.FromGroupUin.toString()][0]);
		}
	}catch(e){
		//do nothing
	}
	//替换机器人名字
	for(key in REGEX){
		REGEX[key] = REGEX[key].replace(/\{BOT_NAME\}/g, BOT_NAME);
	}
	//匹配正则表达式
	var action = null;
	for(key in REGEX){
		var regexp = eval(REGEX[key]);
		if(regexp.test(packet.Content)){
			action = key;
		}
	}
	if(action === "command"){
		log.write("重定向到commandHandler.js处理", "GroupMessageHandler", "INFO");
		var nameRegexp = eval("/"+BOT_NAME+"/g");
		var command = packet.Content.replace(nameRegexp, "");
		groupCommandHandler.handleCommand(command, 2, packet.FromGroupUin, packet.FromUin);
		return;
	}
	if(action !== null){
		fs.exists("./plugins/"+action+".js", function(exists){
			if(exists){
				log.write("重定向到"+action+".js处理", "GroupMessageHandler", "INFO");
				const eventHandler = require("../plugins/"+action+".js");
				eventHandler.handle(packet);
			}else{
				log.write("未找到对应的事件处理程序.", "GroupMessageHandler", "WARNING");
			}
		});
	}else{
		//do something
	}
}

module.exports = {
	handleTextMsg
}