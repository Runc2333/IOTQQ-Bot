const xmlreader = require("xmlreader");
const message = require("../controller/messageApi.js");
const log = require("../controller/logWriter.js");

function handle(packet){
	xmlreader.read(packet.Content, function(e, r){
		/*
		var url = r.msg.attributes().url;
		*/
		try{
			var brief = r.msg.attributes().brief;
		}catch(e){
			var brief = "这条消息没有Brief.";
		}
		try{
			var summary = r.msg.item.array[0].summary.text();
		}catch(e){
			var summary = null;
		}
		log.write("<"+packet.FromGroupName+"> - <"+packet.FromNickName+">: "+brief, "收到群组XML消息", "INFO");
		if(summary == "推荐群聊"){
			message.revoke(packet.FromGroupUin, packet.MsgSeq, packet.MsgRandom);
			var msg = "您的信息触发了审计规则.详情:\n本群禁止任何类型的群聊推荐.";
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
		}
		if(summary == "推荐好友"){
			message.revoke(packet.FromGroupUin, packet.MsgSeq, packet.MsgRandom);
			var msg = "您的信息触发了审计规则.详情:\n本群禁止任何类型的好友推荐.";
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
		}
		/*
		if(/(x5m.qq.com|mobilex5)/.test(url) === false){
			message.revoke(packet.FromGroupUin, packet.MsgSeq, packet.MsgRandom);
			var msg = "抱歉, 您的信息已被撤回.原因: 本群禁止除QQ炫舞官方及本群爆气表外的分享.";
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
		}
		*/
	});
}

module.exports = {
	handle
}