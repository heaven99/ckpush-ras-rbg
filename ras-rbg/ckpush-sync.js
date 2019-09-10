/**
 * ckpush-ras
 * 
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 * 
 * -----------------------------------------------------------
 * @file : ckpush-sync.js
 * @version : 3.0.0
 * @notes
 */


////////////////////////////////////////////////////////////////////
// require packages
//
// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');

// require from third-party ( use pakagename )
var async = require('async');
var winston = require('winston');

var redis = require('redis');
var backbone = require('backbone');

var request = require('request');
var moment = require('moment');

//
// global util/config variable
var gv = require('./ras-gv.js');

// global service variable
// 
var fv = {
	//
	// framework variables
	assert_timer : 0,
	assert_count : 0,
	assert_interval : 100,
	assert_limit : 10,
	
	//
	// module handles
	redis_client : null,
    redis_data_client : null,       // redis data
	redis_sub_ch : null,
	redis_pub_ch : null,


	//
	// service modules	
	protocol : null,
		
	//
	// service data models
	models : {
		message_queue : null,
		ui_object : null, 
	},		
	
	//
	// for model instance : 여러개가 필요없다면 만들어 두고 사용한다.
	datas : {
	},			
}

var log;			// for log
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////



function configure () {
	async.series(
		[
			///////////////////////////////////////////////////////////
			//
			function load_configure (next_function) {
				console.log('  +start of load_configure');
				
				// user param.
				if (process.argv.length < 3) {
					gv.exit(-1, { desc : 'ERROR no /WebSocket/HTTP port parameter .' } );
				}
			
				gv.configure(
					{
						cfg : "ckpush-sync.cfg.json",
						log : "ckpush-sync",
					},
					function(error, result) {
						gv.config.crm.httpd_port = parseInt(process.argv[2]);
						gv.config.crm.log_path = gv.config.crm.log_path + '/ckpush-sync-' + gv.config.crm.httpd_port;
						
						//gv.print_config();
						console.log('  +end of load_configure');
						next_function(null, '');
					}
				);
			},
			///////////////////////////////////////////////////////////
			//
			function log_configure (next_function) {
				console.log('  +start of log_configure');
				
				// INFO : 여기서 화일을 연결한다 하더라도 바로 연결되는게 아니다. (거의 프로그램이 실행될때 연결된다) 
				gv.config.log = new (winston.Logger)({
					transports: [
						new (winston.transports.Console)({
                            level    : gv.config.crm.log_level,
							timestamp: function () {
								return moment().format('HH:mm:ss.SSS');
							},
						}),
                        // deprecated : forever 를 통하기 때문에 별도의 로그가 필요없는 듯 하다.
						//new (winston.transports.File)({
						//	filename : gv.config.crm.log_path + '-' + gv.getDateString8(),
						//	level    : gv.config.crm.log_level,
						//	json     : false,
						//	maxsize  : 100000000,
						//	maxFiles : 10,
						//	timestamp: function () {
						//		return moment().format('HH:mm:ss.SSS');
						//	},
						//	//timestamp: true,
						//	//handleExceptions: true,		// INFO : exception 핸들을 처리해주면 자체 에러에 대해서 또다른 로그를 남길수 있다.
						//})
					],
				});

				// TODO : ADD DB log transports
				//log.add(winston.transports.mongo_logger, { level : 'notice' } );
				//gv.config.log.setLevels(winston.config.syslog.levels);
				//console.log('---> winston:' + gv.inspect(winston.config.syslog.levels));
				// winston.config.syslog.levels 의 값이 뒤집어져 있다. 주의 할 것 
				
				//gv.config.log.setLevels({"emerg":7,"alert":6,"crit":5,"error":4,"warning":3,"notice":2,"info":1,"debug":0});
				//winston.addColors({debug: 'blue', info: 'green', notice: 'yellow', warning: 'red', error : 'red', crit : 'red', alert: 'red', emerg : 'red'});
	
				
				//gv.print_config();		// INFO : config 값을 출력한다.
				console.log('  +end of log_configure');
				
				// INFO : 화일 로그를 붙였기 때문에 이제부터는 log 를 이용하여 처리한다.
				gv.config.log.debug('  +file log configure complete, start file log');
				
				gv.print_config();
				next_function(null, '');
			},
			///////////////////////////////////////////////////////////
			//
			function redis_configure (next_function) {
				gv.config.log.debug('  +start of REDIS');

				//fv.redis_client = redis.createClient();
				//fv.redis_sub_ch = redis.createClient();
				//fv.redis_pub_ch = redis.createClient();
                fv.redis_client = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});
                fv.redis_data_client = redis.createClient(gv.config.sys.license.redis_data_db.db_port, gv.config.sys.license.redis_data_db.db_host, {});
				fv.redis_sub_ch = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});
				fv.redis_pub_ch = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});

                fv.redis_client.on('error', function (error) {
                    gv.config.log.debug('[REDIS] error Handler :' + error);
                });

                fv.redis_data_client.on('error', function (error) {
                    gv.config.log.debug('[REDIS-DATA] error Handler :' + error);
                });

				// INFO : 해당 DB keyspace 를 listent 한다. 
				fv.redis_sub_ch.psubscribe('__keyspace@' + gv.config.sys.license.redis_event_db.db_id + '__:*');

				// INFO : Redis DB 를 선택한다.
				fv.redis_client.send_command('SELECT', [gv.config.sys.license.redis_event_db.db_id], function (error, result) {
					if (error) {
						gv.config.log.error('ERROR redis_configure:send_command:SELECT ' + gv.config.sys.license.redis_event_db.db_id + ':' + gv.inspect(result));
						gv.config.log.info('  +end of REDIS with ERROR');
						next_function('ERROR REDIS', '');
					}
					else {
						gv.config.log.info('[REDIS]  +redis_select_db ' + gv.config.sys.license.redis_event_db.db_id );

                        //deprecated : redis_data 도 접속처리해야 한다.
						//gv.config.log.info('  +end of REDIS');
						//next_function(null, '');

                        // INFO : Redis-data DB 를 선택한다.
                        fv.redis_data_client.send_command('SELECT', [gv.config.sys.license.redis_data_db.db_id], function (error, result) {
                            if (error) {
                                gv.config.log.error('ERROR redis_data_configure:send_command:SELECT ' + gv.config.sys.license.redis_data_db.db_id + ':' + gv.inspect(result));
                                gv.config.log.info('  +end of REDIS-DATA with ERROR');
                                next_function('ERROR REDIS-DATA', '');
                            }
                            else {
                                gv.config.log.info('[REDIS]  +redis_data_select_db ' + gv.config.sys.license.redis_data_db.db_id );

                                gv.config.log.info('  +end of REDIS');
                                next_function(null, '');
                            }
                        });
                    }
				});

			},
		],	// end of sequence functions
		////////////////////////////////////////////////////////
		// INFO : 기본 configure 처리는 완료되었다. 마지막 configure 처리를 한다.
		//  -모든 초기화가 끝났다고 판단되는 시점이기 때문에 서비스 바인딩 처리는 여기서 한다.
		function(error, result) {
			if (error) {
				console.log('END of configure - FAILED');
				gv.exit(-1, { desc : "CONFIG : END of configure - FAILED : "});

			}
			else {
				gv.config.log.info('END of configure - SUCCESS');
			}
			
			// INFO : 여기에서 log 를 받으면 사용이 가능하다.
			log = gv.config.log;
			
			// TODO : configure 를 잡았다고 실행 가능한 것은 아니다.
			//  구성후에 발생하는 각종 client로서 connection에 대한 체크가 완료되어야 한다.
			//  따라서, http/socket.io listen은 아직 수행할 수 없다.
			fv.assert_timer = setInterval(assert_configure, fv.assert_interval);		

		}
	);
}


var assert_configure = function () {
	gv.config.log.debug('ASSERT:assert_configure : ' + fv.assert_count);
	
	// TODO : 어떤 구성을 체크할게 있다면 여기서 하도록 한다. 
	
	// INFO : 모든 구성이 완료되었음을 flag set한다.
	gv.config.crm.config_ok = true;
	
	// INFO : 전체 구성이 완료되었다면..
	if (gv.config.crm.config_ok == true) {
		gv.config.log.info('ASSERT:all configuration success. now, start service.');

		clearInterval(fv.assert_timer);		// INFO : check timer 를 해제한다.
		
		process.nextTick(start_service);
	}
}


// 
// INFO : fv 의 member 로 등록한다.
//   ex, fv.push , fv.sio ...
//  
//
var load_service_modules = function() {
	// load handlers

	log.info('   -load ./modules/sync-time-division.js');
	fv.time_division = require('./modules/sync-time-division.js')(gv, fv);

	log.info('   -load ./interfaces/sync-redis-handler.js');
	require('./interfaces/sync-redis-handler.js')(gv, fv);


	// load models. (local)
	log.info('   -load ./models/message-queue.js');
	fv.models.message_queue = require('./models/message-queue.js')(gv, fv);
	
	log.info('   -load ./models/message-channel.js');
	fv.models.message_channel = require('./models/message-channel.js')(gv, fv);	
	
	log.info('   -load ./models/ui-object.js');
	fv.models.ui_object = require('./models/ui-object.js')(gv, fv);
}



var init_service_modules = function () {
	
	//
	
	//
}



var start_service = function() {
	log.info('------------ START SERVICE -------------');
	
	// INFO : configuration 에서 test 를 해봐야 file 에는 안나오는 경우가 있다.
	//  callback 으로 완료된 시기를 확인 할 수 없기 떄문에 여기서 log가 설정됐는지 확인해본다. 
	log.info('-- FILE LOG TEST START --');
	log.debug('   -test debug level');
	log.info('    -test info level');
	log.warn(' -test warn level');
	log.error('   -test error level');
	log.info('-- FILE LOG TEST END --');


	log.info('-- LOAD SERVICE MODULES START --');
	load_service_modules();
	log.info('-- LOAD SERVICE MODULES END --');

	log.info('-- INIT SERVICE DATA START --');
	init_service_modules();
	log.info('-- INIT SERVICE DATA END --');


	// time division logic start (ms)
	fv.time_division.init(10);
}


/*
 * main function
 *
 */ 
//int main()
{
	
	
	configure();
}

