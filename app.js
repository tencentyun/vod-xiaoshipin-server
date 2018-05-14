const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const MySQLHelper = require('./utils/mysql_helper');
const VodHelper = require('./utils/vod_helper').VodHelper;
const app = express();
const moment = require('moment');
app.disable('x-powered-by');
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}



//配置文件加载
function loadConfig(){
    const fs = require('fs');
    return JSON.parse(fs.readFileSync('./conf/localconfig.json'));
}

/**
 * 初始化应用程序
 */
function initilizeApplication(){

    //封装日志输出
    console.log = (function (oriLogFunc) {
       
        return function (str) {
            try {
                throw new Error();
            } catch (e) {
             
                let date = moment().format('YYYY-MM-DD HH:mm:ss');
                var loc= e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
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
                var loc= e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
                oriLogFunc.call(console, `${date} | ERROR | ${loc} | ${str}`);
            }
        }
    })(console.error);

    global.gDataBases = {
        "db_litvideo":new MySQLHelper(GLOBAL_CONFIG.dbconfig)
    };

    global.gVodHelper = new VodHelper(GLOBAL_CONFIG.tencentyunaccout);
}

/**
 * 注册中间件
 */
function initMiddleware() {
   
    app.use(compress());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));


    app.use(function(req,res,next){
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

async function startServer(){
    global.GLOBAL_CONFIG = loadConfig();


    initilizeApplication();
    initMiddleware();

    app.set('host', process.env.IP || GLOBAL_CONFIG.server.ip);
    app.set('port', process.env.PORT || GLOBAL_CONFIG.server.port);
    const server = app.listen(app.get('port'), app.get('host'), function() {
        console.log('Express server listening on port', server.address().port);
    });
}
startServer();