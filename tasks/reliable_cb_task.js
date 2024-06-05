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

        if(!result.EventSet){
            console.error("pullEvent failed:"+JSON.stringify(result));
            return;
        }

        if(result.EventSet.length==0){
            console.log("not callback event")
            return;
        }
        let msgHandles = [];
        for(let event of result.EventSet){
            console.log(JSON.stringify(event));
            const taskCbhandler = getTaskHandler(event.EventType);
            try {
                await taskCbhandler(event);
            } catch (err) {
                console.error(err);
            }finally{
                msgHandles.push(event.EventHandle);
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
