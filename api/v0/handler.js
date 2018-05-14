

const APP_BASE_PATH = '../../';
const ENUMS = require(APP_BASE_PATH + "include/enums");

const crypto = require("crypto");
const mysql = require('mysql');
const moment = require("moment");



let VodHelper = require(APP_BASE_PATH + 'utils/vod_helper').VodHelper;


const EXPIRE_TIME = 100;

setInterval(async function(){
    let conn = null;
    try{
       conn = await gDataBases["db_litvideo"].getConnection();
       let result = await conn.queryAsync("delete from tb_token where expire_time < now()");
    }catch(err){

        console.err(err);
    }finally{}
    if (conn != null) {
        conn.release();
    }
   

},EXPIRE_TIME * 1000)


async function register(req, res) {

    let param = req.body;
    let userid = param.userid;
    let password = param.password;

    if (!userid || userid.length > 50) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "用户名格式错误",  
        });

    }

    if (!password || password.length > 255) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "密码格式错误",  
        });
    }


    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();
        let sql = "insert into tb_account(userid,password) values(?,?)";
        let result = await conn.queryAsync(sql, [userid, password]);

    } catch (err) {
        return res.status(500).json({
            'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
            'message': '服务器错误'
        });
    } finally {
        if (conn != null) {
            conn.release();
        }
    }
    return res.json({
        code: ENUMS.ErrCode.EC_OK,
        message: 0
    });
}


function genUserSig({
    userid,
    sdkAppId,
    privateKeyPath
}) {
    return crypto.createHash("md5").update(userid).digest("hex");
}


async function login(req, res) {
    let param = req.body;
    let userid = param.userid;
    let password = param.password;
    if (!userid || userid.length > 50) {

        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "用户名格式错误",  
        });

    }

    if (!password || password.length > 255) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "密码格式错误",  
        });
    }


    //查询帐号密码
    let conn = null;
    let token = "";
    let refresh_token = "";
    let expires_time = "";

    try {
        conn = await gDataBases["db_litvideo"].getConnection();

        let accountSql = "select * from tb_account where userid=? and password=?";
        let result = await conn.queryAsync(accountSql, [userid, password]);
        if (result.length == 0) {
            return res.status(400).json({
                code: ENUMS.ErrCode.EC_USER_NOT_EXIST,
                message: ENUMS.ErrCodeMsg.EC_USER_NOT_EXIST
            });
        }

        token = crypto.createHash("md5").update(userid + "" + new Date().getTime() + "" + Math.random()+"token").digest("hex");
        refresh_token = crypto.createHash("md5").update(userid + "" + new Date().getTime() + "" + Math.random()+"refresh_token").digest("hex");
        expire_time = moment().add(EXPIRE_TIME,'seconds').format('YYYY-MM-DD HH:mm:ss');


        result = await conn.queryAsync("select * from tb_token where userid=? and expire_time>now() order by expire_time",[userid]);
        let tokenSql = "";
      
        if(result.length > 3){
            tokenSql = `update tb_token set token =?,refresh_token=?,expire_time=?,userid = ? where token='${result[0].token}'`

        }else{
            tokenSql = "insert into tb_token(token,refresh_token,expire_time,userid) values(?,?,?,?)"

        }
        await conn.queryAsync(tokenSql,[token,refresh_token,expire_time,userid]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
            'message': '服务器错误'
        });
    } finally {
        if (conn != null) {
            conn.release();
        }
    }


    return res.json({
        "code": ENUMS.ErrCode.EC_OK,   //621,密码错误; 620,用户不存在; 500,服务器错误(数据库查询失败)
        "message": "OK",
        "data": {
            "token": token,    //随机数
            "refresh_token": refresh_token, //续期token，随机数
            "expires": EXPIRE_TIME,  // 过期时间（秒）
            "vod_info":{
                appid:gVodHelper.conf.appid,
                SubAppId:gVodHelper.conf.SubAppId,
                SecretId:gVodHelper.conf.SecretId,
            },
            "cos_info": {
                "Bucket": GLOBAL_CONFIG.cos.bucket,           //cos bucket名
                "Region": GLOBAL_CONFIG.cos.region,           //cos bucket所在地域
                "Appid": GLOBAL_CONFIG.cos.appid,           //cos appid
                "SecretId": GLOBAL_CONFIG.cos.SecretId          //cos secretid
            }
        }
    })
}


async function get_user_info(req, res) {
    let param = req.body;
    let userid = param.userid;
    if (!userid || userid.length > 50) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "用户名格式错误",  
        });
    }

    //查询帐号密码
    let userInfo = {};
    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();

        let accountSql = "select userid,nickname,avatar,sex,frontcover from tb_account where userid=?";
        let result = await conn.queryAsync(accountSql, [userid]);
        if (result.length == 0) {
            return res.status(400).json({
                code: ENUMS.ErrCode.EC_USER_NOT_EXIST,
                message: ENUMS.ErrCodeMsg.EC_USER_NOT_EXIST
            });
        }
        userInfo = result[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
            'message': '服务器错误'
        });
    } finally {
        if (conn != null) {
            conn.release();
        }
    }

    return res.json({
        code: ENUMS.ErrCode.EC_OK,
        message: "ok",
        data: userInfo
    });
}



function checkString({
    str, minLength, maxLength
}) {

    if (!str) {
        return false;
    }

    if (!minLength) {
        minLength = 0;
    }

    if (!maxLength) {
        maxLength = 65536;
    }

    if (str.length > maxLength || str.length < minLength) {
        return false;
    }
    return true;
}

async function upload_user_info(req, res) {

    let param = req.body;
    let userid = param.userid;
    let nickname = param.nickname;
    let avatar = param.avatar;
    let frontcover = param.frontcover;
    let sex = param.sex;

    if (!checkString({ str: userid, maxLength: 50 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "用户名格式错误",  
        });
    }

    if (!checkString({ str: nickname, maxLength: 100 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "昵称格式错误",  
        });
    }

    if (!checkString({ str: avatar, maxLength: 256 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "头像格式错误",  
        });
    }

    if (!checkString({ str: frontcover, maxLength: 256 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "封面格式错误",  
        });
    }

    if(sex!=0 && sex!=1){
        sex = -1;

    }

    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();

        let accountSql = gDataBases["db_litvideo"].makeUpdateSql("tb_account", { sex,avatar, nickname, frontcover }, mysql.format("where userid=?", [userid]))
        let result = await conn.queryAsync(accountSql);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
            'message': '服务器错误'
        });
    } finally {
        if (conn != null) {
            conn.release();
        }
    }
    return res.json({
        code: ENUMS.ErrCode.EC_OK,
        message: "upload_user_info success",
    });
}


async function upload_ugc(req, res) {

    let param = req.body;


    if (!checkString({ str: param.userid, minLength:1,maxLength: 50 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "用户名格式错误",  
        });
    }

    if (!checkString({ str: param.file_id,minLength:1, maxLength: 100 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "文件id格式错误",  
        });
    }

    if (!checkString({ str: param.title,minLength:1, maxLength: 100 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "标题格式错误",  
        });
    }

    if (!checkString({ str: param.frontcover,minLength:0, maxLength: 256 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "封面格式错误",  
        });
    }

    if (!checkString({ str: param.location,minLength:0, maxLength: 256 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "地理位置格式错误",  
        });
    }

    if (!checkString({ str: param.play_url, minLength:0,maxLength: 512 })) {
        return res.status(400).json({
            "code": ENUMS.ErrCode.EC_INVALID_PARAM, 
            "message": "播放地址格式错误",  
        });
    }


    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();
        let ugcItem = {};
        ugcItem['userid'] = param.userid;
        ugcItem['file_id'] = param.file_id;
        ugcItem['title'] = param.title;
        ugcItem['frontcover'] = param.frontcover;
        ugcItem['location'] = param.location;
        ugcItem['play_url'] = param.play_url;
        ugcItem['create_time'] = moment().format('YYYY-MM-DD HH:mm:ss');
        results = await conn.queryAsync('insert into tb_ugc set ? on duplicate key update title=?,frontcover=?,location=?,play_url=?', [ugcItem,param.title,param.frontcover,param.location,param.play_url]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
            'message': '服务器错误'
        });
    } finally {
        if (conn != null) {
            conn.release();
        }
    }


    res.json({
        "code": ENUMS.ErrCode.EC_OK, 
        "message": "OK"
    });

}


async function get_ugc_list(req, res) {

    let param = req.body;
    let index = param.index ? parseInt(param.index) : 0;
    let count = param.count ? parseInt(param.count) : 10;

 
    let total = 0;
    let list = [];
    let result = null;
    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();
        let countSql = "select count(*) as all_count from tb_ugc";
        result = await conn.queryAsync(countSql);
        total = result[0].all_count;

        if (total != 0) {
            let querySql = "select a.userid,a.file_id,a.title,a.frontcover,a.location,a.play_url,a.create_time,b.nickname,b.avatar from tb_ugc a left join tb_account b on a.userid=b.userid order by create_time desc limit ?,?";
            list = await conn.queryAsync(querySql, [index, count]);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
            'message': '服务器错误'
        });
    } finally {
        if (conn != null) {
            conn.release();
        }
    }

    res.json({
        "code": ENUMS.ErrCode.EC_OK,
        "message": "OK",
        "data": {
            list,
            total
        }
    });
}


async function get_vod_sign(req, res) {
    res.json({
        code: ENUMS.ErrCode.EC_OK,
        message: "OK",
        data: {
            appid:gVodHelper.conf.appid,
            SubAppId:gVodHelper.conf.SubAppId,
            SecretId:gVodHelper.conf.SecretId,
            signature: gVodHelper.createFileUploadSignature({ procedure: 'QCVB_ProcessUGCFile(0,0,0,10)' })
        }
    });
}



async function get_cos_sign(req, res) {

    function getQKeyTime(second) {
        var dtime = Math.ceil(new Date().getTime() / 1000);
        var q_key_time = ((dtime - second) + ";" + (dtime + second));
        //var q_key_time = (new Date('2017-11-08').getTime() / 1000 + ";" + new Date('2017-11-18').getTime() / 1000);
        return q_key_time;
    }
    const keyTime = getQKeyTime(EXPIRE_TIME);
    const signKey = crypto.createHmac('sha1', GLOBAL_CONFIG.tencentyunaccout.SecretKey).update(keyTime).digest('hex');

    res.json({
        "code": ENUMS.ErrCode.EC_OK,
        "message": "OK",
        "data": {
            signKey,
            keyTime
        }
    });
}

async function report_user(req, res) {
    res.json({
        code: ENUMS.ErrCode.EC_OK,
        message: "OK"
    });
}


module.exports = {
    register,
    login,
    get_user_info,
    upload_user_info,
    upload_ugc,
    get_ugc_list,
    get_vod_sign,
    get_cos_sign,
    report_user
}

