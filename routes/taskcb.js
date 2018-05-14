/**
 * 事件消息回调处理逻辑，详细见：https://cloud.tencent.com/document/product/266/7829
 */
const express = require('express');
const router = express.Router();
const getTaskHandler = require('./taskcbHandlers').getTaskHandler;


async function handleTaskCb(req, res) {
    var oDate = new Date();
    res.status(200).json({ code:0 });
    //回调任务处理


    

    let taskCbData = req.body;
    
    
    console.log(JSON.stringify(taskCbData));
    const taskCbhandler = getTaskHandler(taskCbData.eventType);
    try {
        await taskCbhandler(taskCbData);
    } catch (err) {
        console.error(err);
    }
}


router.get('/taskcb', function(req,res){
    res.json({code:0});
});
router.post('/taskcb', handleTaskCb);


module.exports = router;
