


# 概述

本项目为腾讯云小视频 APP 后台服务，采用 Nodejs 和 Mysql搭建，提供了腾讯云点播平台视频上传，回调处理以及媒资管理等功能的演示。用户可以下载本项目源码搭建自己的小视频后台服务。



# 准备

## 帐号申请
 1. 申请[腾讯云](https://cloud.tencent.com/)帐号，获取[API密钥](https://console.cloud.tencent.com/cam/capi)，得到 Appid,SecretId,SecretKey
 2. 设置点播平台回调配置:部署域名+/taskcb,参考[腾讯云点播回调配置](https://cloud.tencent.com/document/product/266/7829)

## 环境准备

### 安装Nodejs
```
sudo apt-get install nodejs-legacy nodejs
sudo apt-get install npm
sudo node -v
```

### 安装Mysql (mariadb) 
```
sudo apt update
sudo apt install mariadb-server
sudo mysql --version
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
        "dbconfig":{                       //数据库配置
            "host":"127.0.0.1",              //数据库 IP 地址，保持默认本机
            "user":"litvideo",               //数据库用户名，保持默认
            "password":"litvideo",           //数据库登录密码，保持默认
            "database":"db_litvideo",        //小视频所用数据库，保持默认
            "port":3306,                     //数据库端口，保持默认
            "supportBigNumbers": true,       //保持默认
            "connectionLimit":10             //保持默认
        },
        "tencentyunaccout":{              //腾讯运云帐号配置
            "appid":"",                     //腾讯云 Appid
            "SubAppId":"",                  //腾讯云点播子帐号，默认不使用，保持为空
            "SecretId": "",                 //腾讯云 SecretId
            "SecretKey": ""                 //腾讯云 SecretKey
        },
        "cos":{                          // COS 配置，用于保存图片数据
            "appid":"",                    //腾讯云 Appid
            "bucket":"xiaoshipin",         //使用 bucket
            "region":"ap-guangzhou",       // bucket 所在地域
            "SecretId": "",                //腾讯云 SecretId
            "SecretKey": ""                //腾讯云 SecretKey
        },
        "server":{                        
            "ip":"0.0.0.0",               //服务启动 IP ，保持默认
            "port":8001,                  //服务启动端口，保持默认
            "reliablecb":true            //回调选择，保持默认
        }
    }
```
   

## 启动服务

在腾讯云点播控制台，【视频处理设置】下【回调配置中】设置回调模式为可靠回调，该配置可能需要 10 分钟才能生效
![回调设置](https://main.qcloudimg.com/raw/3dcabb94e5ce7a84c0497cd4c0cb9941.png)
在工程根目录下下启动服务
```
npm start
```

服务启动后，再另外一个终端下测试视频拉取接口

```
curl -l -H "Content-type: application/json" -X POST -d '' http://localhost:8001/get_ugc_list
```

如果服务正常运行，可返回如下结果
```
{"code":200,"message":"OK","data":{"list":[],"total":0}}
```
服务启动正常后，可以使用客户端或者腾讯云点播控制台上传视频就行测试



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
    				“file_id":"xxx",        //点播文件id
    				"title":"xxxx“,         //标题
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

# 实现
## 业务逻辑
### 设计


### 帐号体系


### AI 鉴黄




## 源码说明
