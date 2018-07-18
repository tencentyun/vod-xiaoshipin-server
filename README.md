


# 概述

本项目为腾讯云小视频 APP + 鉴黄墙后台服务，采用 Nodejs 和 Mysql搭建，提供了腾讯云点播平台视频上传，回调处理，媒资管理等功能，以及网页端人工审核视频功能的演示。用户可以下载本项目源码搭建自己的小视频后台服务。



# 准备

## 帐号申请
1. 申请[腾讯云](https://cloud.tencent.com/)帐号，获取[API密钥](https://console.cloud.tencent.com/cam/capi)，得到 Appid,SecretId,SecretKey
2. 设置点播平台回调配置:部署域名+/taskcb,参考[腾讯云点播回调配置](https://cloud.tencent.com/document/product/266/7829)

## 环境准备

### 安装Nodejs
注意：nodejs 版本要求高于8.x
1. 创建安装目录
```
cd /usr/local
mkdir software
cd software
```
2. 下载最新版本 Nodejs 安装包

```
sudo wget https://nodejs.org/dist/v8.11.3/node-v8.11.3-linux-x64.tar.xz
tar -xvf node-v8.11.3-linux-x64.tar
cd node-v8.11.3-linux-x64
```
3. 将 node 和 npm 工具设置为全局
```
sudo ln /usr/software/node-v8.11.3-linux-x64/bin/node /usr/local/bin/node
sudo ln /usr/software/node-v8.11.3-linux-x64/bin/npm /usr/local/bin/npm
```


### 安装Mysql (mariadb) 
```
sudo apt update
sudo apt install mariadb-server
sudo mysql --version
sudo service mysql start
```
### 初始化数据库

1. 在终端使用 root 帐号登录 Mysql
```
mysql -u root -p
```
2. 创建小视频数据库用户 litvideo

```
create user 'litvideo'@'localhost' identified by 'litvideo';
```

3. 创建小视频数据库 db_litvideo，并授权给小视频用户 litvideo

```
create database db_litvideo default charset utf8 collate utf8_general_ci;
grant all privileges on `db_litvideo`.* to 'litvideo'@'%' identified by 'litvideo';
```

4. 使用litvideo，新建所需要的数据库
```
use db_litvideo;
	CREATE TABLE IF NOT EXISTS tb_account(
			userid VARCHAR(50) NOT NULL,
			password VARCHAR(255),
			nickname VARCHAR(100),
			sex INT DEFAULT -1,
			avatar VARCHAR(254),
			frontcover varchar(255) DEFAULT NULL,
			create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY(userid)
			)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

	CREATE TABLE IF NOT EXISTS tb_ugc (
			userid varchar(50) NOT NULL,
			file_id varchar(150) NOT NULL,
			title varchar(128) DEFAULT NULL,
			status tinyint(4) not NULL DEFAULT 0,
			review_status tinyint(4) not NULL DEFAULT 0,
			frontcover varchar(255) DEFAULT NULL,
			location varchar(128) DEFAULT NULL,
			play_url varchar(255) DEFAULT NULL,
			create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (file_id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

	CREATE TABLE IF NOT EXISTS tb_token(
			token VARCHAR(32) NOT NULL,
			userid VARCHAR(50) NOT NULL,
			expire_time DATETIME NOT NULL DEFAULT '1970-01-01',
			refresh_token VARCHAR(32) NOT NULL,
			PRIMARY KEY(token),
			KEY(userid),
			KEY(expire_time)
			)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

	CREATE TABLE IF NOT EXISTS tb_queue(
			task_id VARCHAR(150) NOT NULL,
			file_id varchar(150) NOT NULL,
			owner   VARCHAR(50),
			create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			mark_time timestamp DEFAULT '1971-01-01 00:00:00',
			review_data longtext,
			PRIMARY KEY(task_id)
			)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

	CREATE TABLE IF NOT EXISTS tb_review_record(
			task_id VARCHAR(150) NOT NULL,
			file_id varchar(150) NOT NULL,
			reviewer_id   VARCHAR(50) NOT NULL,
			review_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			review_status VARCHAR(50) NOT NULL,
			PRIMARY KEY(task_id)
			)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	```


# 快速开始

	进入工作目录，克隆项目文件

	```
	git clone https://github.com/tencentyun/vod-short-video-server-demo.git
	```

	在工作目录下，安装项目所需依赖
	```
	npm install            //安装项目所需依赖
	```
	在conf文件夹下，复制config_template.json文件并命名为localconfig.json文件，修改腾讯云API密钥、数据库参数配置，以及 COS 存储配置。

	```
{
	"dbconfig":{                        //数据库配置
		"host":"127.0.0.1",             //数据库 IP 地址，保持默认本机
			"user":"litvideo",              //数据库用户名，保持默认
			"password":"litvideo",          //数据库登录密码，保持默认
			"database":"db_litvideo",       //小视频所用数据库，保持默认
			"port":3306,                    //数据库端口，保持默认
			"supportBigNumbers": true,      //保持默认
			"connectionLimit":10            //保持默认
	},
		"tencentyunaccout":{                //腾讯运云帐号配置
			"appid":"",                     //腾讯云 Appid
			"SubAppId":"",                  //腾讯云点播子帐号，默认不使用，保持为空
			"SecretId": "",                 //腾讯云 SecretId
			"SecretKey": ""                 //腾讯云 SecretKey
		},
		"cos":{                             // COS 配置，用于保存图片数据
			"appid":"",                     //腾讯云 Appid
			"bucket":"xiaoshipin",          //使用 bucket
			"region":"ap-guangzhou",        // bucket 所在地域
			"SecretId": "",                 //腾讯云 SecretId
			"SecretKey": ""                 //腾讯云 SecretKey
		},
		"server":{                        
			"ip":"0.0.0.0",                 //服务启动 IP ，保持默认
			"port":8001,                    //服务启动端口，保持默认
			"reliablecb":true               //回调选择，保持默认
				"reliablecbtimeout":5000        //消息拉取轮询间隔（毫秒）
		}
}
```


## 启动服务

在腾讯云点播控制台，【视频处理设置】下【回调配置中】设置回调模式为可靠回调，该配置可能需要 10 分钟才能生效
![回调设置](https://main.qcloudimg.com/raw/3dcabb94e5ce7a84c0497cd4c0cb9941.png)
在工程根目录下启动服务
```
npm start
```

服务启动后，在另外一个终端下测试视频拉取接口

```
curl -l -H "Content-type: application/json" -X POST -d '' http://localhost:8001/get_ugc_list
```

如果服务正常运行，可返回如下结果
```
{"code":200,"message":"OK","data":{"list":[],"total":0}}
```
服务启动正常后，可以使用客户端或者腾讯云点播控制台上传视频进行测试
当上传的视频中，存在审核结果为“review”或者“block”的资源时，打开浏览器访问（可能需要外网权限）http://ip:port/index.html 进行人工视频审核。页面如图：


![图片描述](/tfl/captures/2018-07/tapd_10095581_base64_1531896508_33.png)
	页面左侧显示视频id和title，以及触犯规则的视频截图，截图confidence超过70会标红，右侧支持视频播放。点击相应截图，视频会从指定位置开始播放。
	视频下方是审核通过/屏蔽按钮，审核人点击任一审核按钮后，点击next，获取下一条待审视频。
	注意事项：

	- 审核人获取一条审核任务后，如果超时未审核，可能会被其他审核人领取，此时点击审核按钮时会提示：任务失效，需要点击next重新获取任务
	- 如果没有更多审核任务了，点击next后会提示：没有更多任务





# 实现说明

## 业务逻辑

### 设计
	后台业务逻辑主要为四个模块功能，媒资管理、上传签名、帐号管理以及消息回调处理

	媒资管理：提供客户端视频列表拉取、视频数据上报等
	签名管理：提供给客户端向 vod 上传短视频时所需的鉴权信息，提供 COS 签名用来上传头像
	消息回调：处理当 vod 完成视频上传，视频转码等功能的回调请求
	帐号管理：提供帐号注册、登录以及用户数据上传，提供登录信息校验

![服务器架构](/tfl/pictures/201807/tapd_10095581_1531902110_43.png)


### 点播消息回调


	在点播系统，视频处理等操作均为离线任务。与传统的“即时任务”相比，离线任务的特点是：任务的执行开销较大，耗时较长（可能长达数十分钟）。 点播提供了消息队列和 Http 请求回调两种方式实现时间通知。本项目实现了这两种事件通知方式，默认使用消息队列，开发者可通过配置文件中 reliablecb 参数配置回调方式，true 为消息队列方式（可靠回调）。

	1. 可靠回调客户端实现：通过一个轮询定时器不断调用 pullEvent 接口拉取点播消息队列中的消息处理，并 调用 comfireEvent 消费已经处理的消息，实现代码在 /task/reliable_cb_task.js 中

	2. Http 回调客户端实现： 为服务器添加一个路由，处理点播 Post 过来的请求，实现代码在 /routes/taskcb.js 中。

### AI 鉴黄
	在个人直播录制、UGC 短视频等场景中，视频内容是不可预知的。为了避免一些违规内容出现在点播平台上，开发者会要求先对上传的视频做审核，确认合规后再进行转码和分发。云点播支持对视频进行 AI 鉴黄，自动识别视频是否涉及色情内容。AI 鉴黄功能需要集成在视频处理任务流中使用，检查结果通过事件通知的方式来通知开发者。云点播内置了一个任务流 QCVB_ProcessUGCFile 用于 UGC 短视频鉴黄场景，当用户使用该任务流并指定进行 AI 鉴黄时，鉴黄操作将优先执行，并根据鉴黄结果来决定是否进行后续处理（转码、打水印和截图等）。开发者需要在视频上传完成后自动发起任务流时，可以在生成上传签名时通过 procedure 参数来实现。
	本项目使用了鉴黄任务流来审核视频，在派发给客户端上传签名时带上了鉴黄模版，处理回调信息时根据鉴黄结果修改视频审核状态。
	上传签名计算如下：

	```
	async function get_vod_sign(req, res) {
		res.json({
code: ENUMS.ErrCode.EC_OK,
message: "OK",
data: {
appid: gVodHelper.conf.appid,
SubAppId: gVodHelper.conf.SubAppId,
SecretId: gVodHelper.conf.SecretId,
signature: gVodHelper.createFileUploadSignature({ procedure: 'QCVB_ProcessUGCFile(0,0,0,10)', vodSubAppId: gVodHelper.conf.SubAppId })
}
});
}
```

### 帐号体系

本项目使用了简单的帐号提醒，用户注册时保存帐号和密码的哈希到数据库中；登录时检查帐号和密码是否正确，并生成 token 信息保存在数据库；客户端请求服务器时需要使用 token 计算 Sign 并放置再 Http 头信息 liteav-sig
中，服务器检查使用保
存的 token 计算出 Sign 与请求携带的 Sign 比较判断请求是否合法。

token 计算方法为 md5(帐号 ID + 时间戳 + 随机数 + "token"),计算代码如下：

```
token = crypto.createHash("md5").update(userid + "" + new Date().getTime() + "" + Math.random() + "token").digest("hex");
```


Sign 计算方法为 md5(token + md5(请求体))，计算代码如下：
```
crypto.createHash("md5").update(token + dataMd5).digest("hex");
```

## 源码说明

```
├── api                         
│   └── v0
│       ├── handler.js           //请求处理
│       ├── route.js             //请求路由
|       └──review                //鉴黄墙
|          ├── handler.js          //请求处理
│          └── route.js            //请求路由
├── app.js                       //启动文件
├── conf                       
│   ├── config_template.json     //配置文件模版
│   └── localconfig.json         //配置文件
├── include
│   └── enums.js                 //常量说明
├── middleware       
│   └── misc.js                  //中间件如登录校验
├── package.json                 //工程配置
├── README.md                   
├── routes
│   ├── taskcbHandlers.js        //回调消息处理
│   └── taskcb.js                //回调消息路由
├── scripts
│   └── voddemosqls.sql          //数据库脚本
├── tasks
│   └── reliable_cb_task.js      //可靠回调路由
├── test
│   ├── server.test.js           //服务测试文件
│   └── vod_helper.test.js       //点播 API 测试文件
└── utils
├── mysql_helper.js          //数据库功能封装
└── vod_helper.js            //点播功能封装
```

### 点播功能封装接口

为了方便调用点播接口，封装部分点播功能接口在 /utils/vod_helper.js 中，开发者可根据需要添加更多的接口实现。
```
/**
 * 为腾讯云服务SDK添加es6支持
 * @param {请求数据,将作为GET或者POST方法输入参数} params 
 * @param {HTTP请求配置，如方法设置等} opts 
 * @param {额外配置项,如外网代理等} extras 
 */
function CpiAsyncRequest(params,opts={},extras={});
```

```
/**
 * 生成上传签名
 * @param {timeStamp:过期时间戳, procedure:上传启动任务流, vodSubAppId: 点播子应用，不使用留空} param0 
 */
createFileUploadSignature({timeStamp = 86400,procedure='',classId=0,oneTimeValid=0,sourceContext='',vodSubAppId=0});
```


```

/**
 * 点播平台媒资信息获取封装接口，详细信息见https://cloud.tencent.com/document/product/266/8586
 * @param {fileId:视频文件ID,infoFilter:需要获取的信息，extraOpt:外网代理配置等} param0 
 */
async getVideoInfo({fileId,infoFilter=[],extraOpt={}});
```


```

/**
 * 请求点播平台未消费的事件通知，详细信息见：https://cloud.tencent.com/document/product/266/7829
 */
async pullEvent({extraOpt={}});
```

```

/**
 * 向vod平台确认消费事件通知，详细信息：https://cloud.tencent.com/document/product/266/7829
 */
async comfireEvent({msgHandles=[],extraOpt={}})
	```


# 接口概述
## 常量说明
### 返回码
	```
	ErrCode: {
EC_OK: 200, 
		   EC_BAD_REQUEST: 400,     
		   EC_SIGN_ERROR: 498,
		   EC_DATABASE_ERROR: 500,
		   EC_UPDATE_ERROR: 601,
		   EC_INVALID_PARAM: 602,
		   EC_USER_EXIST: 612,
		   EC_USER_NOT_EXIST: 620,
		   EC_USER_PWD_ERROR: 621,
		   EC_TASK_EXIST: 623, //没有任务了
		   EC_TASK_EXPIRE: 624,//任务过期
		   //这几个错误码是给后台回调用的
		   EC_SYSTEM_INVALID_JSON_FORMAT: 4001,
		   EC_SYSTEM_INVALID_PARA: 4002,
		   EC_SYSTEM_FREQUECY: 4003
	}
```
### UGC状态
```
ResourceStatus:{
READY:0,        //视频处理完成
		  NOT_READY:1,    //等待视频处理
}
```

### 审核状态
```
ReviewStatus:{
NotReivew:0,    //未审核
			  Normal:1,       //正常
			  Porn:2,         //涉黄
}
```
###鉴黄墙审核结果
```
ReviewMessage:{
Porn : "porn",  //通过审核
	 Pass : "pass",  //屏蔽视频
}
```

## 拉取视频列表

### 接口名称
get_ugc_list

### 功能说明
拉取服务端视频列表，该接口不需要鉴权。

### 请求方式

#### 请求方法
POST
#### 请求地址
/get_ugc_list

#### 参数说明
参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 
:-: | :-: | :-: | :-: | :-: | :-: 
index | number | 否 | 页码 | 0 | 0 
count | number | 否| 一页数量 | 10 | 10 

#### 请求示例
curl -d "index=0&count=10" "/get_ugc_list"

#### 接口应答
参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
code | number | 返回码 |  200 
message| string | 返回消息 |  
data | object | 返回数据 |
data.list | array | 视频列表 | 
data.list.n | ugcinfo | 视频详细信息 |

##### ugcinfo
参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
status | integer | 视频状态 |  0 
review_status| integer | 视频审核状态 |  0
userid | string | 所属用户id | 
file_id | string | 文件id | 
title | string | 视频标题 |
frontcover | string | 视频封面 |
location | string | 上传地理位置 |
play_url | string | 播放地址 |
create_time | string | 上传时间 |
nickname | string | 用户昵称 |
avatar | string | 用户头像 |


#### 应答示例
```
{
	"code": 200,  
		"message": "OK",
		"data": {
			"list": [
			{
				"status":0,
				"review_status":0,
				"userid":"xxx",			//用户id
				"nickname":"xxx",		//昵称
				"avatar":"xxx",			//头像url
				"file_id":"xxx",        //点播文件id
				"title":"xxxx",         //标题
				"frontcover":"xxx",     //封面图url
				"location":"xxx",       //地理位置
				"play_url":"xxx",       //播放地址
				"create_time":"xxxx-xx-xx xx:xx:xx",  //创建时间
			}
			]
		}
}
```


## 用户注册

### 接口名称
register
### 功能说明
用户注册

### 请求方式

#### 请求方法

POST
#### 请求地址
/register

#### 参数说明
参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 
:-: | :-: | :-: | :-: | :-: | :-: 
	userid | string | 是 |用户id |   |   user001
password | string | 是| 密码 |  |    md5(md5(password)+userid)

#### 请求示例


#### 接口应答
	参数名 | 类型 |  描述 | 示例 
	:-: | :-: | :-: | :-: 
	code | number | 返回码 | 200 
	message| string | 返回消息 |  

#### 应答示例
	```
{
	"code" : 200, 
		"message": "", 
}
```

## 登录
### 接口名称
login
### 功能说明
客户端使用帐号和密码登录，登录成功后返回令牌信息，cos配置信息和点播配置信息，其中token用于随后的权限校验，用户在调用需要鉴权的接口时需要带上 userid 和 HTTP_LITEAV_SIG 两个数据，其中 HTTP_LITEAV_SIG = md5(token+req.url+userid)。

### 请求方式

#### 请求方法

POST

#### 请求地址
/login

#### 参数说明
参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 
:-: | :-: | :-: | :-: | :-: | :-: 
	userid | string | 是 |用户id |   |   user001
password | string | 是| 密码 |  |    md5(md5(password)+userid)


#### 请求示例


#### 接口应答

	参数名 | 类型 |  描述 | 示例 
	:-: | :-: | :-: | :-:
	code | number | 返回码 | 200 
	message| string | 返回消息 |  
	data| object | 返回数据 |  
	data.token | string | 鉴权令牌 | 
	data.refresh_token | string | 刷新鉴权令牌 | 
	data.expires | integer | 过期时间 | 300
	data.cos_info | object | cos配置信息 | 
	data.cos_info.Bucket | string | cos bucket名 | 
	data.cos_info.Region | string | cos bucket所在地域 | 
	data.cos_info.Appid | string | cos Appid |
	data.cos_info.SecretId | string | cos Secretid |
	data.vod_info.Appid | string | vod appid |
	data.vod_info.SubAppId | string | vod SubAppId |
	data.vod_info.SecretId | string | vod SecretId |




#### 应答示例
	```
{
	"code": 200,  
		"message": "OK",
		"data":{ 
			"token": "xxx",    //随机数
			"refresh_token": "xxx", //续期token，随机数
			"expires": 300,  // 过期时间（秒）
			"roomservice_sign": {       //登录roomservice的签名
				"sdkAppID": 123456,     // 云通信 sdkappid
				"accountType": "xxxx",  // 云通信 账号集成类型
				"userID": "xxxx",       // 用户id
				"userSig": "xxxxxxxx",  // 云通信用户签名
			},
			"cos_info": {
				"Bucket": "xxx",           //cos bucket名
				"Region": "xxx",           //cos bucket所在地域
				"Appid":  "xxx",           //cos appid
				"SecretId": "xxx"          //cos secretid
			}
		}
}
```
## 获取 COS 签名

### 接口名称
get_cos_sign
### 功能说明
获取 cos 上传签名，可用于头像上传
### 请求方式

#### 请求方法
POST

#### 请求地址
/get_cos_sign

#### 参数说明

无

#### 请求示例


#### 接口应答
参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
message| string | 返回消息 |  
data| object | 返回数据 |  
data.signKey | string | 按照cos的签名规则计算出来的签名key | 
data.keyTime | string | 按照cos的签名规则，需要的签名有效期 | 



#### 应答示例
```
{
	"code": 200,
		"message": "OK",
		"data": {
			"signKey":"xxxx", 
			"keyTime":"xxxx"      
		}
}
```
## 上报用户数据

### 接口名称
upload_user_info
### 功能说明
注册完成后，上传用户头像、昵称等信息,后台将根据请求数据带的userid更新相应用户属性。

### 请求方式

#### 请求方法

POST

#### 请求地址

/upload_user_info


#### 参数说明

参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 
:-: | :-: | :-: | :-: | :-: | :-: 
nickname | string | 是 |用户id |   |   user001
avatar | string | 是| 头像 |  |   
sex | string | 是| 性别 0:male,1:female,-1:unknown |  |    
frontcover | string | 是| 封面地址 |  |  

#### 请求示例


#### 接口应答

参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
code | number | 返回码 | 200 
message| string | 返回消息 |  

#### 应答示例
```
{
	"code": 200,
		"message": "OK"
}
```




## 获取用户数据

### 接口名称
get_user_info
### 功能说明
获取用户头像，昵称等信息
### 请求方式

#### 请求方法
POST

#### 请求地址

/get_user_info

#### 参数说明

无
#### 请求示例


无

#### 接口应答

参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
code | number | 返回码 | 200 
message| string | 返回消息 |  
data| object | 返回数据 |  
data.nickname | string | 昵称 | 
data.avatar | string | 头像 | 
data.sex | integer | 性别 | 
data.frontcover | string | 封面 | 

#### 应答示例
```
{
	"code": 200,
		"message": "OK",
		"data": {
			"nickname":"xxx",
			"avatar":"http://xxxx",
			"sex":0 //0:male,1:female,-1:unknown
				"frontcover":"http://xxxx",     //封面图url
		}
}
```
## 获取点播上传签名


### 接口名称
get_vod_sign
### 功能说明



### 请求方式

#### 请求方法
POST

#### 请求地址

/get_vod_sign

#### 参数说明

无


#### 请求示例




#### 接口应答

参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
code | number | 返回码 | 200 
message| string | 返回消息 |  
data| object | 返回数据 |  
data.signature | string | 签名参数 | 

#### 应答示例
```
{
	"code": 200,
		"message": "OK",
		"data": {
			"signature":"xxx", //请求的点播签名
		}
}
```

## 发布小视频

### 接口名称
upload_ugc
### 功能说明

### 请求方式

#### 请求方法

POST

#### 请求地址
/upload_ugc

#### 参数说明

参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 
:-: | :-: | :-: | :-: | :-: | :-: 
file_id | string | 是 |点播文件id |   |   user001
title | string | 是| 标题 |  |   
frontcover | string | 是| 封面URL |  |    
location | string | 是| 地理位置 |  |  
play_url | string | 是| 播放地址 |  |  

#### 请求示例


#### 接口应答

参数名 | 类型 |  描述 | 示例 
:-: | :-: | :-: | :-: 
code | number | 返回码 | 200 
message| string | 返回消息 |  

#### 应答示例
```
{
	"code": 200, //602,参数错误; 601,更新失败; 500,数据库操作失败
		"message": "OK"
}
```
##鉴黄墙
####接口名称
review
####功能说明
管理员提交审核结果
####请求方式
POST
####请求地址
/review
####参数说明
参数名| 必填|类型|描述|示例
---- | ---
review_status|是|	string	|pass/porn
task_id	|是|string|	任务id
file_id	|是|string|	文件id	
reviewer_id	|是|string|	审核人，默认admin01

####接口应答
```
{
	"code" : 200, //任务失效 624
		"message": "", 
}

```
####接口名称
get_next_file
####功能说明
获取下一个待审核视频信息，包括视频基本信息，违规视频段，截图，起始时间
####请求方式
POST
####请求地址
/review/get_next_file
####参数说明
参数名| 必填|类型|描述|示例
---- | ---
reviewer_id	|是|string|	审核人，默认admin01
####接口应答
```
{
	"code": 200,  //没有任务了，返回623
		"message": "OK",
		"data": {
			"taskId":"xxx",
			"fileData":{
				"fileId":"xxx",
				"userId":"xxx",
				"title":"xxx",
				"url":"xxx"
			},
			"contentReviewList": [   //评审中，内容审核
			{   
				"taskType": "Porn",  //评审中，鉴黄
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10,
				},
				"output": {
					"confidence": 98.0,
					"suggestion": "block",
					"segment": [
					{
						"startTimeOffset": 20.0,
						"endTimeOffset": 120.0,
						"confidence": 98.0,
						"suggestion": "block",
						"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
						"picUrlExpireTime": 1258000
					},
					{
						"startTimeOffset": 120.0,
						"endTimeOffset": 130.0,
						"confidence": 54.0,
						"suggestion": "review",
						"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
						"picUrlExpireTime": 1258000
					}
					]
				}
			},
			{   
				"taskType": "Terriorism",  //评审中，暴恐
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10
				},
				"output": {
					"confidence": 0,
					"suggestion": "pass",
					"segment": []
				}
			}
			]
		}
}
```
# 参考
1. 腾讯云点播平台视频上传签名：https://cloud.tencent.com/document/product/266/9219

2. 腾讯云点播平台事件回调：https://cloud.tencent.com/document/product/266/7829

3. 腾讯云点播平台媒资获取：https://cloud.tencent.com/document/product/266/8586

4. 腾讯云点播平台 AI 鉴黄：https://cloud.tencent.com/document/product/266/11701#.E8.A7.86.E9.A2.91.E9.89.B4.E9.BB.84

5. 腾讯云Node.js SDK：https://cloud.tencent.com/document/sdk/Node.js
