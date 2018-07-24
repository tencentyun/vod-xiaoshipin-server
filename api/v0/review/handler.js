

const APP_BASE_PATH = '../../../';
const ENUMS = require(APP_BASE_PATH + "include/enums");

const mysql = require('mysql');
const EXPIRETIME = "0:3:0";

function checkString({
	str, minLength, maxLength
}) {


	if (!minLength) {
		minLength = 0;
	}

	if (!maxLength) {
		maxLength = 65536;
	}
	if (str == undefined) {
		console.log("undefined");

		return false;
	}

	if (str.length > maxLength || str.length < minLength) {
		console.log("length");
		return false;
	}
	return true;
}


async function get_next_file(req, res){
	let param = req.body;
	let reviewer = "";
	let data = {};
	let fileid = "";
	let title = "";
	let url = "";
	let userid = "";

	if (!checkString({str : param.reviewer_id})){
		return res.status(400).json({
			"code": ENUMS.ErrCode.EC_INVALID_PARAM,
			"message": "审核人信息错误"
		});
	}
	reviewer = param.reviewer_id;
	try {
		conn = await gDataBases["db_litvideo"].getConnection();
		let tasksql = "select * from tb_queue where owner= ? and mark_time > SUBTIME(NOW(), ?) order by create_time limit 1";
		let myTaskList = await conn.queryAsync(tasksql,[reviewer, EXPIRETIME]);
		console.log(myTaskList.length);
		//	console.log(myTask.review_data)
		if(myTaskList.length != 0){
			data = myTaskList[0];
		}else{	
			//事务，领取任务
			await conn.beginTransaction();
			try {
				let result = await conn.queryAsync('select * from tb_queue where owner is null or (owner is not null and mark_time < SUBTIME(NOW(), ?)) order by create_time limit 1 for update',[EXPIRETIME]);
				await conn.queryAsync('update tb_queue set owner = ?, mark_time = NOW() where task_id = ?', [reviewer, result[0].task_id]);
				await conn.commit();

			} catch (err) {
				await conn.rollback();
			}
			let myTaskListNew = await conn.queryAsync(tasksql,[reviewer, EXPIRETIME]);
			if(myTaskListNew.length != 0){
				data = myTaskListNew[0];
			}else {
				return res.json({
					'code' : ENUMS.ErrCode.EC_TASK_EXIST,
					'message' : '没有更多任务'
				});
			} 
		}
		fileid = data.file_id;
		let fileData = await conn.queryAsync('select * from tb_ugc where file_id= ?',[fileid]);
		//console.log(fileData.length);
		//console.log(fileid);
		if (fileData.length != 0){
			userid = fileData[0].userid;
			title = fileData[0].title;
			url = fileData[0].play_url;
		}
		//console.log(url)
	}catch (err){
		console.log(err);
		return res.status(500).json({
			'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
			'message': '服务器错误'
		});
	}finally {
		if (conn != null) {
			conn.release();
		}
	}
	return res.json({
		"code" : ENUMS.ErrCode.EC_OK,
		"message": "OK",
		"data" : {
			"taskId" : data.task_id,
			"fileData" : {
				"fileId":fileid,
				"userId":userid,
		        "title":title,
		        "url":url
			},
		   "contentReviewList":[JSON.parse(data.review_data)]
		}
	});
}
async function review(req, res){
	let param = req.body;
	let reviewer = param.reviewer_id;
	let taskid = param.task_id;
	let fileid = param.file_id;
	let msg = param.review_status;
	let reviewStatus = 0;
	console.log(param.reviewer_id)
	if (!checkString({str:reviewer,maxLength:50})) {
		return res.status(400).json({
			"code": ENUMS.ErrCode.EC_INVALID_PARAM,
			"message": "审核员id格式错误",
		});			
	}
	if (!checkString({str:taskid, minLength: 1, maxLength: 100})) {
		return res.status(400).json({
			"code": ENUMS.ErrCode.EC_INVALID_PARAM,
			"message": "taskid格式错误",
		});			
	}
	if (!checkString({str:fileid, minLength: 1, maxLength: 100})) {
		return res.status(400).json({
			"code": ENUMS.ErrCode.EC_INVALID_PARAM,
			"message": "fileid格式错误",
		});			
	}
	if (!checkString({str:msg, minLength: 1, maxLength: 100}) || (msg!="pass" && msg!="porn")) {
		return res.status(400).json({
			"code": ENUMS.ErrCode.EC_INVALID_PARAM,
			"message": "msg格式错误",
		});			
	}

	try {
		conn = await gDataBases["db_litvideo"].getConnection();
		let owner = await conn.queryAsync('select * from tb_queue where task_id = ?',[taskid]);
		if (owner.length == 0||reviewer != owner[0].owner){
			return res.json({
				'code': ENUMS.ErrCode.EC_TASK_EXPIRE,
				'message' : '当前任务失效'
			});
		}
		if(owner[0].file_id != fileid){
			return res.status(400).json({
				"codezo": ENUMS.ErrCode.EC_INVALID_PARAM,
				"message": "fileid或taskid错误",
			});			
		}
		if(msg == ENUMS.ReviewMessage.Porn){
			reviewStatus = ENUMS.ReviewStatus.Porn;
		}else if (msg == ENUMS.ReviewMessage.Pass){
			reviewStatus = ENUMS.ReviewStatus.Normal;
		}
		await conn.queryAsync('update tb_ugc set review_status=? where file_id=?', [reviewStatus,fileid]);
		await conn.beginTransaction();
		try{
			exitTask = await conn.queryAsync('select * from tb_review_record where task_id=?',[taskid]);
			if(exitTask.length == 0){
				await conn.queryAsync('insert into tb_review_record(task_id,file_id,reviewer_id,review_status) values(?,?,?,?)', [taskid, fileid, reviewer, msg]);
			}else {
				await conn.queryAsync('update tb_review_record set reviewer_id=?,review_status=?',[reviewer, msg]);
			}
			await conn.queryAsync('delete from tb_queue where task_id=?', [taskid]);
			await conn.commit();
		}catch (err) {
			await conn.rollback()
		}			
	}catch (err){
		console.log(err);
		return res.status(500).json({
			'code': ENUMS.ErrCode.EC_DATABASE_ERROR,
			'message': '服务器错误'
		});
	}finally {
		if (conn != null) {
			conn.release();
		}
	}
	
	return res.json({
		'code':ENUMS.ErrCode.EC_OK,
		"message": "OK",
	});
}
module.exports = {
	get_next_file,
	review
}

