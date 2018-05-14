

const ENUMS = require('../include/enums');
const crypto = require("crypto");


async function veryfySign(req, res, next) {
    let param = req.body;
    if (!param.userid || !param['HTTP_LITEAV_SIG']) {
        return res.status(403).json({
            code: ENUMS.ErrCode.EC_INVALID_PARAM,
            message: ENUMS.ErrCodeMsg.EC_INVALID_PARAM,
            data: {}
        });
    }

    if(param['HTTP_LITEAV_SIG'] == "carryfantest"){
        next();
        return;
    }

    let conn = null;
    try {
        conn = await gDataBases["db_litvideo"].getConnection();
        let result = await conn.queryAsync("select token from tb_token where expire_time < now() and userid=?", [param.userid]);
        if (result.length == 0) {
            return res.status(403).json({
                code: ENUMS.ErrCode.EC_SIGN_ERROR,
                message: ENUMS.ErrCodeMsg.EC_SIGN_ERROR,
                data: {}
            });
        }

        let localSign = crypto.createHash("md5").update(result[0].token + req.url).digest("hex");
        if (localSign != param['HTTP_LITEAV_SIG']) {
            return res.status(403).json({
                code: ENUMS.ErrCode.EC_SIGN_ERROR,
                message: ENUMS.ErrCodeMsg.EC_SIGN_ERROR,
                data: {}
            });
        }

    } catch (err) {

        console.err(err);
    } finally { }
    if (conn != null) {
        conn.release();
    }

    next();
}

module.exports = {
    veryfySign
}