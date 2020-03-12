const message = require(`${process.cwd()}/controller/messageApi.js`);
module.exports = {
	handle: function(packet){
		var msg = "\n在线爆点查询地址: mobilex5.com\n使用说明: mobilex5.com/document";
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