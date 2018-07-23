

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const MySQLHelper = require('./utils/mysql_helper');
const VodHelper = require('./utils/vod_helper').VodHelper;
const getTaskHandler = require('./routes/taskcbHandlers').getTaskHandler;
const app = express();
const moment = require('moment');
<<<<<<< HEAD
const taskmsg = require('./taskmsg.js');
=======
const COS = require('cos-nodejs-sdk-v5');
>>>>>>> master
app.disable('x-powered-by');
if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'development';
}



//配置文件加载
<<<<<<< HEAD
=======
function loadConfig() {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync('./conf/localconfig.json'));
>>>>>>> master
}

/**
 * 初始化应用程序
 */
function initilizeApplication() {

<<<<<<< HEAD
=======
    //封装日志输出
    console.log = (function (oriLogFunc) {

        return function (str) {
            try {
                throw new Error();
            } catch (e) {

                let date = moment().format('YYYY-MM-DD HH:mm:ss');
                var loc = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
                oriLogFunc.call(console, `${date} | DEBUG | ${loc} | ${str}`);
            }

        }
    })(console.log);

    console.error = (function (oriLogFunc) {
        return function (str) {

            try {
                throw new Error();
            } catch (e) {
                let date = moment().format('YYYY-MM-DD HH:mm:ss');
                var loc = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
                oriLogFunc.call(console, `${date} | ERROR | ${loc} | ${str}`);
            }
        }
    })(console.error);

    global.gDataBases = {
        "db_litvideo": new MySQLHelper(GLOBAL_CONFIG.dbconfig)
    };

    global.gVodHelper = new VodHelper(GLOBAL_CONFIG.tencentyunaccount);
>>>>>>> master
}

/**
 * 注册中间件
 */
function initMiddleware() {

<<<<<<< HEAD
=======
    app.use(compress());

    //获取原始post值用来计算校验
    app.use(function (req, res, next) {
        var reqData = [];
        var size = 0;
        req.on('data', function (data) {
            reqData.push(data);
            size += data.length;
        });
        req.on('end', function () {
            req.reqData = Buffer.concat(reqData, size);
        });
        next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));


    app.use(function (req, res, next) {
        console.log(req.url);
        next();
    });


    if (!GLOBAL_CONFIG.server.reliablecb) {
        //回调路由
        app.use('/', require('./routes/taskcb'));
    }
    //功能接口路由
    app.use('/', require('./api/v0/route'));


    // catch 404 and forward to error handler
    app.use(function (req, res, next) {

        const err = new Error(`${req.url} Not Found`);
        err.status = 404;
        next(err);
    });

    // error handlers
    if (app.get('env') === 'development') {
        // development error handler
        // will print stacktrace
        app.use(function (err, req, res, next) {
            console.error(err);
            res.status(err.status || 500);
            res.send(err.message);
        });
    } else {
        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            console.error(err);
            res.status(err.status || 500);
            res.send(err.message);
        });
    }
}



function headBucket(params) {
    return new Promise(function (resolve, reject) {

        var cos = new COS({
            AppId: GLOBAL_CONFIG.tencentyunaccount.AppId,
            SecretId: GLOBAL_CONFIG.tencentyunaccount.SecretId,
            SecretKey: GLOBAL_CONFIG.tencentyunaccount.SecretKey,
        });

     

        cos.headBucket(params, function (err, data) {
          
            if (err) {
                reject(err)
            } else {
                resolve(data);
            }
        });

    });
}

function putBucket(params) {
    return new Promise(function (resolve, reject) {
        var cos = new COS({
            AppId: GLOBAL_CONFIG.tencentyunaccount.AppId,
            SecretId: GLOBAL_CONFIG.tencentyunaccount.SecretId,
            SecretKey: GLOBAL_CONFIG.tencentyunaccount.SecretKey,
        });
        cos.putBucket(params, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data);
            }
        });
    });
}


async function createBucket(params) {
    for (let i = 0; i < 3; i++) {
        try {
            let data = await putBucket(params);
            if (data.err) {
                continue;
            }
            return
        } catch (err) {
            continue;
        }
    }
    throw {}

}

async function isBucketExist(params) {

    for (let i = 0; i < 3; i++) {
        try {
            let data = await headBucket(params);
            if (data.err) {
                continue;
            }
            return data.BucketExist;
        } catch (err) {
            continue;
        }
    }
     return false
}


async function initCosBucket() {

    var params = {
        Bucket: 'xiaoshipincos-' + GLOBAL_CONFIG.tencentyunaccount.appid,
        Region: 'ap-guangzhou'
    };
    let bucketExist = await isBucketExist(params)
    if (bucketExist == false) {
        await createBucket(params)
    }
}

function checkConfig(config){
    if(!config){
        throw {message:"配置文件加载失败，检查是否存在配置文件"}
    }
    if(!config.tencentyunaccount){
        throw {message:"缺失腾讯云帐号配置"}
    }

    if(!config.tencentyunaccount.appid || !config.tencentyunaccount.SecretId || !config.tencentyunaccount.SecretKey){
        throw {message:"腾讯云帐号配置缺失，检查 appid，secretId、secreteKey 是否配置"}
    }
}
async function startServer() {
    global.GLOBAL_CONFIG = loadConfig();
    try{
        checkConfig(global.GLOBAL_CONFIG)
    }catch(err){
        console.error("localconfig error :"+JSON.stringify(err));
        process.exit(0);
>>>>>>> master

    }

	initilizeApplication();
	initMiddleware();

<<<<<<< HEAD


=======
    try{
        await initCosBucket()
    }catch(err){
        console.error("bucket init error:"+JSON.stringify(err));
        process.exit(0);
    }


    //开启可靠回调
    if (GLOBAL_CONFIG.server.reliablecb) {
        const tasks = require('./tasks/reliable_cb_task');
        tasks.runReliableCbTask();
    }


    app.set('host', process.env.IP || GLOBAL_CONFIG.server.ip);
    app.set('port', process.env.PORT || GLOBAL_CONFIG.server.port);
    const server = app.listen(app.get('port'), app.get('host'), function () {
        console.log('Express server listening on port', server.address().port);
    });
}
startServer();
>>>>>>> master
