const fs = require("fs");
const log = require(`${process.cwd()}/controller/logWriter.js`);

function get(field){
	try{
		var configFile = fs.readFileSync(`${process.cwd()}/config/config.json`);
	}catch(e){
		log.write("Unable to load config/config.json!", "Config Reader", "ERROR");
		log.write("Please check whether the file exists.", "Config Reader", "ERROR");
		process.exit(true);
	}
	try{
		var configObject = JSON.parse(configFile.toString())
	}catch(e){
		log.write("Unable to decode config/config.json!", "Config Reader", "ERROR");
		log.write("Please check your JSON syntax.", "Config Reader", "ERROR");
		process.exit(true);
	}
	var required = configObject["config"][0][field];
	return required !== undefined ? required : false;
}

module.exports = {
	get
}