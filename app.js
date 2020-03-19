const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);
log.write("**********************************************", "MAIN THREAD", "INFO");
log.write("*                QQBot v1.0.0                *", "MAIN THREAD", "INFO");
log.write("*             Written In Node.js             *", "MAIN THREAD", "INFO");
log.write("*              Build:2020.03.13              *", "MAIN THREAD", "INFO");
log.write("*              Author: Runc2333              *", "MAIN THREAD", "INFO");
log.write("**********************************************", "MAIN THREAD", "INFO");

/* Controller */
const io = require("socket.io-client");
const fs = require("fs");
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const database = require(`${process.cwd().replace(/\\/g, "/")}/controller/database.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
/* Events Handler */
const groupEventHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/event/groupEvents.js`);
const friendEventHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/event/friendEvents.js`);
const systemEventHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/event/systemEvents.js`);

const API_ADDRESS = config.get("global", "API_ADDRESS");
const BOT_QQ_NUM = config.get("global", "BOT_QQ_NUM");
const ENABLE_GROUPS = config.get("global", "ENABLE_GROUPS");

var socket = io(API_ADDRESS, {
    transports: ['websocket']
});

/* 建立连接 */
log.write("正在连接到WebSocket服务器...", "MAIN THREAD", "INFO");
socket.on("connect",function () {
	socket.emit("GetWebConn", BOT_QQ_NUM, (data) => {
		if(data == "OK" || data == "当前已存在活动的WebSocket 已为您切换当前Socket"){
			log.write("WebSocket连接建立成功.", "MAIN THREAD", "INFO");
		}else{
			log.write("WebSocket连接建立失败.", "MAIN THREAD", "ERROR");
			log.write("WebSocket连接建立失败.", "MAIN THREAD", "ERROR");
			process.exit(true);
		}
	});
});

/* 收到群消息 */
socket.on("OnGroupMsgs", function(data){
	if(ENABLE_GROUPS.indexOf(data.CurrentPacket.Data.FromGroupId.toString()) !== -1){
		groupEventHandler.handle(data);
	}
});

/* 收到好友消息 */
socket.on("OnFriendMsgs", function(data){
	friendEventHandler.handle(data);
});

/* 通用事件 */
socket.on("OnEvents", function(data){
	if(ENABLE_GROUPS.indexOf(data.CurrentPacket.Data.EventMsg.FromUin.toString()) !== -1){
		systemEventHandler.handle(data);
	}
});

/* 程序退出事件 */
process.on("exit", (code) => {
	message.send(config.get("global", "GROUP_ADMINS")["0"][0], `进程正在退出, 请检查程序状态.`, 1);
	log.write("正在退出进程...", "进程结束", "INFO");
});

/* 捕获异常 */
process.on("uncaughtException", function (err) {
	console.log(`Caught exception: ${err}`);
	message.send(config.get("global", "GROUP_ADMINS")["0"][0], `捕获到异常, 请尽快查看日志.错误详情: \n${err}`, 1);
});

/* 加载插件 */
log.write("开始载入插件...", "MAIN THREAD", "INFO");
var globalPlugins = fs.readdirSync(`${process.cwd().replace(/\\/g, "/")}/plugins/global`);
for(i=0;i<globalPlugins.length;i++){
	log.write(`已检测到全局插件: ${globalPlugins[i].split(".")[0]}`, "MAIN THREAD", "INFO");
	require(`${process.cwd().replace(/\\/g, "/")}/plugins/global/${globalPlugins[i]}`).init();
}
var messagePlugins = fs.readdirSync(`${process.cwd().replace(/\\/g, "/")}/plugins/message`);
for(i=0;i<messagePlugins.length;i++){
	log.write(`已检测到覆写插件: ${messagePlugins[i].split(".")[0]}`, "MAIN THREAD", "INFO");
	require(`${process.cwd().replace(/\\/g, "/")}/plugins/message/${messagePlugins[i]}`).init();
}
log.write("插件载入完毕.", "MAIN THREAD", "INFO");