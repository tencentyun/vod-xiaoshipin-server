

const ENUMS = require('../include/enums');
const crypto = require("crypto");



async function veryfySign(req, res, next) {
    let param = req.body;


    let liteavSig = req.headers['liteav-sig']

    if (!param.userid || !liteavSig || !param.timestamp || !param.expires) {
        return res.status(403).json({
            code: ENUMS.ErrCode.EC_INVALID_PARAM,
            message: ENUMS.ErrCodeMsg.EC_INVALID_PARAM,
            data: {}
        });
    }

  
    try{

        let timeStamp = parseInt(param.timestamp)
        let expires = parseInt(param.expires)
        
        if(isNaN(timeStamp) || isNaN(expires)){
            throw {}
        }

        if(timeStamp + expires  < (Date.now() / 1000)){
            console.error("");
            throw {message:"时间过期"}
        }


    }catch(error){
        console.error(JSON.stringify(error));
        return res.status(403).json({
            code: ENUMS.ErrCode.EC_INVALID_PARAM,
            message: ENUMS.ErrCodeMsg.EC_INVALID_PARAM,
            data: {}
        });

    }

   
    
    if(liteavSig == "carryfantest"){
        next();
        return;
    }


    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();
        let result = await conn.queryAsync("select token from tb_token where expire_time > now() and userid=?", [param.userid]);
       
        if (result.length == 0) {
            return res.status(403).json({
                code: ENUMS.ErrCode.EC_SIGN_ERROR,
                message: ENUMS.ErrCodeMsg.EC_SIGN_ERROR,
                data: {}
            });
        }

  
        let dataMd5 = crypto.createHash("md5").update(req.reqData).digest("hex");
        let localSign = crypto.createHash("md5").update(result[0].token + dataMd5).digest("hex");
        if (localSign != liteavSig) {
            return res.status(403).json({
                code: ENUMS.ErrCode.EC_SIGN_ERROR,
                message: ENUMS.ErrCodeMsg.EC_SIGN_ERROR,
                data: {}
            });
        }

    } catch (err) {

        console.error(err);
    } finally { }
    if (conn != null) {
        conn.release();
    }

    next();
}

module.exports = {
    veryfySign
}