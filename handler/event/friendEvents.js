/* Controller */
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const user = require(`${process.cwd().replace(/\\/g, "/")}/controller/userApi.js`);
const database = require(`${process.cwd().replace(/\\/g, "/")}/controller/database.js`);
/* Message Handler */
const groupMessageHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/message/groupMessageHandler.js`);
const XMLMessageHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/message/XMLMessageHandler.js`);
/* Command Handler */
const commandHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/command/commandHandler.js`);
const superCommandHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/command/superCommandHandler.js`);

const BOT_QQ_NUM = config.get("global", "BOT_QQ_NUM");

function handle(data){
    var currentMsg = {};
	currentMsg.MsgType = data.CurrentPacket.Data.MsgType;
	currentMsg.FromUin = data.CurrentPacket.Data.FromUin;
	currentMsg.Content = data.CurrentPacket.Data.Content;
	if(currentMsg.FromUin != BOT_QQ_NUM){
		switch(currentMsg.MsgType){
			case "TextMsg":
				user.getNickname(currentMsg.FromUin, function(nickname){
						log.write(`<${currentMsg.FromUin}> - <${nickname}>: ${currentMsg.Content}`, "收到私聊消息", "INFO");
						commandHandler.handleCommand(currentMsg.Content, 1, currentMsg.FromUin, 0);
				});
				break;
			case "TempSessionMsg":
				currentMsg.TempUin = data.CurrentPacket.Data.TempUin;
				try{
					tmp = JSON.parse(data.CurrentPacket.Data.Content);
					currentMsg.Content = tmp.Content;
					if(tmp.tips == "[好友图片]"){
						currentMsg.Content = "[图片]";
					}
				}catch(e){
					currentMsg.Content = data.CurrentPacket.Data.Content;
				}
				user.getNickname(currentMsg.FromUin, function(nickname){
					log.write(`<${currentMsg.FromUin}> - <${nickname}>: ${currentMsg.Content}`, "收到私聊消息", "INFO");
					commandHandler.handleCommand(currentMsg.Content, 3, currentMsg.FromUin, 0, currentMsg.TempUin);
				});
				break;
			default:
				log.write(currentMsg.MsgType, "未知私聊消息类型", "INFO");
				console.log(data);
				break;
		}
	}
}

module.exports = {
    handle
}