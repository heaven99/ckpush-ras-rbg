/**
 * ckpush-ras
 *
 * Copyright(C) 2017 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ras-config.js
 * @version : 4.0.0
 * @notes
 */

/* ///////////////////////////////////////////////////////////////////
 * require packages
 */
// require from node.js
var os = require('os');
var fs = require('fs');
var util = require('util');


// require from third-party ( use pakagename )
var moment  = require('moment');


// require for this project




//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

/* ///////////////////////////////////////////////////////////////////
 * exports objects
 */
var config = {
    // MySQL DB ADMIN (MASTER)
    // CKPUSH - DEV DBUSER

    db_user: 'ckpush_user',
    db_pass: 'uWyEaUs4uQ7Ayc',
    db_name: 'ckpush_db',

    // REDIS for EVENT
    redis_server: '127.0.0.1',
    redis_server_port: 6379,
    redis_db: 5,

    redis_data_server: '127.0.0.1',
    redis_data_server_port: 6379,
    redis_data_db: 6,

    // MONGO DB
    mongo_server: 'mongodb://localhost:27017',
};

// INFO : 아래와 같이 전체 object 로 참조하면 외부에서 참조 및 멤버수정이 가능하다.
//
exports.config = config;

///////////////////////////////////////////////


/* ///////////////////////////////////////////////////////////////////
 * global functions
 */



exports.exit = function (exit_code) {
    process.exit(exit_code);
}
// exports.exit = function (exit_code, exit_reason) {
// 	// console.log('STOP -  PROCESS : exit(' + exit_code + ')');
// 	// console.log(util.inspect(exit_reason));
// 	process.exit(exit_code);
// }

///////////////////////////////////////////////////////////////
// UTILS. : 이거 주의 해야한다. (recursive 되는 것은 표현하지 못한다.)
exports.inspect = function (data) {
	return JSON.stringify(data);
//	return util.inspect(data);
}






