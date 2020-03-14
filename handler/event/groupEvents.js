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
	currentMsg.RequestType = 2;
	currentMsg.MsgType = data.CurrentPacket.Data.MsgType;
	currentMsg.MsgSeq = data.CurrentPacket.Data.MsgSeq;
	currentMsg.MsgRandom = data.CurrentPacket.Data.MsgRandom;
	currentMsg.FromUin = data.CurrentPacket.Data.FromUserId;
	currentMsg.FromGroupUin = data.CurrentPacket.Data.FromGroupId;
	currentMsg.FromGroupName = data.CurrentPacket.Data.FromGroupName;
	currentMsg.FromNickName = data.CurrentPacket.Data.FromNickName;
	currentMsg.Content = data.CurrentPacket.Data.Content;
	if(currentMsg.FromUin != BOT_QQ_NUM){
		switch(currentMsg.MsgType){
			case "TextMsg":
				log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组文字消息", "INFO");
				groupMessageHandler.handleTextMsg(currentMsg);
				break;
			case "PicMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
				}catch(e){
					log.write("解析 <PicMsg> 时出现问题.", "未能解析消息", "ERROR");
					return false;
				}
				if(tmp.Content != ""){
					currentMsg.Content = tmp.Content;
					log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: [图片]${currentMsg.Content}`, "收到群组图文消息", "INFO");
					groupMessageHandler.handleTextMsg(currentMsg);
				}else{
					log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: [图片]`, "收到群组图片消息", "INFO");
					database.saveMessage(currentMsg.FromUin, currentMsg.FromGroupUin, "[图片]", currentMsg.MsgSeq, currentMsg.MsgRandom);
				}
				break;
			case "AtMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
				}catch(e){
					log.write("解析 <AtMsg> 时出现问题.", "未能解析消息", "ERROR");
					return false;
				}
				if(tmp.UserID == BOT_QQ_NUM){
					user.getNickname(BOT_QQ_NUM, function(nickname){
						var regexp = eval(`/@${nickname}/ig`);
						currentMsg.Content = tmp.Content.replace(regexp, "");
						log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组@消息", "INFO");
						commandHandler.handleCommand(currentMsg.Content, 2, currentMsg.FromGroupUin, currentMsg.FromUin)
					});
				}else{
					currentMsg.Content = tmp.Content;
					log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组@消息", "INFO");
					database.saveMessage(currentMsg.FromUin, currentMsg.FromGroupUin, currentMsg.Content, currentMsg.MsgSeq, currentMsg.MsgRandom);
				}
				break;
			case "XmlMsg":
				XMLMessageHandler.handle(currentMsg);
				break;
			case "ReplayMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
				}catch(e){
					log.write("解析 <ReplayMsg> 时出现问题.", "未能解析消息", "ERROR");
					return false;
				}
				if(tmp.UserID == BOT_QQ_NUM){
					user.getNickname(BOT_QQ_NUM, function(nickname){
						var regexp = eval(`/@${nickname}/ig`);
						currentMsg.Content = tmp.ReplayContent.replace(regexp, "");
						log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组回复消息", "INFO");
						commandHandler.handleCommand(currentMsg.Content, 2, currentMsg.FromGroupUin, currentMsg.FromUin)
					});
				}else{
					currentMsg.Content = tmp.ReplayContent;
					currentMsg.SrcContent = tmp.SrcContent;
					currentMsg.SrcMsgSeq = tmp.MsgSeq;
					currentMsg.SrcFromUin = tmp.UserID;
					log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组回复消息", "INFO");
					superCommandHandler.handle(currentMsg);
				}
				break;
			case "SmallFaceMsg":
				try{
					currentMsg.Content = JSON.parse(currentMsg.Content).Content;
				}catch(e){
					log.write("解析 <SmallFaceMsg> 时出现问题.", "未能解析消息", "ERROR");
					return false;
				}
				log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组小表情消息", "INFO");
				database.saveMessage(currentMsg.FromUin, currentMsg.FromGroupUin, currentMsg.Content, currentMsg.MsgSeq, currentMsg.MsgRandom);
				break
			case "BigFaceMsg":
				try{
					currentMsg.Content = JSON.parse(currentMsg.Content).Content;
				}catch(e){
					log.write("解析 <BigFaceMsg> 时出现问题.", "未能解析消息", "ERROR");
					return false;
				}
				log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${currentMsg.Content}`, "收到群组大表情消息", "INFO");
				database.saveMessage(currentMsg.FromUin, currentMsg.FromGroupUin, currentMsg.Content, currentMsg.MsgSeq, currentMsg.MsgRandom);
				break
			case "JsonMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
					var brief = tmp.prompt;
					var url = tmp.meta.news.jumpUrl;
				}catch(e){
					log.write("解析 <JsonMsg> 时出现问题.", "未能解析消息", "ERROR");
					return false;
				}
				database.saveMessage(currentMsg.FromUin, currentMsg.FromGroupUin, brief, currentMsg.MsgSeq, currentMsg.MsgRandom);
				log.write(`<${currentMsg.FromGroupName}> - <${currentMsg.FromNickName}>: ${brief}`, "收到群组JSON消息", "INFO");
				if(/(x5m\.qq\.com|mobilex5)/.test(url) === false){
					message.revoke(currentMsg.FromGroupUin, currentMsg.MsgSeq, currentMsg.MsgRandom);
					var msg = "您的信息触发了审计规则.详情:\n本群禁止除QQ炫舞官方及本群爆气表外的分享.";
					message.send(currentMsg.FromGroupUin, msg, currentMsg.RequestType, currentMsg.FromUin);
				}
				break;
			default:
				log.write(currentMsg.MsgType, "未知群组消息类型", "INFO");
				console.log(data);
				break;
		}
	}
}

module.exports = {
    handle
}