const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);

function init() {
    config.registerSuperCommand("help", "help.js", "displayHelpInfo", "显示指令帮助.");
}

function displayHelpInfo(packet) {
    var SUPER_COMMAND_REGISTRY = config.get("global", "SUPER_COMMAND_REGISTRY");
    var msg = "以下是目前注册到系统的所有指令:\n\n";
    for (key in SUPER_COMMAND_REGISTRY) {
        if (SUPER_COMMAND_REGISTRY[key]["argument"] === "") {
            // var placeholder = new Array(key.length + 2).join("-");
            msg += `/${key}\n${SUPER_COMMAND_REGISTRY[key]["description"]}\n\n`;
        } else {
            // var placeholder = new Array((key.length) + (SUPER_COMMAND_REGISTRY[key]["argument"].length) + 3).join("-");
            msg += `/${key} ${SUPER_COMMAND_REGISTRY[key]["argument"]}\n${SUPER_COMMAND_REGISTRY[key]["description"]}\n\n`;
        }
    }
    msg += "\n[paramater]代表必须参数, 请使用实际值替换, 不需要包含方括号\n<parameter>代表可选参数, 请使用实际值替换, 不需要包含尖括号.";
    message.send(packet.FromGroupUin, msg, packet.RequestType);
}

module.exports = {
    init,
    displayHelpInfo
}