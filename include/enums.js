var _enumValidator = {}

var ENUM = {

    ErrCode: {
        EC_OK: 200,
        EC_BAD_REQUEST: 400,
        EC_SIGN_ERROR: 498,
        EC_DATABASE_ERROR: 500,
        EC_UPDATE_ERROR: 601,
        EC_INVALID_PARAM: 602,
        EC_INVALID_USERID: 610,
        EC_INVALID_PASSWORD: 611,
        EC_USER_EXIST: 612,
        EC_USER_NOT_EXIST: 620,
        EC_USER_PWD_ERROR: 621,
        EC_TASK_EXIST: 623,
        EC_TASK_EXPIRE: 624,
        //这几个错误码是给后台回调用的
        EC_SYSTEM_INVALID_JSON_FORMAT: 4001,
        EC_SYSTEM_INVALID_PARA: 4002,
        EC_SYSTEM_FREQUECY: 4003
    },

    ErrCodeMsg: {
        EC_OK: "OK",
        EC_BAD_REQUEST: "Bad Request",
        EC_SIGN_ERROR: "Invalid Token",
        EC_DATABASE_ERROR: "Internal Server Error(db error)",
        EC_UPDATE_ERROR: "update error",
        EC_INVALID_PARAM: "invalid param",
        EC_USER_EXIST: "user exist",
        EC_USER_NOT_EXIST: "user not exist",
        EC_USER_PWD_ERROR: "password error",
        EC_SYSTEM_INVALID_JSON_FORMAT: "http post body is empty or invalid json format in post body from client!",
        EC_SYSTEM_INVALID_PARA: "request para error",
        EC_SYSTEM_FREQUECY: "frequency control"
    },

    LOGIN_EXPIRED_TIME: 1 * 24 * 60 * 60,


    //具体介绍见：https://cloud.tencent.com/document/product/266/7829
    TaskCBEventType: {
        ProcedureStateChanged: "ProcedureStateChanged",
        NewFileUpload: "NewFileUpload",
        PullComplete: "PullComplete",
        TranscodeComplete: "TranscodeComplete",
        ConcatComplete: "ConcatComplete",
        ClipComplete: "ClipComplete",
        CreateImageSpriteComplete: "CreateImageSpriteComplete",
        CreateSnapshotByTimeOffsetComplete: "CreateSnapshotByTimeOffsetComplete",
        FileDeleted: "FileDeleted",
    },
    //具体介绍见：https://cloud.tencent.com/document/product/266/9636#processtasklist.EF.BC.88.E4.BB.BB.E5.8A.A1.E5.88.97.E8.A1.A8.EF.BC.89
    ProcessTaskType: {
        Trancode: "Trancode",
        SampleSnapshot: "SampleSnapshot",
        CoverBySnapshot: "CoverBySnapshot",
        SnapshotByTimeOffset: "SnapshotByTimeOffset",
        PullFile: "PullFile",
        ImageSprites: "ImageSprites"
    },


     //视频状态,业务定义
     ResourceStatus:{
        READY:0,
        NOT_READY:1,
    },
    ReviewStatus:{
        NotReivew:0,
        Normal:1,
        Porn:2,
    },
	ReviewMessage:{
		Porn : "porn",
		Pass : "pass",
	}

};


module.exports = ENUM;
