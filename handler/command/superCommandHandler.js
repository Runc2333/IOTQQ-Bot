const config = require(`${process.cwd()}/controller/configApi.js`);
const message = require(`${process.cwd()}/controller/messageApi.js`);
const log = require(`${process.cwd()}/controller/logger.js`);

function handle(packet){
	if(packet.Content.match(/\/[a-z]{2,10}/i) !== null){
		var superCommand = packet.Content.match(/(?<=\/)[a-z]{2,10}/i)[0];
		var regeistedSuperCommand = config.get("global", "SUPER_COMMAND_REGISTRY");
		for (key in regeistedSuperCommand) {
			if (superCommand == key) {
				log.write(`重定向到${regeistedSuperCommand[key].script}处理`, "SuperCommandHandler", "INFO");
				require(`${process.cwd()}/plugins/global/${regeistedSuperCommand[key].script}`)[regeistedSuperCommand[key].handler](packet);
			}
		}
	}else{
		log.write("未匹配到指令.", "SuperCommandHandler", "INFO");
	}
}

module.exports = {
	handle
}