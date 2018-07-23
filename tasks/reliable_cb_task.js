/**
 * 实现可靠回调消息获取
 */

const VodHelper = require('../utils/vod_helper').VodHelper;
const vodHelper = new VodHelper(GLOBAL_CONFIG.tencentyunaccount);
const getTaskHandler = require('../routes/taskcbHandlers').getTaskHandler;

const extraOpt = {};

async function runReliableCbTask(){
    try{
        let result = await vodHelper.pullEvent({extraOpt});

        if(result.code==4000){
            return;
        }

        if(result.code!=0){
            console.error("pullEvent failed:"+JSON.stringify(result));
            return;
        }
        let msgHandles = [];
        for(let event of result.eventList){
            console.log(event);
            const taskCbhandler = getTaskHandler(event.eventContent.eventType);
            try {
                await taskCbhandler(event.eventContent);
            } catch (err) {
                console.error(err);
            }finally{
                msgHandles.push(event.msgHandle);
            }
        }
        await vodHelper.comfireEvent({msgHandles,extraOpt});
    }catch(error){
        console.error(error);
    }finally{
        setTimeout(runReliableCbTask,GLOBAL_CONFIG.server.reliablecbtimeout);
    }
}

module.exports = {
    runReliableCbTask
}
