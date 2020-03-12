const request = require("request");
const crypto = require("crypto");
const log = require(`${process.cwd()}/controller/logger.js`);
const config = require(`${process.cwd()}/controller/configApi.js`);

function translate(source, callback){
	var from = "auto";
	var to = "en";
	var q = source;
	var appid = config.get("BAIDU_TRANSLATE_APPID");
	var key = config.get("BAIDU_TRANSLATE_KEY");
	var salt = Math.random().toString();
	var sign = crypto.createHash("md5").update(appid+q+salt+key).digest("hex");
	var url = encodeURI(`http://api.fanyi.baidu.com/api/trans/vip/translate?q=${q}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`);
	request(url, function(e, r, b){
		if(!e && r.statusCode == 200){
			try{
				var response = JSON.parse(b);
			}catch(e){
				log.write("无法解析服务器返回的数据.", "HITOKOTO", "WARNING");
				log.write("请检查API是否仍然存活.", "HITOKOTO", "WARNING");
				return false;
			}
			var translated = response.trans_result[0].dst
			callback(translated);
		}else{
			log.write("公共API请求失败.", "TRANSLATE", "WARNING");
			return false;
		}
	});
}

module.exports = {
	translate
}