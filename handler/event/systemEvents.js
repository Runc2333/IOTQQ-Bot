const gm = require("gm");
/* Controller */
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const user = require(`${process.cwd().replace(/\\/g, "/")}/controller/userApi.js`);
/* Message Handler */
const groupMessageHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/message/groupMessageHandler.js`);
const XMLMessageHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/message/XMLMessageHandler.js`);
/* Command Handler */
const commandHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/command/commandHandler.js`);
const superCommandHandler = require(`${process.cwd().replace(/\\/g, "/")}/handler/command/superCommandHandler.js`);

const BOT_QQ_NUM = config.get("global", "BOT_QQ_NUM");

function handle(data){
    var currentEvent = {};
    currentEvent.EventName = data.CurrentPacket.Data.EventName;
    currentEvent.FromGroupUin = data.CurrentPacket.Data.EventMsg.FromUin;
    switch(currentEvent.EventName){
        case "ON_EVENT_GROUP_JOIN":
            currentEvent.FromUin = data.CurrentPacket.Data.EventData.UserID;
            //获取入群欢迎语
            var welcome = config.get("global", "GROUP_WELCOME");
            if(welcome[currentEvent.FromGroupUin] !== undefined && welcome[currentEvent.FromGroupUin] !== null && welcome[currentEvent.FromGroupUin] != ""){
                var msg = welcome[currentEvent.FromGroupUin];
            }else{
                var msg = welcome["default"];
            }
            message.send(currentEvent.FromGroupUin, msg, 2, currentEvent.FromUin);
            //发送滥权之家表情包
            user.getNickname(currentEvent.FromUin, function (nickname) {
                gm(`${process.cwd().replace(/\\/g, "/")}/images/welcome.png`).font(`${process.cwd().replace(/\\/g, "/")}/fonts/FZMingSTJW.TTF`, 42).drawText(0, -140, `你好, ${nickname}`, "Center").resize(250, 191, "!").toBuffer(function (e, b) {
                    var tmp = b.toString("base64");
                    setTimeout(function () {
                        message.sendImageBase64(currentEvent.FromGroupUin, tmp, 2);
                    }, 1000);
                });
            })
            break;
        case "ON_EVENT_GROUP_REVOKE":
            currentEvent.MsgSeq = data.CurrentPacket.Data.EventData.MsgSeq;
            currentEvent.UserID = data.CurrentPacket.Data.EventData.UserID;
            log.write(`群聊: <${currentEvent.FromGroupUin}>.成员: <${currentEvent.UserID}>.消息序列号: <${currentEvent.MsgSeq}>.`, "群消息撤回", "INFO");
            break;
        case "ON_EVENT_GROUP_EXIT":
            currentEvent.UserID = data.CurrentPacket.Data.EventData.UserID;
            user.getNickname(currentEvent.UserID, function(nickname){
                log.write(`<${nickname}> 退出了群聊<${currentEvent.FromGroupUin}>.`, "成员退群", "INFO");
                var msg = `<${nickname}> 离开了群聊.`;
                message.send(currentEvent.FromGroupUin, msg);
            });
            break;
        case "ON_EVENT_GROUP_SHUT":
            log.write(`群聊<${currentEvent.FromGroupUin}> - 用户: <${data.CurrentPacket.Data.EventData.UserID}> 被禁言 <${data.CurrentPacket.Data.EventData.ShutTime}> 秒.`, "成员禁言", "INFO")
            break;
        default:
            log.write(currentEvent.EventName, "未知事件", "INFO");
            console.log(data);
            break;
    }
}

module.exports = {
    handle
}