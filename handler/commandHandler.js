const fs = require("fs");
const request = require("request");
const config = require("../controller/configReader.js");
const message = require("../controller/messageApi.js");
const log = require("../controller/logWriter.js");

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
			var regexp = eval(key);
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
			fs.exists("./plugins/"+action+".js", function(exists){
				if(exists){
					log.write("重定向到"+action+".js处理", "CommandHandler", "INFO");
					const eventHandler = require("../plugins/"+action+".js");
					eventHandler.handle(packet);
				}else{
					log.write("未找到对应的事件处理程序.", "CommandHandler", "WARNING");
				}
			});
		}
	}else{
		var url = encodeURI("http://api.qingyunke.com/api.php?key=free&appid=0&msg="+command);
		request(url, function(e, r, b){
			if(!e && r.statusCode == 200){
				try{
					var response = JSON.parse(b);
				}catch(e){
					log.write("无法解析服务器返回的数据.", "公共聊天API", "WARNING");
					log.write("请检查API是否仍然存活.", "公共聊天API", "WARNING");
					return false;
				}
				var msg = response.content.replace(/菲菲/ig, BOT_NAME).replace("{face:", "[表情").replace("}", "]");
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