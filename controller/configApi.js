const fs = require("fs");
const log = require(`${process.cwd()}/controller/logger.js`);

const configFilePath = `${process.cwd()}/config/config.json`;

function readFileConfigIntoObject() {
	try {
		var configFile = fs.readFileSync(configFilePath);
	} catch (e) {
		log.write("Unable to load config/config.json!", "Config API", "ERROR");
		log.write("Please check whether the file exists.", "Config API", "ERROR");
		process.exit(true);
	}
	try {
		var configObject = JSON.parse(configFile.toString())
	} catch (e) {
		log.write("Unable to decode config/config.json!", "Config API", "ERROR");
		log.write("Please check your JSON syntax.", "Config API", "ERROR");
		process.exit(true);
	}
	return configObject;
}

function get(section, field = null) {
	var configObject = readFileConfigIntoObject();
	try {
		if (field === null) {
			var required = configObject[section];
		} else {
			var required = configObject[section][field];
		}
	} catch (e) {
		var required = undefined;
	}
	return required === undefined ? false : required;
}

function write(section, data, field = null) {
	var configObject = readFileConfigIntoObject();
	if (field === null) {
		configObject[section] = data;//填入数据
	} else {
		configObject[section][field] = data;//填入数据
	}
	var configString = JSON.stringify(configObject, null, "\t");//格式化json
	try {
		fs.writeFileSync(configFilePath, configString);//写入
	} catch (e) {
		log.write("Unable to write config/config.json!", "Config API", "ERROR");
		log.write("Please check your JSON syntax.", "Config API", "ERROR");
		process.exit(true);
	}
}

function registerPlugin(type, regex, handler) {
	switch (type) {
		case "global":
			var config = get("global", "MESSAGE_GLOBAL_REGEX");
			config[handler] = regex.toString();
			write("global", config, "MESSAGE_GLOBAL_REGEX");
			break;
		case "command":
			var config = get("global", "MESSAGE_OVERWRITE_COMMAND_REGEX");
			config[regex.toString()] = {
				"msg": `@${handler}`,
				"at": "0"
			};
			write("global", config, "MESSAGE_OVERWRITE_COMMAND_REGEX");
			break;
		case "supercommand":
			var config = get("global", "MESSAGE_OVERWRITE_COMMAND_REGEX");
			// config[] = "";
			break;
		case group:
			var config = get("global", "MESSAGE_GROUP_REGEX");
			config[handler] = regex.toString();
			write("global", config, "MESSAGE_GROUP_REGEX");
			break;
		default:
			break;
	}
	var sections = { "global": "全局匹配", "command": "命令匹配", "supercommand": "超级命令", "group": "特定群组" };
	log.write(`插件<${handler}>已注册到${sections[type]}.`, "Config API", "INFO");
}

module.exports = {
	get,
	write,
	registerPlugin
}