const express = require('express');
const router = express.Router();
const handler = require('./handler');

const APP_BASE_PATH = '../../';
const middleware = require(APP_BASE_PATH + "middleware/misc");


router.all('/', handler.get_ugc_list);

router.all('/get_ugc_list', handler.get_ugc_list);

router.all('/register', handler.register);

router.all('/login', handler.login);

router.use(middleware.veryfySign);

router.all('/test_veryfy_sign',function(req,res){
    res.json({code:0,message:"success to vierfy sign"});
})

router.all('/get_cos_sign', handler.get_cos_sign);

router.all('/get_user_info', handler.get_user_info);

router.all('/get_vod_sign', handler.get_vod_sign);

router.all('/upload_ugc', handler.upload_ugc);

router.all('/upload_user_info', handler.upload_user_info);

router.all('/report_user', handler.report_user);




module.exports = router;
