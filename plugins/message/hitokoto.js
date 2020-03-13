const request = require("request");
const message = require(`${process.cwd()}/controller/messageApi.js`);
const config = require(`${process.cwd()}/controller/configApi.js`);

module.exports = {
	init: function () {
		config.registerPlugin("global", "/(^一言|一言$|hitokoto)/", "hitokoto");
		config.registerPlugin("command", "/(^一言|一言$|hitokoto)/", "hitokoto");
	},
	handle: function(packet){
		var url = encodeURI("https://v1.hitokoto.cn/");
		request(url, function(e, r, b){
			if(!e && r.statusCode == 200){
				try{
					var response = JSON.parse(b);
				}catch(e){
					log.write("无法解析服务器返回的数据.", "HITOKOTO", "WARNING");
					log.write("请检查API是否仍然存活.", "HITOKOTO", "WARNING");
					return false;
				}
				var msg = `${response.hitokoto} ——${response.from}`;
				try{
					var groupId = packet.groupId;
				}catch(e){
					message.send(packet.FromGroupUin, msg, packet.RequestType);
					return true;
				}
				if(groupId !== undefined){
					message.send(packet.FromGroupUin, msg, packet.RequestType, 0, groupId);
				}else{
					message.send(packet.FromGroupUin, msg, packet.RequestType);
				}
			}else{
				log.write("公共API请求失败.", "HITOKOTO", "WARNING");
				return false;
			}
		});
	}
}