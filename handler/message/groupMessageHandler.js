const fs = require("fs");
const config = require(`${process.cwd()}/controller/configApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);
const message = require(`${process.cwd()}/controller/messageApi.js`);
const antispam = require(`${process.cwd()}/controller/antispam.js`);
const groupCommandHandler = require(`${process.cwd()}/handler/command/commandHandler.js`);
const superCommandHandler = require(`${process.cwd()}/handler/command/superCommandHandler.js`);

function handleTextMsg(packet){
	if(packet.Content.length > 24){
		antispam.scanTextMsg(packet.Content, function(result){
			if(result !== true){
				message.revoke(packet.FromGroupUin, packet.MsgSeq, packet.MsgRandom);
				var msg = `您的信息触发了审计规则.详情:\n${result}.`;
				message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
			}else{
				//do nothing
			}
		});
	}
	//获取基本信息
	var BOT_NAME = config.get("global", "BOT_NAME");
	//获取正则表达式
	var REGEX = config.get("global", "MESSAGE_GLOBAL_REGEX");
	var GROUP_REGEX = config.get("global", "MESSAGE_GROUP_REGEX");
	try{
		if(GROUP_REGEX[packet.FromGroupUin.toString()] !== undefined){
			Object.assign(REGEX, GROUP_REGEX[packet.FromGroupUin.toString()]);
		}
	}catch(e){
		//do nothing
	}
	//匹配正则表达式
	var action = null;
	for(key in REGEX){
		var regexp = eval(REGEX[key].replace(/\{BOT_NAME\}/g, BOT_NAME));//替换掉正则表达式*字符串*里的机器人名字 同时转化为正则表达式对象
		if(regexp.test(packet.Content)){
			action = key;
		}
	}
	if(action === "command"){
		log.write("重定向到commandHandler.js处理", "GroupMessageHandler", "INFO");
		var nameRegexp = eval(`/${BOT_NAME}/g`);
		var command = packet.Content.replace(nameRegexp, "");
		groupCommandHandler.handleCommand(command, 2, packet.FromGroupUin, packet.FromUin);
		return;
	}
	if (action === "superCommand") {
		log.write("重定向superCommandHandler.js处理", "GroupMessageHandler", "INFO");
		superCommandHandler.handle(packet);
		return;
	}
	if(action !== null){
		fs.exists(`${process.cwd()}/plugins/message/${action}.js`, function(exists){
			if(exists){
				log.write(`重定向到${action}.js处理`, "GroupMessageHandler", "INFO");
				const eventHandler = require(`${process.cwd()}/plugins/message/${action}.js`);
				eventHandler.handle(packet);
			}else{
				console.log(action);
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