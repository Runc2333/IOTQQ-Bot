const Database = require("better-sqlite3");
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);

const db = new Database(`${process.cwd().replace(/\\/g, "/")}/messages.db`);

if (db.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'messages'").all()[0]["count(*)"] === 1) {
    log.write(`已载入${process.cwd().replace(/\\/g, "/")}/message.db`, "DATABASE", "INFO");
} else {
    try {
        db.prepare("CREATE TABLE `messages` ( `ID` INTEGER PRIMARY KEY, `time` TEXT NOT NULL , `uin` TEXT NOT NULL , `guin` TEXT NOT NULL , `content` TEXT NOT NULL , `seq` TEXT NOT NULL , `random` TEXT NOT NULL)").run();
    } catch (e) {
        log.write("无法创建数据表.", "DATABASE", "ERROR");
        process.exit();
    }
    log.write("已创建数据表.", "DATABASE", "INFO");
}

function saveMessage(uin, guin, content, seq, random = 0) {
    var time = Math.floor((new Date()).getTime() / 1000);
    try {
        db.prepare("INSERT INTO `messages` (time, uin, guin, content, seq, random) VALUES (?, ?, ?, ?, ?, ?);").run(time.toString(), uin.toString(), guin.toString(), content.toString(), seq.toString(), random.toString());
    } catch (e) {
        log.write("无法写入数据库.", "DATABASE", "ERROR");
        process.exit();
    }
}

function getMessageBySeqAndGuin(seq, guin) {
    try {
        var data = db.prepare("SELECT * FROM `messages` WHERE `seq` = ? AND `guin` = ?;").get(seq.toString(), guin.toString());
    } catch (e) {
        log.write("无法读取数据库.", "DATABASE", "ERROR");
        process.exit();
    }
    if (data === undefined) {
        return false;
    } else {
        return data;
    }
}

function getMessageByUinAndGuin(uin) {
    try {
        var data = db.prepare("SELECT * FROM `messages` WHERE `uin` = ? AND `guin` = ?;").all(uin.toString(), guin.toString());
    } catch (e) {
        log.write("无法读取数据库.", "DATABASE", "ERROR");
        process.exit();
    }
    if (data === undefined) {
        return false;
    } else {
        return data;
    }
}

function getMessageByUinAndContentAndGuin(uin, guin, content) {
    try {
        var data = db.prepare(`SELECT * FROM \`messages\` WHERE \`uin\` = ? AND \`guin\` = ? AND \`content\` LIKE '%${content.toString()}%';`).all(uin.toString(), guin.toString());
    } catch (e) {
        console.log(e);
        log.write("无法读取数据库.", "DATABASE", "ERROR");
        process.exit();
    }
    if (data === undefined) {
        return false;
    } else {
        return data;
    }
}

module.exports = {
    saveMessage,
    getMessageBySeqAndGuin,
    getMessageByUinAndGuin,
    getMessageByUinAndContentAndGuin
};