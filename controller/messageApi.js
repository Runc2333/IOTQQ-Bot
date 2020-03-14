const request = require("sync-request");
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);
const translate = require(`${process.cwd().replace(/\\/g, "/")}/controller/translate.js`);
const database = require(`${process.cwd().replace(/\\/g, "/")}/controller/database.js`);

function send(to, msg, type = 2, at = 0, groupId = 0) {
	var data = {};
	data.toUser = parseFloat(to);
	data.sendToType = parseFloat(type);
	data.sendMsgType = "TextMsg";
	data.content = at == 0 ? msg : ` ${msg}`;
	data.groupid = parseFloat(groupId);
	data.atUser = parseFloat(at);
	var url = `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=SendMsg&timeout=10`;
	var res = request("POST", url, {
		json: data
	});
	try {
		var response = JSON.parse(res.getBody("utf8"));
	} catch (e) {
		console.log(res.getBody("utf8"));
		log.write("无法解析服务器返回的数据.", "消息发送失败", "WARNING");
		log.write("请检查后端服务器是否工作正常.", "消息发送失败", "WARNING");
		return false;
	}
	if (response.Ret == 0) {
		log.write(`送往: <${to}>.内容: <${msg}>`, "消息已送达", "INFO");
	} else {
		console.log(res.getBody("utf8"));
		log.write(`错误信息: <${response.Msg}>`, "消息发送失败", "WARNING");
		return false;
	}
}

function revoke(GroupId, MsgSeq, MsgRandom = 0) {
	if (MsgRandom === 0) {
		var tmp = database.getMessageBySeqAndGuin(MsgSeq, GroupId).random;
		if (tmp !== false) {
			MsgRandom = tmp;
		}
	}
	var data = {};
	data.GroupID = parseFloat(GroupId);
	data.MsgSeq = parseFloat(MsgSeq);
	data.MsgRandom = parseFloat(MsgRandom);
	// data = JSON.stringify(data);
	var url = `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=RevokeMsg&timeout=10`;
	var res = request("POST", url, {
		json: data
	});
	try {
		var response = JSON.parse(res.getBody("utf8"));
	} catch (e) {
		console.log(res.getBody("utf8"));
		log.write("无法解析服务器返回的数据.", "消息撤回失败", "WARNING");
		log.write("请检查后端服务器是否工作正常.", "消息撤回失败", "WARNING");
		return false;
	}
	if (response.Ret == 0) {
		log.write(`群聊: <${GroupId}>.消息序列号: <${MsgSeq}>`, "消息已撤回", "INFO");
		send(GroupId, "[消息撤回] Sequency: <${MsgSeq}>.");
	} else {
		console.log(res.getBody("utf8"));
		log.write(`错误信息: <${response.Msg}>`, "消息撤回失败", "WARNING");
		send(GroupId, `[消息撤回失败] Sequency: <${MsgSeq}>.`);
		return false;
	}
}

function sendImage(to, picUrl, type = 2, at = 0, groupId = 0) {
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
	// data = JSON.stringify(data);
	var url = `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=SendMsg&timeout=10`;
	var res = request("POST", url, {
		json: data
	});
	try {
		var response = JSON.parse(res.getBody("utf8"));
	} catch (e) {
		console.log(res.getBody("utf8"));
		log.write("无法解析服务器返回的数据.", "图片发送失败", "WARNING");
		log.write("请检查后端服务器是否工作正常.", "图片发送失败", "WARNING");
		return false;
	}
	if (response.Ret == 0) {
		log.write(`送往: <${to}>.图片URL: <${picUrl}>`, "图片已送达", "INFO");
	} else {
		console.log(res.getBody("utf8"));
		log.write(`错误信息: <${response.Msg}>`, "图片发送失败", "WARNING");
		return false;
	}
}

function mute(groupId, user, time) {
	var data = {};
	data.GroupID = parseFloat(groupId);
	data.ShutUpUserID = parseFloat(user);
	data.ShutTime = parseFloat(time);
	// data = JSON.stringify(data);
	var url = `${config.get("global", "API_ADDRESS")}/v1/LuaApiCaller?qq=${config.get("global", "BOT_QQ_NUM")}&funcname=OidbSvc.0x570_8&timeout=10`;
	var res = request("POST", url, {
		json: data
	});
	try {
		var response = JSON.parse(res.getBody("utf8"));
	} catch (e) {
		console.log(res.getBody("utf8"));
		log.write("无法解析服务器返回的数据.", "用户禁言失败", "WARNING");
		log.write("请检查后端服务器是否工作正常.", "用户禁言失败", "WARNING");
		return false;
	}
	if (response.Ret == 0) {
		log.write(`群组: <${groupId}>.用户: <${user}>`, "已禁言用户", "INFO");
	} else {
		console.log(res.getBody("utf8"));
		log.write(`错误信息: <${response.Msg}>`, "用户禁言失败", "WARNING");
		return false;
	}
}

module.exports = {
	send,
	revoke,
	sendImage,
	mute
}