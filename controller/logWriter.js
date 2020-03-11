const fs = require("fs");

function write(msg, event, level = "INFO"){
	var date = new Date();
	var time = (
		date.getFullYear()
		+"-"+
		((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1))
		+"-"+
		(date.getDate() < 10 ? "0" + date.getDate() : date.getDate())
		+" "+
		(date.getHours() < 10 ? "0" + date.getHours() : date.getHours())
		+":"+
		(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
		+":"+
		(date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())
	).toString();
	msg = msg.replace(new RegExp("\\n","gm"), " ");
	switch(level){
		case "INFO":
			var data = "["+time+"] ["+level+"] ["+event+"] : "+msg+"\n";
			break;
		case "WARNING":
			var data = "["+time+"] ["+level+"] ["+event+"] : "+msg+"\n";
			break;
		case "ERROR":
			var data = "["+time+"] ["+level+"] ["+event+"] : "+msg+"\n";
			break;
		default:
			var data = "["+time+"] ["+event+"] ["+level+"] : "+msg+"\n";
			break;
	}
	fs.appendFile("./server.log", data, function(err){
		if(err){
			console.log("无法写入日志.");
			process.exit(true);
		}
	});
	switch(level){
		case "INFO":
			var log = "["+time+"] \033[40;97m["+level+"]\033[0m ["+event+"] : "+msg;
			break;
		case "WARNING":
			var log = "["+time+"] \033[44;97m["+level+"]\033[0m ["+event+"] : "+msg;
			break;
		case "ERROR":
			var log = "["+time+"] \033[41;97m["+level+"]\033[0m ["+event+"] : "+msg;
			break;
		default:
			var log = "["+time+"] ["+level+"] ["+event+"] : "+msg;
			break;
	}
	console.log(log);
}

module.exports = {
	write
}