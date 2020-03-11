const io = require("socket.io-client");
const request = require("request");
const config = require("./controller/configReader.js");
const log = require("./controller/logWriter.js");
const message = require("./controller/messageApi.js");
const user = require("./controller/userApi.js");
const XMLMessageHandler = require("./handler/XMLMessageHandler.js");
const groupMessageHandler = require("./handler/groupMessageHandler.js");
const commandHandler = require("./handler/commandHandler.js");
const superCommandHandler = require("./handler/superCommandHandler.js");

const API_ADDRESS = config.get("API_ADDRESS");
const BOT_QQ_NUM = config.get("BOT_QQ_NUM");

var socket = io(API_ADDRESS, {
    transports: ['websocket']
});

/*建立连接*/
socket.on("connect",function () {
	socket.emit("GetWebConn", BOT_QQ_NUM, (data) => {
		if(data == "OK" || data == "当前已存在活动的WebSocket 已为您切换当前Socket"){
			log.write("WebSocket连接建立成功.", "WebSocket", "INFO");
		}else{
			log.write("WebSocket连接建立失败.", "WebSocket", "ERROR");
			log.write("WebSocket连接建立失败.", "WebSocket", "ERROR");
			process.exit(true);
		}
	});
});

/*收到群消息*/
socket.on("OnGroupMsgs", function(data){
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
				log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组文字消息", "INFO");
				groupMessageHandler.handleTextMsg(currentMsg);
				break;
			case "PicMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
				}catch(e){
					log.write("解析 <PicMsg> 时出现问题.", "未能解析消息", "ERROR");
				}
				if(tmp.Content != ""){
					currentMsg.Content = tmp.Content;
					log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: [图片]"+currentMsg.Content, "收到群组图文消息", "INFO");
					groupMessageHandler.handleTextMsg(currentMsg);
				}else{
					log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: [图片]", "收到群组图片消息", "INFO");
				}
				break;
			case "AtMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
				}catch(e){
					log.write("解析 <AtMsg> 时出现问题.", "未能解析消息", "ERROR");
				}
				if(tmp.UserID == BOT_QQ_NUM){
					user.getNickname(BOT_QQ_NUM, function(nickname){
						var regexp = eval("/@"+nickname+"/ig");
						currentMsg.Content = tmp.Content.replace(regexp, "");
						log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组@消息", "INFO");
						commandHandler.handleCommand(currentMsg.Content, 2, currentMsg.FromGroupUin, currentMsg.FromUin)
					});
				}else{
					currentMsg.Content = tmp.Content;
					log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组@消息", "INFO");
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
				}
				if(tmp.UserID == BOT_QQ_NUM){
					user.getNickname(BOT_QQ_NUM, function(nickname){
						var regexp = eval("/@"+nickname+"/ig");
						currentMsg.Content = tmp.ReplayContent.replace(regexp, "");
						log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组回复消息", "INFO");
						commandHandler.handleCommand(currentMsg.Content, 2, currentMsg.FromGroupUin, currentMsg.FromUin)
					});
				}else{
					currentMsg.Content = tmp.ReplayContent;
					log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组回复消息", "INFO");
				}
				break;
			case "SmallFaceMsg":
				try{
					currentMsg.Content = JSON.parse(currentMsg.Content).Content;
				}catch(e){
					log.write("解析 <SmallFaceMsg> 时出现问题.", "未能解析消息", "ERROR");
				}
				log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组小表情消息", "INFO");
				break
			case "BigFaceMsg":
				try{
					currentMsg.Content = JSON.parse(currentMsg.Content).Content;
				}catch(e){
					log.write("解析 <BigFaceMsg> 时出现问题.", "未能解析消息", "ERROR");
				}
				log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+currentMsg.Content, "收到群组大表情消息", "INFO");
				break
			case "JsonMsg":
				try{
					tmp = JSON.parse(currentMsg.Content);
				}catch(e){
					log.write("解析 <JsonMsg> 时出现问题.", "未能解析消息", "ERROR");
				}
				var brief = tmp.prompt;
				var url = tmp.meta.news.jumpUrl;
				log.write("<"+currentMsg.FromGroupName+"> - <"+currentMsg.FromNickName+">: "+brief, "收到群组JSON消息", "INFO");
				if(/(x5m.qq.com|mobilex5)/.test(url) === false){
					message.revoke(currentMsg.FromGroupUin, currentMsg.MsgSeq, currentMsg.MsgRandom);
					var msg = "抱歉, 您的信息已被撤回.原因: 本群禁止除QQ炫舞官方及本群爆气表外的分享。";
					message.send(currentMsg.FromGroupUin, msg, currentMsg.RequestType, currentMsg.FromUin);
				}
				break;
			default:
				log.write(currentMsg.MsgType, "未知群组消息类型", "INFO");
				console.log(data);
				break;
		}
	}
});

/*收到好友消息*/
socket.on("OnFriendMsgs", function(data){
	var currentMsg = {};
	currentMsg.MsgType = data.CurrentPacket.Data.MsgType;
	currentMsg.FromUin = data.CurrentPacket.Data.FromUin;
	currentMsg.Content = data.CurrentPacket.Data.Content;
	if(currentMsg.FromUin != BOT_QQ_NUM){
		switch(currentMsg.MsgType){
			case "TextMsg":
				user.getNickname(currentMsg.FromUin, function(nickname){
						log.write("<"+currentMsg.FromUin+"> - <"+nickname+">: "+currentMsg.Content, "收到私聊消息", "INFO");
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
					log.write("<"+currentMsg.FromUin+"> - <"+nickname+">: "+currentMsg.Content, "收到私聊消息", "INFO");
					commandHandler.handleCommand(currentMsg.Content, 3, currentMsg.FromUin, 0, currentMsg.TempUin);
				});
				break;
			default:
				log.write(currentMsg.MsgType, "未知私聊消息类型", "INFO");
				console.log(data);
				break;
		}
	}
});

/*通用事件*/
socket.on("OnEvents", function(data){
	var currentEvent = {};
	currentEvent.EventName = data.CurrentPacket.Data.EventName;
	switch(currentEvent.EventName){
		case "ON_EVENT_GROUP_JOIN":
			currentEvent.FromGroupUin = data.CurrentPacket.Data.EventMsg.FromUin;
			currentEvent.FromUin = data.CurrentPacket.Data.EventData.UserID;
			//获取入群欢迎语
			var welcome = config.get("GROUP_WELCOME")[0];
			if(welcome[currentEvent.FromGroupUin] !== undefined && welcome[currentEvent.FromGroupUin] !== null && welcome[currentEvent.FromGroupUin] != ""){
				var msg = welcome[currentEvent.FromGroupUin];
			}else{
				var msg = welcome["default"];
			}
			message.send(currentEvent.FromGroupUin, msg, 2,currentEvent.FromUin);
			break;
		case "ON_EVENT_GROUP_REVOKE":
			currentEvent.MsgSeq = data.CurrentPacket.Data.EventData.MsgSeq;
			currentEvent.UserID = data.CurrentPacket.Data.EventData.UserID;
			currentEvent.FromGroupUin = data.CurrentPacket.Data.EventMsg.FromUin;
			log.write("群聊: <"+currentEvent.FromGroupUin+">.成员: <"+currentEvent.UserID+">.消息序列号: <"+currentEvent.MsgSeq+">.", "群消息撤回", "INFO");
			break;
		case "ON_EVENT_GROUP_EXIT":
			currentEvent.UserID = data.CurrentPacket.Data.EventData.UserID;
			currentEvent.FromGroupUin = data.CurrentPacket.Data.EventMsg.FromUin;
			user.getNickname(currentEvent.UserID, function(nickname){
				log.write("<"+nickname+"> 退出了群聊<"+currentEvent.FromGroupUin+">.", "成员退群", "INFO");
				var msg = "<"+nickname+"> 退出了群聊, 已永久拉黑.";
				message.send(currentEvent.FromGroupUin, msg);
			});
			break;
		default:
			log.write(currentEvent.EventName, "未知事件", "INFO");
			console.log(data);
			break;
	}
});

/*程序退出事件*/
process.on("exit", (code) => {
	log.write("正在退出进程...", "进程结束", "INFO");
});