
--在root权限下数据库用户与权限
create user 'litvideo'@'localhost' identified by 'litvideo';
create database db_litvideo default charset utf8 collate utf8_general_ci;
grant all privileges on `db_litvideo`.* to 'litvideo'@'%' identified by 'litvideo';

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
  PRIMARY KEY (userid,file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_room (
  userid varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  frontcover varchar(255) DEFAULT NULL,
  location varchar(128) DEFAULT NULL,
  create_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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


CREATE TABLE IF NOT EXISTS tb_token(
  token VARCHAR(32) NOT NULL,
  userid VARCHAR(50) NOT NULL,
  expire_time DATETIME NOT NULL DEFAULT '1970-01-01',
  refresh_token VARCHAR(32) NOT NULL,
  PRIMARY KEY(token),
  KEY(userid),
  KEY(expire_time)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;