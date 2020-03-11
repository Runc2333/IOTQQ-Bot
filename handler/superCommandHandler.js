const config = require("../controller/configReader.js");
const message = require("../controller/messageApi.js");
const log = require("../controller/logWriter.js");
const antispam = require("../controller/antispam.js");

function spamban(packet){
	antispam.scanTextMsg(packet.SrcContent, function(result){
		if(result !== true){
			message.revoke(packet.FromGroupUin, packet.SrcMsgSeq, 0);
			var msg = "您的信息触发了审计规则.详情:\n"+result+".";
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.SrcFromUin);
		}else{
			//do nothing
		}
	});
}

function handle(packet){
	if(packet.Content.match(/\/.+/i) !== null){
		var superCommand = packet.Content.match(/\/.+/i)[0];
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