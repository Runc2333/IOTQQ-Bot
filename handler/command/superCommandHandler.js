const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);
const database = require(`${process.cwd().replace(/\\/g, "/")}/controller/database.js`);

function handle(packet){
	if(packet.Content.match(/\/[a-z]{1,10}/i) !== null){
		var superCommand = packet.Content.match(/(?<=\/)[a-z]{1,10}/i)[0];
		var regeistedSuperCommand = config.get("global", "SUPER_COMMAND_REGISTRY");
		for (key in regeistedSuperCommand) {
			if (superCommand == key) {
				log.write(`重定向到${regeistedSuperCommand[key].script}处理`, "SuperCommandHandler", "INFO");
				require(`${process.cwd().replace(/\\/g, "/")}/plugins/global/${regeistedSuperCommand[key].script}`)[regeistedSuperCommand[key].handler](packet);
			}
		}
	}else{
		//do something
		database.saveMessage(packet.FromUin, packet.FromGroupUin, packet.Content, packet.MsgSeq, packet.MsgRandom);
	}
}

module.exports = {
	handle
}