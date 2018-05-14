const moment = require('moment');
const APP_BASE_PATH = '../';
const enums = require(APP_BASE_PATH + 'include/enums');




/**
 * 通过媒资接口更新视频信息
 * @param {*} fileId 
 * @param {*} conn 
 */
async function updateBasicInfo(fileId) {
    /*
    *调用腾讯云点播平台API
    *备注：采用腾讯云web端,Android,IOS端播放SDK，SDK内部会根据fileId拉取各个转码格式播放地址，如果使用自研播放器，可以获取详细转码信息后保存在数据库中并分发给客户端
    */
    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();
        let data = await gVodHelper.getVideoInfo({ fileId, infoFilter: ['basicInfo'], extraOpt:{"proxy":""}});
        console.log(JSON.stringify(data));
    
        if(data.code!=0){
            throw data;
        }
        let basicInfo = data.basicInfo;
        let basicInfoItem = {};
        basicInfoItem['title'] = basicInfo.name;
        basicInfoItem['create_time'] = moment(basicInfo.createTime, 'X').format('YYYY-MM-DD HH:mm:ss');
        basicInfoItem['frontcover'] = basicInfo.coverUrl;

        console.log(basicInfoItem);
        let results = null;
        results = await conn.queryAsync('select * from tb_ugc where file_id=?', [fileId]);
        if (results.length == 0) {
            throw 'no such fileID';
        }
        await conn.queryAsync('update tb_ugc set ? where file_id=?', [basicInfoItem, fileId]);
     
    } finally {
        if (conn != null) {
            conn.release();
        }
    }
}



/**
 * 上传事件处理函数
 * @param {消息} taskCbMsg 
 */
async function NewFileUploadHandler(taskCbMsg) {
    if (!taskCbMsg || taskCbMsg.eventType != enums.TaskCBEventType.NewFileUpload) {
        throw { message: "can not process this task in NewFileUploadHandler" };
    }
    let param = taskCbMsg.data;
    let conn = null;
    try {
        let fileId = param.fileId;
        if(!fileId){
            return;
        }

        conn = await gDataBases["db_litvideo"].getConnection();
        let basicInfoItem = {};
        basicInfoItem['userid'] = "001";
        basicInfoItem['file_id'] = param['fileId'];
        basicInfoItem['status'] = enums.ResourceStatus.READY;
        basicInfoItem['review_status'] = enums.ReviewStatus.NotReivew;
        let results = null;
        results = await conn.queryAsync('insert into tb_ugc set ? on duplicate key update status=?,review_status=?', [basicInfoItem,basicInfoItem.status,enums.ReviewStatus.NotReivew]);
        await updateBasicInfo(fileId);

    } catch (err) {
        console.error(err);
    } finally {
        if (conn != null) {
            conn.release();
        }
    }
}



/**
 * 转码事件处理函数
 * @param {回调消息} taskCbMsg 
 */
async function TranscodeCompleteHandler(taskCbMsg) {
    if (!taskCbMsg || taskCbMsg.eventType != enums.TaskCBEventType.TranscodeComplete) {
        throw { message: "can not process this task in TranscodeComplete" };
    }
    let param = taskCbMsg.data;
    try {
        let fileId = param.fileId;
        await updateBasicInfo(fileId);
    } catch (err) {
        console.error(err);
    }
}

/**
 * 处理状态更新
 * @param {*} taskCbMsg 
 */
async function ProcedureStateChangedHandler(taskCbMsg){
    if (!taskCbMsg || taskCbMsg.eventType != enums.TaskCBEventType.ProcedureStateChanged) {
        throw { message: "can not process this task in ProcedureStateChangedHandler" };
    }
    let param = taskCbMsg.data;
    
    try {
    
        let fileId = param.fileId;
        if(!fileId){
            return;
        }
        
        //判断是否涉黄
        if(param.aiReview && param.aiReview.riskType.length!=0){
            await conn.queryAsync('update t_ugc set review_status=? where file_id=?', [enums.ReviewStatus.Porn, fileId]);
            return;
        }

        //更新视频信息
        await updateBasicInfo(fileId);
      
    } catch (err) {
        console.log(param);
        console.error(err);
    } 
}


async function defaultTaskCbHandler(taskCbMsg) {
    console.log("can not handler this task cb");
}


//注册handler
let taskHandlerMap = {};
taskHandlerMap[enums.TaskCBEventType.NewFileUpload] = NewFileUploadHandler;
taskHandlerMap[enums.TaskCBEventType.TranscodeComplete] = TranscodeCompleteHandler;
taskHandlerMap[enums.TaskCBEventType.ProcedureStateChanged] = ProcedureStateChangedHandler;

function getTaskHandler(type) {
    let handler = taskHandlerMap[type];
    if(!handler){
        handler = defaultTaskCbHandler;
    }
    return handler;
}

module.exports = {
    getTaskHandler
}

