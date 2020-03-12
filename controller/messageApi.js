const request = require("request");
const config = require(`${process.cwd()}/controller/configApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);
const translate = require(`${process.cwd()}/controller/translate.js`);

function send(to, msg, type = 2, at = 0, groupId = 0){
	var data = {};
	data.toUser = parseFloat(to);
	data.sendToType = parseFloat(type);
	data.sendMsgType = "TextMsg";
	data.content = at == 0 ? msg : ` ${msg}`;
	data.groupid = parseFloat(groupId);
	data.atUser = parseFloat(at);
	data = JSON.stringify(data);
	request.post({
		url: `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=SendMsg&timeout=10`,
		headers: {
			"Content-Type": "application/json",
		},
		body: data,
	},function(e, r, b){
		try{
			var response = JSON.parse(b);
		}catch(e){
			log.write("无法解析服务器返回的数据.", "消息发送失败", "WARNING");
			log.write("请检查后端服务器是否工作正常.", "消息发送失败", "WARNING");
			return false;
		}
		if(response.Ret == 0){
			log.write(`送往: <${to}>.内容: <${msg}>`, "消息已送达", "INFO");
		}else{
			//console.log(response);
			log.write(`错误信息: <${response.Msg}>`, "消息发送失败", "WARNING");
			return false;
		}
	});
}

function revoke(GroupId, MsgSeq, MsgRandom = 0){
	var data = {};
	data.GroupID = parseFloat(GroupId);
	data.MsgSeq = parseFloat(MsgSeq);
	data.MsgRandom = parseFloat(MsgRandom);
	data = JSON.stringify(data);
	request.post({
		url: `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=RevokeMsg&timeout=10`,
		headers: {
			"Content-Type": "application/json",
		},
		body: data,
	},function(e, r, b){
		try{
			var response = JSON.parse(b);
		}catch(e){
			log.write("无法解析服务器返回的数据.", "消息撤回失败", "WARNING");
			log.write("请检查后端服务器是否工作正常.", "消息撤回失败", "WARNING");
			return false;
		}
		if(response.Ret == 0){
			log.write(`群聊: <${GroupId}>.消息序列号: <${MsgSeq}>`, "消息已撤回", "INFO");
		}else{
			//console.log(response);
			log.write(`错误信息: <${response.Msg}>`, "消息撤回失败", "WARNING");
			return false;
		}
	});
}

function sendImage(to, picUrl, type = 2, at = 0, groupId = 0){
	var data = {};
	data.toUser = parseFloat(to);
	data.sendToType = parseFloat(type);
	data.sendMsgType = "PicMsg";
	data.content = "";
	// data.content = at == 0 ? msg : ` ${msg}`;
	data.groupid = parseFloat(groupId);
	data.atUser = parseFloat(at);
	data.picUrl = picUrl;
	data.picBase64Buf = "";
	data.fileMd5 = "";
	data = JSON.stringify(data);
	request.post({
		url: `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=SendMsg&timeout=10`,
		headers: {
			"Content-Type": "application/json",
		},
		body: data,
	},function(e, r, b){
		try{
			var response = JSON.parse(b);
		}catch(e){
			console.log(response);
			console.log(data);
			log.write("无法解析服务器返回的数据.", "图片发送失败", "WARNING");
			log.write("请检查后端服务器是否工作正常.", "图片发送失败", "WARNING");
			return false;
		}
		if(response.Ret == 0){
			log.write(`送往: <${to}>.图片URL: <${picUrl}>`, "图片已送达", "INFO");
		}else{
			console.log(response);
			console.log(data);
			log.write(`错误信息: <${response.Msg}>`, "图片发送失败", "WARNING");
			return false;
		}
	});
}

module.exports = {
	send,
	revoke,
	sendImage
}