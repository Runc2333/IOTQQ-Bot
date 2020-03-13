const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);

module.exports = {
	init: function () {
		log.write("guide.js已加载, 这是一个手动插件, 不会自动注册.", "GUIDE", "INFO");
	},
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