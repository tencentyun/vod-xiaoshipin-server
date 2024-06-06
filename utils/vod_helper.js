const request = require('request');
const querystring = require("querystring");
const crypto = require('crypto');
const tencentcloud = require("tencentcloud-sdk-nodejs-vod");
const Vod = tencentcloud.vod.v20180717;

const Enum = {
    Action:{
        GetVideoInfo:"GetVideoInfo"
    }
};


/**
 * 点播平台服务端接口SDK
 */
class VodHelper{

    constructor(conf) {
        this.conf = conf;
        this.vodClient = new Vod.Client({
            credential:{
                secretId: conf.SecretId,
                secretKey: conf.SecretKey,
            }
        })
    }

    createFileUploadSignature({timeStamp = 86400,procedure='',classId=0,oneTimeValid=0,sourceContext='',vodSubAppId=0}) {
  
        var current = parseInt((new Date()).getTime() / 1000)
        var expired = current + timeStamp;  

        var arg_list = {
   
            secretId: this.conf.SecretId,
            currentTimeStamp: current,
            expireTime: expired,
            random: Math.round(Math.random() * Math.pow(2, 32)),   
  
            procedure,
            classId,
            oneTimeValid,
            sourceContext
        }
        if(this.conf.SubAppId){
            arg_list["vodSubAppId"] = this.conf.SubAppId
        }
      
        var orignal = querystring.stringify(arg_list);
        var orignal_buffer = new Buffer(orignal, "utf8");
        var hmac = crypto.createHmac("sha1", this.conf.SecretKey);
        var hmac_buffer = hmac.update(orignal_buffer).digest();
        var signature = Buffer.concat([hmac_buffer, orignal_buffer]).toString("base64");
        return signature;
    }

    /**
     * 点播平台媒资信息获取封装接口，详细信息见：https://cloud.tencent.com/document/product/266/8586
     * @param {fileId:视频文件ID,infoFilter:需要获取的信息，extraOpt:外网代理配置等} param0 
     */
    async getVideoInfo({fileId,infoFilter=[],extraOpt={}}){
        let req = {
            FileIds: [fileId],
            Filters: infoFilter,
        }
        if(this.conf.SubAppId){
            req.SubAppId = parseInt(this.conf.SubAppId);
        }
        return await this.vodClient.DescribeMediaInfos(req);
    }
     /**
     * 请求点播平台未消费的事件通知，详细信息见：https://cloud.tencent.com/document/product/266/7829
     */
    async pullEvent({extraOpt={}}){
        let req = {};
        if(this.conf.SubAppId){
            req.SubAppId = parseInt(this.conf.SubAppId);
        }
        return await this.vodClient.PullEvents(req);
    }

    /**
     * 向vod平台确认消费事件通知，详细信息：https://cloud.tencent.com/document/product/266/7829
     */
    async comfireEvent({msgHandles=[],extraOpt={}}){
        let req = {
            EventHandles: msgHandles,
        };
        if(this.conf.SubAppId){
            req.SubAppId = parseInt(this.conf.SubAppId);
        }
        return await this.vodClient.ConfirmEvents(req);
    }
}

module.exports = {
    VodHelper
};
