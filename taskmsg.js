var taskmsg = {
	"version": "4.0",
	"eventType": "ProcedureStateChanged",
	"data": {
		"vodTaskId": "1400104074-procedurev2-bd67a325dbc1471915e1f632d41b7f22",
		"status": "PROCESSING",
		"message": "",
		"errCode": 0,
		"fileId": "5285890780486257682",
		"metaData": {  //已上线，元信息
			"size": 10556,
			"container": "m4a",
			"bitrate": 246035,
			"height": 480,
			"width": 640,
			"md5": "b3ae6ed07d9bf4efeeb94ed2d37ff3e3",
			"duration": 3601,
			"videoStreamList": [{
				"bitrate": 246000,
				"height": 480,
				"width": 640,
				"codec": "h264",
				"fps": 22
			}],
			"audioStreamList": [{
				"codec": "aac",
				"samplingRate": 44100,
				"bitrate": 35
			}]
		},
		"contentReviewList": [   //内容审核
		{   
			"taskType": "Porn",  //鉴黄
			"status": "SUCCESS",
			"errCode": 0,
			"message": "",
			"input": {
				"definition": 10
			},
			"output": {
				"confidence": 58.0,
				"suggestion": "review",
				"segments": [
				{
					"startTimeOffset": 20.0,
					"endTimeOffset": 120.0,
					"confidence": 98.0,
					"suggestion": "block",
					"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
					"picUrlExpireTimeStamp": 1258000,
				},
				{
					"startTimeOffset": 120.0,
					"endTimeOffset": 130.0,
					"confidence": 54.0,
					"suggestion": "review",
					"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
					"picUrlExpireTimeStamp": 1258000
				}
				]
			}
		},
		{   
			"taskType": "Terriorism",  //暴恐
			"status": "SUCCESS",
			"errCode": 0,
			"message": "",
			"input": {
				"definition": 10
			},
			"output": {
				"confidence": 0,
				"suggestion": "pass",
				"segments": []
			}
		},
		{   
			"taskType": "SensitiveText",  //规划中（挂起），敏感文字
			"status": "SUCCESS",
			"errCode": 0,
			"message": "",
			"input": {
				"definition": 10
			},
			"output": {
				"confidence": 98.0,
				"segments": [
				{
					"startTimeOffset": 0,
					"endTimeOffset": 10.0,
					"confidence": 98.0,
					"suggestion": "block",
					"msg": "加微信看爽片",
					"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
					"picUrlExpireTime": 1258000
				}
				]
			}
		},
		{   
			"taskType": "QRCode",  //规划中（挂起），二维码
			"status": "SUCCESS",
			"errCode": 0,
			"message": "",
			"input": {
				"definition": 10
			},
			"output": {
				"confidence": 100.0,
				"suggestion": "block",
				"segments": [
				{
					"startTimeOffset": 0,
					"endTimeOffset": 10.0,
					"confidence": 100.0,
					"suggestion": "block",
					"qRUrl": "http://xxxxxxxxxx",
					"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
					"picUrlExpireTimeStamp": 1530005146
				}
				]
			}
		},
		{   
			"taskType": "Political",  //规划中（挂起），政治人物
			"status": "SUCCESS",
			"errCode": 0,
			"message": "",
			"input": {
				"definition": 10
			},
			"output": {
				"confidence": 70,
				"suggestion": "review",
				"resultExpireTime": 1526269387,
				"segments": [
					{
						"startTimeOffset": 0.0,
						"endTimeOffset": 10.0,
						"confidence": 100.0,
						"suggestion": "block",
						"name": "特朗普",
						"url": "http://xxx.vod2.myqcluod.com/xxx/xxx/xx.jpg",
						"picUrlExpireTimeStamp": 1530005146
					}
				]
			}
		}
		],
			"drm": {
				"definition": 10,
				"getKeyUrl": "https://123.xxx.com/getkey",
				"keySource": "VodBuildInKMS",
				"edkList": [
					"232abc30"
					]
			},
			"processTaskList": [
			{
				"taskType": "Transcode",
				"status": "PROCESSING",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10,
					"watermarkDefinition": [100, 101],
					"mosaicList":[ {  //评审中，遮标
						"width": "20%",  //遮挡宽度（单位可以为 px 或者 %）
						"height": "10%",  //遮挡高度（单位可以为 px 或者 %）
						"left": "20px",  //左上角横坐标（单位可以为 px 或者 %）
						"top": "10px",  //左上角纵坐标（单位可以为 px 或者 %）
						"startTimeOffset": 1.0,  //起始时间
						"endTimeOffset": 10.0  //结束时间
					}
					]
				}
			},
			{
				"taskType": "Transcode",
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 20,
					"watermark": 1
				},
				"output": {
					"url": "http://125xx.vod2.myqcloud.com/xx/xx/f20.mp4",
					"size": 10556,
					"container": "m4a",
					"md5": "b3ae6ed07d9bf4efeeb94ed2d37ff3e3",
					"bitrate": 246035,
					"height": 480,
					"width": 640,
					"duration": 3601,
					"videoStreamList": [{
						"bitrate": 246000,
						"height": 480,
						"width": 640,
						"codec": "h264",
						"fps": 222
					}],
					"audioStreamList": [{
						"codec": "aac",
						"samplingRate": 44100,
						"bitrate": 35
					}]
				}
			},
			{
				"taskType": "AnimatedGraphics",   
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 20000,
					"startTime": 10,
					"endTime": 15
				},
				"output": {
					"url": "http://125xx.vod2.myqcloud.com/xx/xx/f20000.gif",
					"container": "gif",
					"height": 480,
					"width": 640,
					"fps": 2
				}
			},
			{
				"taskType": "SampleSnapshot",
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10,
					"watermarkDefinition": [100, 101]    //截图水印
				},
				"output": {
					"imageUrls": [
						"http://125xx.vod2.myqcloud.com/xx/xx/shotup/1.png",
						"http://125xx.vod2.myqcloud.com/xx/xx/shotup/2.png",
						"http://125xx.vod2.myqcloud.com/xx/xx/shotup/10.png"
						]
				}
			},
			{
				"taskType": "CoverBySnapshot",
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10,
					"position": 10,
					"positionType": "Percent",
					"watermarkDefinition": [100, 101]    //截图水印
				},
				"output": {
					"imageUrl": "http://125xx.vod2.myqcloud.com/xx/xx/shotup/xx1.png"
				}
			},
			{
				"taskType": "SnapshotByTimeOffset",
				"status": "SUCCESS",
				"message": "",
				"errCode": 0,
				"input": {
					"definition": 10,
					"timeOffset": [
						300,
					400
						],
					"watermarkDefinition": [100, 101]    //截图水印
				},
				"output": {
					"imgInfo": [{
						"timeOffset": 300,
						"url": "http://125xx.vod2.myqcloud.com/xx/xx/snapshot/1502280085_887773835.100_300.jpg"
					},
					{
						"timeOffset": 400,
						"url": "http://125xx.vod2.myqcloud.com/xx/xx/snapshot/1502280085_887773835.100_400.jpg"
					}
					]
				}
			},
			{
				"taskType": "ImageSprites",
				"status": "SUCCESS",
				"message": "SUCCESS",
				"errCode": 0,
				"input": {
					"definition": 10
				},
				"output": {
					"totalCount": 106,
					"urlList": [
						"http://125xx.vod2.myqcloud.com/xx/xx/1502280085_887773835.100_0.png",
					"http://125xx.vod2.myqcloud.com/xx/xx/1502280085_887773835.100_1.png"
						],
					"webVttUrl": "http://125xx.vod2.myqcloud.com/xx/xx/1502280085_887773835.vtt"
				}
			}
		],
			"aIAnalysisList": [   //AI 智能分析
			{
				"taskType": "Classification",   //智能分类
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10
				},
				"output": {
					"classifications": [
					{
						"classification": "军事",
						"confidence": 98.7
					},
					{
						"classification": "时政",
						"confidence": 98.7
					}
					]
				}
			},
			{
				"taskType": "Cover",  //智能封面
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10
				},
				"output": {
					"covers": [
					{
						"coverUrl": "http://shortvideo-1251820392.file.myqcloud.com/cov/taskid1_1.jpg",
						"confidence": 98.7
					},
					{
						"coverUrl": "http://shortvideo-1251820392.file.myqcloud.com/cov/taskid1_2.jpg",
						"confidence": 98.7
					},
					{
						"coverUrl": "http://shortvideo-1251820392.file.myqcloud.com/cov/taskid1_3.jpg",
						"confidence": 98.7
					},
					{
						"coverUrl": "http://shortvideo-1251820392.file.myqcloud.com/cov/taskid1_3.jpg",
						"confidence": 98.7
					}
					]
				}
			},
			{
				"taskType": "Description",   //智能描述
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10
				},
				"output": {
					"descriptions": [
					{
						"description": "种菜绝对是一个神奇的自主品牌中山赛道河道原创率在总台的转变速度也堪称第一气象的第五百一经曝光就引起了不小的轰动，原来中餐的原创实力有阻止的强悍，而这款车型也终于上市6.98万到12.38万的售价也没有让各位消费者失望种菜也再次刷新了这个价位的颜值和豪华感",
						"confidence": 98.7
					}
					]
				}
			},
			{
				"taskType": "Highlight",   //智能精彩镜头
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10
				},
				"output": {
					"highlights": [
					{
						"highlightUrl": "http://shortvideo-1251820392.file.myqcloud.com/test/1.mp4",
						"confidence": 98.7
					},
					{
						"highlightUrl": "http://shortvideo-1251820392.file.myqcloud.com/test/2.mp4",
						"confidence": 98.7
					},
					{
						"highlightUrl": "http://shortvideo-1251820392.file.myqcloud.com/test/3.mp4",
						"confidence": 98.7
					}
					]
				}
			},
			{
				"taskType": "Tag",   //智能标签
				"status": "SUCCESS",
				"errCode": 0,
				"message": "",
				"input": {
					"definition": 10
				},
				"output": {
					"tags": [
					{
						"tag": "武器",
						"confidence": 98.7
					},
					{
						"tag": "舰船",
						"confidence": 98.5
					},
					{
						"tag": "海洋",
						"confidence": 88.5
					}
					]
				}
			}
		]
	}
}
module.exports.taskmsg = taskmsg;
