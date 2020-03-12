const message = require(`${process.cwd()}/controller/messageApi.js`);
const config = require(`${process.cwd()}/controller/configApi.js`);
//获取打招呼用的语句
module.exports = {
	handle: function(packet){
		var greeting = config.get("DEFAULT_GREETING");
		var msg = greeting[parseInt(Math.random() * greeting.length, 10)];
		if(packet.RequestType == 2){
			message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
		}else{
			try{
				var groupId = packet.groupId;
			}catch(e){
				message.send(packet.FromGroupUin, msg, packet.RequestType);
				return true;
			}
			if(groupId !== undefined){
				message.send(packet.FromGroupUin, msg, packet.RequestType, 0, groupId);
			}
		}
	}
}