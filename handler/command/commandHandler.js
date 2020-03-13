const fs = require("fs");
const request = require("request");
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);

function handleCommand(command, type, to, at = 0, group = 0){
	//获取基本信息
	var BOT_NAME = config.get("global", "BOT_NAME");
	//获取正则表达式
	var REGEX = config.get("global", "MESSAGE_OVERWRITE_COMMAND_REGEX");
	var length = 0;
	for(var tmp in REGEX){
		length++;
	}
	var data = {};
	if(length > 0){
		for(var key in REGEX){
			var regexp = eval(key.replace(/\{BOT_NAME\}/g, BOT_NAME));//替换掉正则表达式*字符串*里的机器人名字 同时转化为正则表达式对象
			if(regexp.test(command)){
				data.msg = REGEX[key].msg;
				data.at = REGEX[key].at;
			}
		}
	}
	if(data.msg !== null && data.msg !== undefined){
		if(/^@.+/.test(data.msg) === false){
			message.send(to, data.msg, type, data.at);//普通消息 直接发送
		}else{
			var action = data.msg.replace(/^@/, "");//以@开头 转发给对应的插件处理
			var packet = {};
			packet.FromGroupUin = to;
			packet.RequestType = type;
			packet.groupId = group;
			fs.exists(`${process.cwd().replace(/\\/g, "/")}/plugins/message/${action}.js`, function(exists){
				if(exists){
					log.write(`重定向到${action}.js处理`, "CommandHandler", "INFO");
					const eventHandler = require(`${process.cwd().replace(/\\/g, "/")}/plugins/message/${action}.js`);
					eventHandler.handle(packet);
				}else{
					log.write("未找到对应的事件处理程序.", "CommandHandler", "WARNING");
				}
			});
		}
	}else{
		var url = encodeURI(`http://api.tianapi.com/txapi/robot/index?key=${config.get("global", "TIANXING_API_KEY")}&question=${command}&userid=${at}`);
		request(url, function(e, r, b){
			if (!e && r.statusCode == 200) {
				try{
					var response = JSON.parse(b);
				}catch(e){
					log.write("无法解析服务器返回的数据.", "公共聊天API", "WARNING");
					log.write("请检查API是否仍然存活.", "公共聊天API", "WARNING");
					return false;
				}
				var msg = response.newslist[0].reply.replace(/\{robotname\}/ig, "老人机").replace(/\{appellation\}/ig, "你");
				message.send(to, msg, type, at, group);
			}else{
				log.write("公共API请求失败.", "公共聊天API", "WARNING");
				return false;
			}
		});
		return false;
	}
}

module.exports = {
	handleCommand
};