const request = require("request");
const crypto = require("crypto");
const strandom = require("string-random");
const config = require(`${process.cwd().replace(/\\/g, "/")}/controller/configApi.js`);
const message = require(`${process.cwd().replace(/\\/g, "/")}/controller/messageApi.js`);
const user = require(`${process.cwd().replace(/\\/g, "/")}/controller/userApi.js`);
const log = require(`${process.cwd().replace(/\\/g, "/")}/controller/logger.js`);

function init() {
    config.registerSuperCommand("spamban", "spamban.js", "spamban", "举报消息, 需要回复一条消息.管理员使用时将跳过检测直接封禁.");
    config.registerSuperCommand("sb", "spamban.js", "spamban", "/spamban的简写.等效于/spamban.");
    config.registerSuperCommand("mute", "spamban.js", "mute", "禁言, 需要回复一条消息.仅管理员可用.\n[period]: 禁言时长(分钟)", "[period]");
    config.registerSuperCommand("m", "spamban.js", "mute", "/mute的简写.等效于/mute.\n[period]: 禁言时长(分钟)", "[period]");
    // config.registerSuperCommand("kick", "spamban.js", "kick", "踢出, 需要回复一条消息.仅管理员可用.");
    // config.registerSuperCommand("k", "spamban.js", "kick", "/kick的简写.等效于/kick.");
}

function spamban(packet) {
    if (packet.SrcMsgSeq === undefined) {
        var msg = "请使用此指令回复一条消息.";
        message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
        return false;
    }
    if (user.isAdmin(packet.FromUin, packet.FromGroupUin)) {
        message.revoke(packet.FromGroupUin, packet.SrcMsgSeq, 0);
        message.mute(packet.FromGroupUin, packet.SrcFromUin, 60);
        var msg = `您的信息触发了审计规则.详情:\n管理员觉得你不行.`;
        message.send(packet.FromGroupUin, msg, packet.RequestType, packet.SrcFromUin);
    } else {
        var msg = "[触发消息审计] 正在检查消息内容...";
        message.send(packet.FromGroupUin, msg, packet.RequestType);
        scanTextMsg(packet.SrcContent, function (result) {
            if (result !== true) {
                message.revoke(packet.FromGroupUin, packet.SrcMsgSeq, 0);
                message.mute(packet.FromGroupUin, packet.SrcFromUin, 60);
                var msg = `您的信息触发了审计规则.详情:\n${result}.`;
                message.send(packet.FromGroupUin, msg, packet.RequestType, packet.SrcFromUin);
            } else {
                var msg = "[消息审计] 消息不含违规内容.";
                message.send(packet.FromGroupUin, msg, packet.RequestType);
            }
        });
    }
}

function mute(packet) {
    if (packet.SrcMsgSeq === undefined) {
        var msg = "请使用此指令回复一条消息.";
        message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
        return false;
    }
    var command = packet.Content.match(/(?<=\/)[a-z]{1,10}\s\d{1,10}/i);
    if (command !== null) {
        var period = command[0].split(" ")[1];
    } else {
        var msg = "请提供参数.";
        message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
        return false;
    }
    if (user.isAdmin(packet.FromUin, packet.FromGroupUin)) {
        message.mute(packet.FromGroupUin, packet.SrcFromUin, period);
        var msg = `已禁言用户 <${packet.SrcFromUin}>.`;
        message.send(packet.FromGroupUin, msg, packet.RequestType);
    } else {
        var msg = "您的权限不足.";
        message.send(packet.FromGroupUin, msg, packet.RequestType, packet.FromUin);
    }
}

/* Support */
const ACCESS_KEY_ID = config.get("global", "ACCESS_KEY_ID");
const ACCESS_KEY_SECRET = config.get("global", "ACCESS_KEY_SECRET");

function genSignature(stringToSign) {
    return "acs " + ACCESS_KEY_ID + ":" + crypto.createHmac("sha1", ACCESS_KEY_SECRET).update(stringToSign).digest().toString("base64");
}

function scanTextMsg(msg, callback) {
    log.write("触发文本内容检测.", "文本垃圾内容检测", "INFO");
    //准备body
    var postData = {};
    postData.scenes = Array();
    postData.scenes.push("antispam");
    postData.tasks = Array();
    postData.tasks.push({ content: msg });
    postData = JSON.stringify(postData);
    //准备header
    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Content-MD5": crypto.createHash("md5").update(postData).digest().toString("base64"),
        "Date": new Date().toGMTString(),
        "x-acs-version": "2018-05-09",
        "x-acs-signature-nonce": strandom(16),
        "x-acs-signature-version": "1.0",
        "x-acs-signature-method": "HMAC-SHA1",
    }
    //准备签名
    var signature = [];
    signature.push("POST\n");
    signature.push("application/json\n");
    signature.push(header["Content-MD5"] + "\n");
    signature.push("application/json\n");
    signature.push(header["Date"] + "\n");
    signature.push("x-acs-signature-method:" + header["x-acs-signature-method"] + "\n");
    signature.push("x-acs-signature-nonce:" + header["x-acs-signature-nonce"] + "\n");
    signature.push("x-acs-signature-version:" + header["x-acs-signature-version"] + "\n");
    signature.push("x-acs-version:" + header["x-acs-version"] + "\n");
    signature.push("/green/text/scan");
    stringToSign = signature.join("");
    //签名
    header.Authorization = genSignature(stringToSign);
    request.post({
        url: "http://green.cn-shanghai.aliyuncs.com/green/text/scan",
        headers: header,
        body: postData,
    }, function (e, r, b) {
        try {
            var response = JSON.parse(b);
        } catch (e) {
            log.write("无法解析服务器返回的数据.", "文本垃圾内容检测失败", "WARNING");
            log.write("请检查阿里云接入点地址是否正确.", "文本垃圾内容检测失败", "WARNING");
            return false;
        }
        if (response.code == 200) {
            try {
                if (response.data[0].results[0].suggestion == "pass") {
                    log.write("正常信息.", "文本垃圾内容检测结果", "INFO");
                    callback(true);
                } else if (response.data[0].results[0].suggestion == "block") {
                    var reasons = {
                        spam: "垃圾信息",
                        ad: "广告内容",
                        politics: "内容涉政",
                        terrorism: "内容暴恐",
                        abuse: "辱骂信息",
                        porn: "色情内容",
                        flood: "灌水内容",
                        contraband: "违禁内容",
                        meaningless: "无意义内容",
                    };
                    log.write(`${reasons[response.data[0].results[0].label]}.`, "文本垃圾内容检测结果", "INFO");
                    callback(reasons[response.data[0].results[0].label]);
                } else {
                    log.write("需要人工判断.", "文本垃圾内容检测结果", "INFO");
                    callback(true);
                }
            } catch (e) {
                log.write(`错误信息: <${response.Msg}>`, "文本垃圾内容检测失败", "ERROR");
                console.log(b);
            }
        } else {
            log.write(`错误信息: <${response.Msg}>`, "文本垃圾内容检测失败", "WARNING");
            console.log(b);
            return false;
        }
    });
}

module.exports = {
    init,
    spamban,
    mute
}