/* Controller */
const config = require(`${process.cwd()}/controller/configReader.js`);
const log = require(`${process.cwd()}/controller/logWriter.js`);
const message = require(`${process.cwd()}/controller/messageApi.js`);
const user = require(`${process.cwd()}/controller/userApi.js`);
/* Message Handler */
const groupMessageHandler = require(`${process.cwd()}/handler/message/groupMessageHandler.js`);
const XMLMessageHandler = require(`${process.cwd()}/handler/message/XMLMessageHandler.js`);
/* Command Handler */
const commandHandler = require(`${process.cwd()}/handler/command/commandHandler.js`);
const superCommandHandler = require(`${process.cwd()}/handler/command/superCommandHandler.js`);

const BOT_QQ_NUM = config.get("BOT_QQ_NUM");

function handle(data){
    var currentEvent = {};
    currentEvent.EventName = data.CurrentPacket.Data.EventName;
    currentEvent.FromGroupUin = data.CurrentPacket.Data.EventMsg.FromUin;
    switch(currentEvent.EventName){
        case "ON_EVENT_GROUP_JOIN":
            currentEvent.FromUin = data.CurrentPacket.Data.EventData.UserID;
            //获取入群欢迎语
            var welcome = config.get("GROUP_WELCOME")[0];
            if(welcome[currentEvent.FromGroupUin] !== undefined && welcome[currentEvent.FromGroupUin] !== null && welcome[currentEvent.FromGroupUin] != ""){
                var msg = welcome[currentEvent.FromGroupUin];
            }else{
                var msg = welcome["default"];
            }
            message.send(currentEvent.FromGroupUin, msg, 2,currentEvent.FromUin);
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
        default:
            log.write(currentEvent.EventName, "未知事件", "INFO");
            console.log(data);
            break;
    }
}

module.exports = {
    handle
}