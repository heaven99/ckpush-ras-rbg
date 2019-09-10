/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ckpush-event.js
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
var _ = require('lodash');

var express = require('express');
var redis = require('redis');
var backbone = require('backbone');

var request = require('request');
var moment = require('moment');

var mysql = require('mysql');
var gcm = require('node-gcm');
var apn = require('apn');

var fcm_admin = require("firebase-admin");


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
	express_app : null,
	express_server : null,

	http_server : null,

	gcm : null,
	//gcm_sender : null,

	fcm : null,		// fcm_admin

    apn : null,
    apnConnection : null,

	//
	// module handles
	redis_client : null,
	redis_sub_ch : null,
	redis_pub_ch : null,


	//
	// service modules
	protocol : null,

	//
	// service data models
	models : {
		message_queue : null,
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
						cfg : "ckpush-event.cfg.json",
						log : "ckpush-event",
					},
					function(error, result) {
						gv.config.crm.httpd_port = parseInt(process.argv[2]);
						gv.config.crm.log_path = gv.config.crm.log_path + '/ckpush-event-' + gv.config.crm.httpd_port;

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
                            stderrLevels : [],				// winston spec, debug/error 제거함.
							timestamp: function () {
								return moment().format('HH:mm:ss.SSS');
							},
						}),
					],
				});

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
                //fv.redis_client = redis.createClient(gv.config.crm.redis_db_port, gv.config.crm.redis_db_host, {});
                //fv.redis_sub_ch = redis.createClient(gv.config.crm.redis_db_port, gv.config.crm.redis_db_host, {});
                //fv.redis_pub_ch = redis.createClient(gv.config.crm.redis_db_port, gv.config.crm.redis_db_host, {});
                fv.redis_client = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});
                fv.redis_sub_ch = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});
                fv.redis_pub_ch = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});

				//
				// INFO : 이 부분을 열면 많은 에러를 여기서 처리해 버려서 에러 처리가 너무 힘들다.
				//fv.redis_client.on('error', function (error) {
				//	gv.config.log.debug('[REDIS] error Handler :' + error);
				//});

				// INFO : timer 를 listen 한다.
				fv.redis_sub_ch.subscribe('ckpush-time-5sec');
				fv.redis_sub_ch.subscribe('ckpush-time-1hour');

				// INFO : 해당 DB keyspace 를 listent 한다.
				fv.redis_sub_ch.psubscribe('__keyspace@' + gv.config.sys.license.redis_event_db.db_id + '__:*');

				// INFO : subscribe 에 대한 결과
				fv.redis_sub_ch.on('subscribe', function (channel, count) {
					gv.config.log.info('[REDIS] subscribe#>CH:' + channel + ':' + count);
				});


				// INFO : Redis DB 를 선택한다.
				fv.redis_client.send_command('SELECT', [gv.config.sys.license.redis_event_db.db_id], function (error, result) {
					if (error) {
						gv.config.log.error('ERROR redis_configure:send_command:SELECT ' + gv.config.sys.license.redis_event_db.db_id + ':' + gv.inspect(result));
						gv.config.log.info('  +end of REDIS with ERROR');
						next_function('ERROR REDIS', '');
					}
					else {
						gv.config.log.info('[REDIS]  +redis_select_db ' + gv.config.sys.license.redis_event_db.db_id );

						gv.config.log.info('  +end of REDIS');
						next_function(null, '');
					}
				});
			},
			///////////////////////////////////////////////////////////
            // deprecated : 2017.12.10,
			function gcm_configure (next_function) {
				gv.config.log.debug('  +start of GCM');
				fv.gcm = gcm;

				gv.config.log.debug('  +end of GCM');
				next_function(null, '');
			},
			//
            function fcm_configure (next_function) {
                gv.config.log.debug('  +start of FCM');
                fv.fcm = fcm_admin;

                // TODO : 2017.12.10, config json
                // TODO : 2017.12.10, databaseURL to config json
                //var serviceAccount = require(gv.config.sys.config_path + "/jeilfeed-firebase-adminsdk-ras-dev.json");
                // TODO: 2018.04.13,  license 화일의 default app 으로 사용하도록 수정함, 차후에 규격상에 app_id 를 처리할 수 있어야 함
                // TODO: 2018.04.13, fcm 이 없을 경우에 대한 처리도 추가해야 함.
                var serviceAccount = require(gv.config.sys.license_path  + '/' + gv.config.sys.license.fcm_server_keys.default);
                var defaultApp = fv.fcm.initializeApp({
                    credential: fv.fcm.credential.cert(serviceAccount),
                    //databaseURL: "https://jeilfeed-9c07e.firebaseio.com"
                    databaseURL: gv.config.sys.license.fcm_server_keys.defaultDatabaseUrl
                });

                gv.config.log.debug('   FCM App =', defaultApp);
                //gv.config.log.debug('   FCM App name=' + defaultApp.name);  // "[DEFAULT]"
				// gv.config.log.debug('   FCM App auth=', defaultApp.auth());

				//
                // INFO : 2017.12.10, 실제 메시지는 event-protocol.parse_keyspace_notification 부에서 처리한다.
				//

                gv.config.log.debug('  +end of FCM');
                next_function(null, '');
            },
            ///////////////////////////////////////////////////////////
            //
            function apn_configure (next_function) {
                gv.config.log.debug('  +start of APNs');
                fv.apn = apn;
                fv.apnConnection = [];

                _.forEach(gv.config.sys.license.apns_keys, function(apn_option, app_id) {
                    gv.config.log.debug('  -APNS:key=' + app_id + ', apn_option=' + gv.inspect(apn_option));
                    //-APNS:key=hotdealfinder_ios, apn_option={"cert":"hotdeal_cert.pem","key":"hotdeal_key.pem"}

                    var _gateway = 'gateway.sandbox.push.apple.com';
                    if (gv.config.crm.production) _gateway = 'gateway.push.apple.com';
                    var options = {
                        gateway : _gateway,
                        production : gv.config.crm.production,
                        //batchFeedback: true,
                        cert: gv.config.sys.license_path + '/' + apn_option.cert,
                        key: gv.config.sys.license_path + '/' + apn_option.key
                    };

                    gv.config.log.info('  -APNS Config ' + app_id + ':' + gv.inspect(options));

                    // TODO : Connection 을 미리해두어야 하는지, 아니면 단순 instance 인지는 추후 정리할 것.
                    // Connection 의 상황을 확인후 Start init 완료 타이밍을 찾아야 할 수도 있다.
                    // 각 Event Handler 의 용도는 차후에 적용할 것.
                    // TODO : APNS event 처리건에 정리.
                    fv.apnConnection[app_id] = new fv.apn.Connection(options);

                    //
                    //INFO : Event Handler 정의
                    fv.apnConnection[app_id].on("connected", function() {
                        gv.config.log.info('  -APNS event:connected: ' + app_id);
                    });

                    fv.apnConnection[app_id].on("disconnected", function() {
                        gv.config.log.error('  -APNS event:disconnected: ' + app_id);
                        // TODO : 접속이 끊어진 것에 대한 처리. (실제 발생에 대한 확인 필요)
                    });

                    fv.apnConnection[app_id].on("transmitted", function(notification, device) {
                        gv.config.log.info("  -APNS:event::transmitted:Notification transmitted to:" + device.token.toString("hex"));
                        //-APNS:event::transmitted:Notification transmitted to:995be21cfd9a67cbc8e591ec28bb1a6a1c883cf2c1715a61bbd5e5d9bb61ee77
                        // TODO: 발송한 token id 가 그대로 넘어오므로 발송결과에 대해 검토할 수는 있어진다.
                    });

                    // INFO : - 에러를 내고 죽는다. Error: certificate has expired: 2016-05-25T03:43:33.000Z
                    // 를 처리하려고 했으나 실제 처리되지 않았다.
                    try {
                        fv.apnConnection[app_id].on("transmissionError", function (errCode, notification, device) {
                            gv.config.log.warn("  -APNS:event:transmissionError:Notification caused error: " + errCode + " for device ", device, notification);
                            if (errCode === 8) {
                                gv.config.log.warn("  -APNS:event:transmissionError:A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
                            }
                        });
                    }
                    catch (e) {
                        gv.config.log.error('  -APNS event:transmissionError:exception:' + e);
                    }

                    fv.apnConnection[app_id].on("timeout", function () {
                        gv.config.log.warn("  -APNS:event:Connection Timeout");
                    });

                    // deprecated
                    //
                    //// TODO : APNS test
                    //var token = '995be21cfd9a67cbc8e591ec28bb1a6a1c883cf2c1715a61bbd5e5d9bb61ee77';
                    //
                    //var myDevice = new fv.apn.Device(token);
                    //
                    //// TODO : 멀티 타겟 테스트 할 것.
                    //// TODO : payload / 수신측 protocol 확인 할 것.
                    //var note = new fv.apn.Notification();
                    //note.badge = 0;               //INFO : 아이콘 뱃지 카운트 (값을 주지 않으면, 기존 값이 남아있게된다.)
                    //note.expiry = Math.floor(Date.now() / 1000) + 3600; //INFO : Expires 1 hour from now.
                    //note.sound = "default"; //"ping.aiff";              //INFO : 사운드가 있으면 진동도 된다.
                    //note.alert = {
                    //    title : '푸시 테스트',               //INFO : from iOS8.2, Apple Watch displays this string as part of the notification interface
                    //    body : '메시지 본문 내용이 들어갑니다.'  //INFO : 실제 메시지 수신후 보이는 메시지로 보면됨.
                    //};
                    //note.payload = {
                    //    ckpush : {
                    //        url : 'http://m.naver.com'
                    //    }
                    //};
                    //
                    //// TODO : 결과 확인 할것, sendNotification 과 비교해 볼 것.
                    //fv.apnConnection[app_id].pushNotification(note, myDevice);
                });

                // TODO : apnConnections 때문에 정확한 iOS 의 설정 완료 타이밍은 아니다.
                gv.config.log.debug('  +end of APNs');
                next_function(null, '');
            },
			///////////////////////////////////////////////////////////
			//
			function express_configure (next_function) {
				gv.config.log.debug('  +start of express_configure');

				fv.express_app = express();

				// INFO : server 생성
				fv.http_server = http.createServer(fv.express_app);

				gv.config.log.debug('  +end of express_configure');
				next_function(null, '');
			},

		],	// end of sequence functions
		////////////////////////////////////////////////////////
		// INFO : 기본 configure 처리는 완료되었다. 마지막 configure 처리를 한다.
		//  -모든 초기화가 끝났다고 판단되는 시점이기 때문에 서비스 바인딩 처리는 여기서 한다.
		function(error, result) {
			if (error) {
				consoloe.log('END of configure - FAILED');
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
	// TODO : mysql connect check


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


	// load servce modules.
	log.info('   -load ./modules/event-protocol.js');
	fv.protocol = require('./modules/event-protocol.js')(gv, fv);


	// load handlers
	log.info('   -load ./interfaces/event-express-handler.js');
	require('./interfaces/event-express-handler.js')(gv, fv);

	log.info('   -load ./interfaces/event-redis-handler.js');
	require('./interfaces/event-redis-handler.js')(gv, fv);


	// load models. (local)
	log.info('   -load ./models/message-queue.js');
	fv.models.message_queue = require('./models/message-queue.js')(gv, fv);

	log.info('   -load ./models/message-channel.js');
	fv.models.message_channel = require('./models/message-channel.js')(gv, fv);

	log.info('   -load ./models/data-push.js');
	fv.models.data_push = require('./models/data-push.js')(gv, fv);
}



var init_service_modules = function () {
	//
	//
	// TODO : 최초 실행시 event queue 를 검사해 봐야한다.
	//  -실제 서비스중인 시스템에서는 의미 없는 행동이기 때문에 그냥 무시한다.
	//
}



var start_service = function() {
	log.info('------------ START SERVICE -------------');

	// INFO : configuration 에서 test 를 해봐야 file 에는 안나오는 경우가 있다.
	//  callback 으로 완료된 시기를 확인 할 수 없기 떄문에 여기서 log가 설정됐는지 확인해본다.
	log.info('-- FILE LOG TEST START --');
	log.debug('   -test debug level');
	log.info('    -test info level');
	log.warn('    -test warn level');
	log.error('   -test error level');
	log.info('-- FILE LOG TEST END --');


	log.info('-- LOAD SERVICE MODULES START --');
	load_service_modules();
	log.info('-- LOAD SERVICE MODULES END --');

	log.info('-- INIT SERVICE DATA START --');
	init_service_modules();
	log.info('-- INIT SERVICE DATA END --');


	//
	// start listen socketio/express
	fv.http_server.listen(gv.config.crm.httpd_port);
	// TODO : listen 에러처리. (express가 아니기에 모르것다)
}


/*
 * main function
 *
 */
//int main()
{


	configure();
}

