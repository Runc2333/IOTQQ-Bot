const config = require(`${process.cwd()}/controller/configApi.js`);
const message = require(`${process.cwd()}/controller/messageApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);
const antispam = require(`${process.cwd()}/controller/antispam.js`);

function spamban(packet){
	var msg = "[触发消息审计] 正在检查消息内容...";
	message.send(packet.FromGroupUin, msg, packet.RequestType);
	antispam.scanTextMsg(packet.SrcContent, function(result){
		if(result !== true){
			message.revoke(packet.FromGroupUin, packet.SrcMsgSeq, 0);
			setTimeout(function(){
				var msg = `您的信息触发了审计规则.详情:\\n${result}.`;
				message.send(packet.FromGroupUin, msg, packet.RequestType, packet.SrcFromUin);
			},1000);
		}else{
			setTimeout(function(){
				var msg = "[消息审计] 消息不含违规内容.";
				message.send(packet.FromGroupUin, msg, packet.RequestType);
			},1000);
		}
	});
}

function handle(packet){
	if(packet.Content.match(/\/[a-z]{2,10}/i) !== null){
		var superCommand = packet.Content.match(/\/[a-z]{2,10}/i)[0];
		switch(superCommand){
			case "/sb":
				spamban(packet);
				break;
			case "/spamban":
				spamban(packet);
				break;
			default:
				return false;
				break;
		}
	}else{
		return false;
	}
}

module.exports = {
	handle
}