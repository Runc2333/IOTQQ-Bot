const fs = require("fs");
const request = require("request");
const config = require(`${process.cwd()}/controller/configReader.js`);
const message = require(`${process.cwd()}/controller/messageApi.js`);
const log = require(`${process.cwd()}/controller/logWriter.js`);

const BOT_QQ_NUM = config.get("BOT_QQ_NUM");

function handleCommand(command, type, to, at = 0, group = 0){
	//获取基本信息
	var BOT_NAME = config.get("BOT_NAME");
	//获取正则表达式
	var REGEX = config.get("MESSAGE_OVERWRITE_COMMAND_REGEX")[0];
	var length = 0;
	for(tmp in REGEX){
		length++;
	}
	var data = {};
	if(length > 0){
		for(key in REGEX){
			var regexp = eval(key.replace(/\{BOT_NAME\}/g, BOT_NAME));//替换掉正则表达式*字符串*里的机器人名字 同时转化为正则表达式对象
			if(regexp.test(command)){
				data.msg = REGEX[key][0];
				data.at = REGEX[key][1];
			}
		}
	}
	if(data.msg !== null && data.msg !== undefined){
		if(/^@.+/.test(data.msg) === false){
			message.send(to, data.msg, type, data.at);
		}else{
			var action = data.msg.replace(/^@/, "");
			var packet = {};
			packet.FromGroupUin = to;
			packet.RequestType = type;
			packet.groupId = group;
			fs.exists(`${process.cwd()}/plugins/message/${action}.js`, function(exists){
				if(exists){
					log.write(`重定向到${action}.js处理`, "CommandHandler", "INFO");
					const eventHandler = require(`${process.cwd()}/plugins/message/${action}.js`);
					eventHandler.handle(packet);
				}else{
					log.write("未找到对应的事件处理程序.", "CommandHandler", "WARNING");
				}
			});
		}
	}else{
		var url = encodeURI(`http://api.tianapi.com/txapi/robot/index?key=${config.get("TIANXING_API_KEY")}&question=${command}&userid=${at}`);
		request(url, function(e, r, b){
			if(!e && r.statusCode == 200){
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
}