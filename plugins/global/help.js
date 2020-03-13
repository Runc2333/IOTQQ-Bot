const config = require(`${process.cwd()}/controller/configApi.js`);
const message = require(`${process.cwd()}/controller/messageApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);

function init() {
    config.registerSuperCommand("help", "help.js", "displayHelpInfo", "显示指令帮助.");
}

function displayHelpInfo(packet) {
    var SUPER_COMMAND_REGISTRY = config.get("global", "SUPER_COMMAND_REGISTRY");
    var msg = "以下是目前注册到系统的所有指令:\n";
    for (key in SUPER_COMMAND_REGISTRY) {
        if (SUPER_COMMAND_REGISTRY[key]["argument"] === "") {
            msg += `/${key}: ${SUPER_COMMAND_REGISTRY[key]["description"]}\n`;
        } else {
            msg += `/${key} ${SUPER_COMMAND_REGISTRY[key]["argument"]}: ${SUPER_COMMAND_REGISTRY[key]["description"]}\n`;
        }
    }
    message.send(packet.FromGroupUin, msg, packet.RequestType);
}

module.exports = {
    init,
    displayHelpInfo
}