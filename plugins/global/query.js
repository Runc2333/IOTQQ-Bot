const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const database = require(`${process.cwd().replace(/\\/g, "/")}/controller/database.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const user = require(`${process.cwd().replace(/\\/g, "/")}/controller/userApi.js`);

function init() {
    config.registerSuperCommand("query", "query.js", "query", "查找指定用户的黑屁证据.\n[uin]: 目标用户QQ号\n<keyword>: 关键词\n<page>: 页数", "[uin] <keyword> <page>");
}

function query(packet) {
    var command = packet.Content.match(/(?<=\/)[a-z]{1,10}\s\d{5,10}.+$/i);
    if (command !== null) {
        var parameters = command[0].split(" ");
    } else {
        var msg = "请提供参数.";
        message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
        return false;
    }
    var tmp = { 1: "uin", 2: "keyword", 3: "page" };
    var queryParameter = {};
    for (i = 1; i < 4; i++) {
        if (parameters[i] === undefined || parameters[i] == "<blank>") {
            queryParameter[tmp[i]] = "";
        } else {
            queryParameter[tmp[i]] = parameters[i];
        }
    }
    var messages = database.getMessageByUinAndContentAndGuin(queryParameter.uin, packet.FromGroupUin, queryParameter.keyword);
    var start = parseInt(queryParameter.page === "" ? 0 : queryParameter.page);
    var limit = parseInt(messages.length > start + 5 ? start + 5 : messages.length);
    var end = parseInt(start + 5 > messages.length - 1 ? messages.length - 1 : start + 4);
    if ((queryParameter.page == "" ? 0 : parseInt(queryParameter.page) > messages.length) || messages.length == 0) {
        var msg = "在指定的范围和条件内未查询到结果.";
        message.send(packet.FromGroupUin, msg);
        return;
    }
    var msg = `针对查询共找到${messages.length}个结果, 正在显示第${start}~${end < 0 ? 0 : end}条:\n\n`;
    for (i = start; i < limit; i++){
        var date = new Date(parseFloat(messages[i].time.toString() + "000"));
        var time = (
            date.getFullYear()
            + "-" +
            ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1))
            + "-" +
            (date.getDate() < 10 ? "0" + date.getDate() : date.getDate())
            + " " +
            (date.getHours() < 10 ? "0" + date.getHours() : date.getHours())
            + ":" +
            (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
            + ":" +
            (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())
        ).toString();
        msg += `[${time}] <${messages[i].uin}>\n${messages[i].content}\n`;
    }
    console.log("limit: " + limit);
    console.log("start: " + start);
    console.log("end: " + end);
    console.log("messages.length: " + messages.length);
    if (start + 2 > messages.length - 1) {
        //do nothing
    } else {
        msg += `\n若要查看下一页, 请使用/query ${queryParameter.uin} ${queryParameter.keyword == "" ? "<blank>" : queryParameter.keyword} ${end + 1}`;
    }
    message.send(packet.FromGroupUin, msg);
}

module.exports = {
    init,
    query
};