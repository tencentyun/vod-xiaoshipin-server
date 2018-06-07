const request = require('request');
const Capi = require('qcloudapi-sdk');
const querystring = require("querystring");
const crypto = require('crypto');

/**
 * 为腾讯云服务SDK添加es6支持
 * @param {请求数据,将作为GET或者POST方法输入参数} params 
 * @param {HTTP请求配置，如方法设置等} opts 
 * @param {额外配置项,如外网代理等} extras 
 */
function CpiAsyncRequest(params,opts={},extras={}) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.request(params,opts, function (error, data) {
            if (error) {
                reject(error);
                return;
            }
            resolve(data);
        },extras)
    });
}
Capi.prototype.asyncRequest = CpiAsyncRequest;

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
        this.capi = new Capi({
            SecretId: conf.SecretId,
            SecretKey: conf.SecretKey,
            serviceType: 'account'
        });
    }

    createFileUploadSignature({timeStamp = 86400,procedure='',classId=0,oneTimeValid=0,sourceContext='',vodSubAppId=0}) {
  
        var current = parseInt((new Date()).getTime() / 1000)
        var expired = current + timeStamp;  

        var arg_list = {
   
            vodSubAppId,
            secretId: this.conf.SecretId,
            currentTimeStamp: current,
            expireTime: expired,
            random: Math.round(Math.random() * Math.pow(2, 32)),   
  
            procedure,
            classId,
            oneTimeValid,
            sourceContext
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
        let defaultData = {
            Region: 'gz',
            Action: 'GetVideoInfo',
            fileId
        }

        if(this.conf.SubAppId){
            defaultData.SubAppId = this.conf.SubAppId;
        }

    
        
        for(let i=0;i<infoFilter.length;i++){
            defaultData[`infoFilter.${i}`] = infoFilter[i];
        }
        console.log(defaultData);

        return await this.capi.asyncRequest(defaultData,{serviceType:'vod',method:"GET"},extraOpt);
    }

     /**
     * 请求点播平台未消费的事件通知，详细信息见：https://cloud.tencent.com/document/product/266/7829
     */
    async pullEvent({extraOpt={}}){
        let defaultData = {
            Region: 'gz',
            Action: 'PullEvent',
        }
        if(this.conf.SubAppId){
            defaultData.SubAppId = this.conf.SubAppId;
        }
        return await this.capi.asyncRequest(defaultData,{serviceType:'vod',method:"GET"},extraOpt);
    }

    /**
     * 向vod平台确认消费事件通知，详细信息：https://cloud.tencent.com/document/product/266/7829
     */
    async comfireEvent({msgHandles=[],extraOpt={}}){
        let defaultData = {
            Region: 'gz',
            Action: 'ConfirmEvent'
        }

        if(this.conf.SubAppId){
            defaultData.SubAppId = this.conf.SubAppId;
        }

        for(let i=0;i<msgHandles.length;i++){
       
            defaultData[`msgHandle.${i}`] = msgHandles[i];
        }
        return await this.capi.asyncRequest(defaultData,{serviceType:'vod',method:"GET"},extraOpt);
    }
}

module.exports = {
    VodHelper
};