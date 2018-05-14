
# REST 接口

功能接口使用json格式，所有交互的http加上header `Content-Type:application/json`。

## 注册

- 接口： 

```
路径：       /register 

```

- 参数：

```json
{
	"userid" : "jacqiu",
	"password" : "md5(md5(password)+userid)", // md5后的密码字符
}
```

- 返回：

```json
{
	"code" : 200, //610,用户名格式错误; 611,密码格式错误; 612,用户已存在; 500,服务器错误(数据库查询失败)
	"message": "",  // 错误消息
}
```

## 登陆:


- 接口: 

```
路径：		/login
```

- 参数：

```json
{
	"userid": "jacqiu",
	"password": "",
}
```

- 返回: 

```json
{
	"code": 200,   //621,密码错误; 620,用户不存在; 500,服务器错误(数据库查询失败)
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


## 续期

登陆快过期，续期接口

```
路径：		/refresh
```

- 参数:

```json
{
	"userid": "",
	"refresh_token": ""
}
```

- 返回：

token, 和refresh_token 会被更新

```json
{
	"code": 200,    //500,数据库查询失败; 498,校验失败; 602,参数错误
	"message": "OK",
	"data":{ 
		"token": "xxx", 
		"refresh_token": "xxx", //续期token
		"expires": 300,  // 过期时间（秒）
	}
}
```
##获取游客信息(仅供H5分享页面使用)
```
路径：		/get_visitor_info
```
- 参数:

```json
{
	"userid": "xxx", //分享者userid
	"roomid": "xxx", //直播房间号
	"txTime": 1515134506,   //登陆时返回的roomservice的请求失效时间（时间戳单位秒）
	"sign": "xxx" //登陆时返回的roomservice的请求的签名，计算方法sign = md5（apiKey + txTime + userID）
}
```

- 返回:

```json
{
	"code": 200,
	"message": "OK",
	"data": {
		"userid":"xxxx", //后台创建的匿名userid
		"sdkAppID":"xxxx",
		"accType":"xxx",
		"userSig":"xxx",
		
		"apiKey":"xxx",
		"roomID":"xxx",
		“txTime":xxxxxx,
		"sign":"xxx" //计算方法sign = md5（apiKey + userID + roomID + txTime）
	}
}
```

>**除注册，登录，续期，获取游客信息接口外，其它每个接口都需要在http header增加一个自定义类型"Liteav-Sig"，用于签名。http body需要增加userid、timestamp、expires这三个公共参数。一个完整的htt请求实体如下：**

>```
请求实体(json)：
{
	"userid":"xxxx",
	"timestamp": 1512890037,  //当前时间戳
	"expires":3,  //超时时间(秒)
	<各接口请求参数>
}
```
>签名方式：md5(token+md5(http.body))


## 获取用户信息
```
路径： /get_user_info
```
- 参数：  

```json
空
```
- 返回：

```json
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

## 上传用户信息
```
路径： /upload_user_info
```
- 参数

```json
{
	"nickname":"xxx",
	"avatar":"http://xxxx",
	"sex":0 //0:male,1:female,-1:unknown
	"frontcover":"http://xxxx",     //封面图url
}
```
- 返回：

```json
{
	"code": 200, //601,更新失败; 500,数据库操作失败
	"message": "OK"
}
```

## 拉回放列表
```
路径： /get_vod_list
```
- 参数

```json
{
	"index":0,
	"count":20
}
```
- 返回

```json
{
	"code": 200,  //602,参数错误
	"message": "OK",
	"data": {
		"list": [
			{
				"userid":"xxx",			 //用户id
				"nickname":"xxx",		 //昵称
				"avatar":"xxx",			 //头像url
				"file_id":"xxx",        //点播文件id
				"title":"xxxx",          //标题
				"like_count": 0,			 //点赞数
      			"viewer_count": 0,		 //观看数
				"frontcover":"xxx",     //封面图url
				"location":"xxx",       //地理位置
				"play_url":"xxx",       //点播播放地址
				"create_time":"2017-12-13 08:06:29",  //回放创建时间
				"hls_play_url":"xxx",   //hls播放地址
				"start_time":"2017-12-13 08:06:29"   //直播开播时间
			}
		]
	}
}
```

## 上传房间信息
```
路径： /upload_room
```
- 参数

```json
{
	"title":"XXX",
    "location":"xxx",       //地理位置
}
```
- 返回：

```json
{
	"code": 200,  //602,参数错误; 500,数据库操作失败
	"message": "OK"
}
```

## 发布小视频

```
路径：		/upload_ugc
```

- 参数：

```json
{
	"file_id":"xxx",        //点播文件id
	"title":"xxxx",         //标题
	"frontcover":"xxx",     //封面图url
	"location":"xxx",       //地理位置
	"play_url":"xxx",       //播放地址
}
```

- 返回:

```json
{
	"code": 200, //602,参数错误; 601,更新失败; 500,数据库操作失败
	"message": "OK"
}
```

## 获取小视频列表

```
路径：		/get_ugc_list
```

- 参数：

```json
{
	"index":0,
	"count":20
}
```

- 返回:

```json
{
	"code": 200,  //602,参数错误
	"message": "OK",
	"data": {
		"list": [
			{
				"userid":"xxx",			 //用户id
				"nickname":"xxx",		 //昵称
				"avatar":"xxx",			 //头像url
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
##获取roomservice服务签名
```
路径：		/get_roomservice_sign
```
- 参数:

```json
{
	"userid":"xxx"
}
```

- 返回:

```json
{
	"code": 200, //602,参数错误
	"message": "OK",
	"data": {
		"txTime":15114235, //请求失效时间（时间戳单位秒）
		"sign":"xxxx"     //请求的签名，计算方法sign = md5（apiKey + txTime + userID）
	}
}
```


##获取点播签名
```
路径：		/get_vod_sign
```
- 参数:

```
空
```

- 返回:

```json
{
	"code": 200,
	"message": "OK",
	"data": {
		"signature":"xxx", //请求的点播签名
	}
}
```

##获取COS签名
```
路径：		/get_cos_sign
```
- 参数:

```
空
```

- 返回:

```json
{
	"code": 200,
	"message": "OK",
	"data": {
		"signKey":"xxxx",     //按照cos的签名规则计算出来的签名key
		"keyTime":"xxxx"      //按照cos的签名规则，需要的签名有效期，格式为 签名有效期起始时间戳(单位s):签名有效期过期时间戳(单位s)
	}
}
```


# 数据库

## 用户信息

```mysql
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
```
##回放列表
```
CREATE TABLE IF NOT EXISTS tb_vod (
  userid varchar(50) NOT NULL,
  file_id varchar(150) NOT NULL,
  frontcover varchar(255) DEFAULT NULL,
  location varchar(128) DEFAULT NULL,
  play_url varchar(255) DEFAULT NULL,
  like_count int(11) NOT NULL DEFAULT '0',
  viewer_count int(11) NOT NULL DEFAULT '0',
  create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hls_play_url varchar(255) DEFAULT NULL,
  start_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title varchar(128) DEFAULT NULL,
  PRIMARY KEY (userid,file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
##小视频列表
```
CREATE TABLE IF NOT EXISTS tb_ugc (
  userid varchar(50) NOT NULL,
  file_id varchar(150) NOT NULL,
  title varchar(128) DEFAULT NULL,
  frontcover varchar(255) DEFAULT NULL,
  location varchar(128) DEFAULT NULL,
  play_url varchar(255) DEFAULT NULL,
  create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userid,file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
##房间信息列表
```
CREATE TABLE IF NOT EXISTS tb_room (
  userid varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  frontcover varchar(255) DEFAULT NULL,
  location varchar(128) DEFAULT NULL,
  create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
##roomservice的数据上报表
```
CREATE TABLE IF NOT EXISTS tb_report (
  report_id BIGINT UNSIGNED AUTO_INCREMENT,
  str_appid varchar(150) NOT NULL,
  str_roomid varchar(150) NOT NULL,
  str_room_creator varchar(150) NOT NULL,
  str_userid varchar(150) NOT NULL,
  str_platform varchar(50) DEFAULT NULL,
  int64_ts_enter_room BIGINT DEFAULT 0,
  int64_tc_join_group BIGINT DEFAULT 0,
  int64_tc_get_pushers BIGINT DEFAULT 0,
  int64_tc_play_stream BIGINT DEFAULT 0,
  int64_tc_get_pushurl BIGINT DEFAULT 0,
  int64_tc_push_stream BIGINT DEFAULT 0,
  int64_tc_add_pusher BIGINT DEFAULT 0,
  int64_tc_enter_room BIGINT DEFAULT 0,
  create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  str_appversion varchar(128) DEFAULT NULL,
  str_sdkversion varchar(128) DEFAULT NULL,
  str_common_version varchar(128) DEFAULT NULL,
  str_nickname varchar(128) DEFAULT NULL,
  str_device varchar(128) DEFAULT NULL,
  str_device_type varchar(128) DEFAULT NULL,
  str_play_info varchar(500) DEFAULT NULL,
  str_push_info varchar(500) DEFAULT NULL,
  int32_is_roomservice INT DEFAULT 0,
  PRIMARY KEY (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

##数据库测试

###插入回放记录
```
INSERT INTO tape_data (userid, file_id, play_url, start_time) VALUES('1', '1', 'hhh', '2017-12-14 07:48:18');
```

##HTTP 请求测试
###注册
```
curl -d "userid=yaobo10&password=12345678" "https://roomtest.qcloud.com/lite/register"
curl -d "userid=yaobo1&password= 12345678" "http://127.0.0.1:63795/lite/register"
```
###登录
```
curl -d "userid=yaobo3&password=135678" "https://roomtest.qcloud.com/lite/login"
curl -d "userid=yaobo1&password=pwd5" "http://127.0.0.1:63795/lite/login"
```
###续期
```
curl -d "userid=2&refresh_token=cfoe04e22wv" "http://127.0.0.1:8080/liteav/refresh"
```
###直播云回调回放信息
```
curl -d "t=1513234132&sign=xxxxxx&event_type=100&file_id=2&stream_id=123_2&start_time=1513233336&video_url=http://1252463788.vod2.myqcloud.com/e12fcc4dvodgzp1252463788/4d6dc6d54564972818651655662/f0.mp4" "http://127.0.0.1:8080/liteav/tape_callback"
```
###获取回放列表
```
curl -d "index=0&count=10" "http://127.0.0.1:8080/lite/get_vod_list"
curl -d "index=0&count=10" "https://roomtest.qcloud.com/lite/get_vod_list"
```
###更新用户信息
```
curl -d "userid=2&nickname=test&avatar=xxxx&sex=0" "http://127.0.0.1:8080/lite/upload_user_info"
```
###获取用户信息
```
curl -d "userid=2" "http://127.0.0.1:8080/lite/get_user_info"
```
###发布小视频
```
curl -d "userid=2&file_id=2&title=测试&frontcover=http://xxx.png&location=hhhh&play_url=http://xxx.flv" "http://127.0.0.1:8080/lite/upload_ugc"
```
###拉取小视频列表
```
curl -d "index=0&count=1" "http://127.0.0.1:8080/lite/get_ugc_list"
```

