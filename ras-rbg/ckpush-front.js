/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ckpush-front.js
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

//var request = require('request');
var moment = require('moment');

var mysql = require('mysql');
var gcm = require('node-gcm');

var websocket = require('ws');
var mqtt = require('mqtt');

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

	mysql_client : null,

	gcm : gcm,						// for GCM instance
	gcm_sender : null,

	redis_client : null,
	redis_sub_ch : null,
	redis_pub_ch : null,

	mqtt_client : null,				// for MQTT client

	//
	// service modules
	push : null,
	// sio_manager : null,			// TODO : 2017.10.22, deprecate
    ws_manager : null,
	protocol : null,
	svc : null,


	//
	// service data models
	models : {
		connection : null,
		message_queue : null,
		ui_object : null,
	},

	//
	// for model instance : 여러개가 필요없다면 만들어 두고 사용한다.
	datas : {
		front_info : null,
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
						cfg : "ckpush-front.cfg.json",
						log : "ckpush-front",
					},
					function(error, result) {
						gv.config.crm.httpd_port = parseInt(process.argv[2]);
						gv.config.crm.log_path = gv.config.crm.log_path + '/ckpush-front' + gv.config.crm.httpd_port;

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
                            stderrLevels : [],				// winston spec, debug/error 제거함.	(이게 없으면 stderr 로 빠진다)
							timestamp: function () {
								return moment().format('HH:mm:ss.SSS');
							},
						}),
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
			function db_configure (next_function) {
				gv.config.log.debug('  +start of DB');

                // INFO : license 에서 정보를 읽는다.
                var main_db = {
                    "host" : gv.config.sys.license.main_db.db_server,
                    "database" : gv.config.sys.license.main_db.db_name,
                    "user" : gv.config.sys.license.main_db.db_user,
                    "password" : gv.config.sys.license.main_db.db_pass
                };

                gv.config.log.info('  +[DB:MySQL] INFO=' + gv.inspect(main_db));

				fv.mysql_client = mysql.createConnection(main_db);

			  	fv.mysql_client.connect(function(err) {
                    //INFO : err == null 이면 성공, else 면 오류
					gv.config.log.info('  +[DB:MySQL] connected. error=' + err);

					// TODO : configure 체크에서 확인할 수 잇도록 변경 필요.
			  	});

				gv.config.log.debug('  +end of DB ');
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
				fv.redis_sub_ch = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});
				fv.redis_pub_ch = redis.createClient(gv.config.sys.license.redis_event_db.db_port, gv.config.sys.license.redis_event_db.db_host, {});

				fv.redis_client.on('error', function (error) {
					gv.config.log.debug('[REDIS] error Handler :' + error);
				});

				// INFO : timer 를 listen 한다.
				fv.redis_sub_ch.subscribe('ckpush-time-5sec');
				fv.redis_sub_ch.subscribe('ckpush-time-1hour');

				// INFO : push channel 수신 (ex : ckpush-push-hostname-20001)
				fv.redis_sub_ch.subscribe('ckpush-push-' + gv.config.crm.hostname + '-' + gv.config.crm.httpd_port);

				// INFO : event-script ACTION_TO_BROADCAST channel 수신
				fv.redis_sub_ch.subscribe('ckpush-action-to-broadcast');

				// TODO : mqtt only
                // INFO : event-script ACTION_TO_CHANNEL mqtt 수신
                fv.redis_sub_ch.subscribe('ckpush-action-to-mqtt');

                // INFO : event monitoring (for admin) channel 수신
				fv.redis_sub_ch.subscribe('ckpush-event-monitor');

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
			//
			/* GW 는 사용하지 않는다.
			function gw_configure (next_function) {
				// TODO
				gv.config.log.debug('  +(TODO) start of GW');

				gv.config.log.debug('  +(TODO) end of GW');
				next_function(null, '');
			},
			*/
			///////////////////////////////////////////////////////////
			//
			function gcm_configure (next_function) {
				// TODO
				gv.config.log.debug('  +start of GCM');
				fv.gcm_sender = new gcm.Sender(gv.config.crm.gcm_server_key);

				gv.config.log.debug('  +end of GCM');
				next_function(null, '');
			},
			///////////////////////////////////////////////////////////
			//
			function express_configure (next_function) {
				gv.config.log.debug('  +start of express_configure');

				fv.express_app = express();

                fv.express_app.use('/', express.static(gv.config.crm.httpd_base, { maxAge: gv.config.crm.cache_control }) );

                //fv.express_app.use(gv.config.crm.static_path, express.static(gv.config.crm.httpd_base, { maxAge: gv.config.crm.cache_control }) );
                // if (gv.config.crm.site_httpd_base) {
                //     fv.express_app.use('/www', express.static(gv.config.crm.site_httpd_base, {maxAge: gv.config.crm.cache_control}));
                // }

                // TODO : 2017.08.13, express 4.x 에서는 middle ware 직접 지원하지 않는다. INFO : express 로그를 리다이렉트 한다.
                // if (gv.config.crm.log_httpd == "on") {
					// fv.express_app.use(express.logger({
					// 	stream: {
					// 		write: function(str) {
					// 			gv.config.log.debug("[EXPRESS] " + str );
					// 		}
					// 	}
					// }));
                // }

                // // INFO : 2017.10.09, SSL version
                // if (gv.config.crm.https) {
                //     // TODO : 2017.08.24, move to config
                //     const ssl_options = {
                //         ca: fs.readFileSync('/home/dev/cert/ca-bundle.pem'),
                //         key: fs.readFileSync('/home/dev/cert/_wildcard_.gigagenie.ai_20170614Q0KM.key.pem'),
                //         cert: fs.readFileSync('/home/dev/cert/_wildcard_.gigagenie.ai_20170614Q0KM.crt.pem')
                //     };
                //
                //     fv.http_server = https.createServer(ssl_options, fv.express_app);
                //     gv.config.log.debug('  -USE SSL, HTTPS Ready.');
                // }
                // else {
                //     fv.http_server = http.createServer(fv.express_app);
                //     gv.config.log.debug('  -USE Plain data, HTTP Ready.');
                // }

                fv.http_server = http.createServer(fv.express_app);
                gv.config.log.debug('  -USE Plain data, HTTP Ready.');


				gv.config.log.debug('  +end of express_configure');
				next_function(null, '');
			},
			///////////////////////////////////////////////////////////
			//
			function socket_configure (next_function) {
                gv.config.log.debug('  +start of websocket_configure');

                fv.websocket = new websocket.Server( { server : fv.http_server } );

                // TODO : 2017.08.13, websocket configure

                // fv.websocket.on('connection', function connection(ws, req) {
                //    ws.on('message', function incoming(message) {
                //        gv.config.log.debug('[WS] received: %s', message);
                //    });
                //
                //    ws.send('something');
                // });

                gv.config.log.debug('  +end of websocket_configure');
                next_function(null, '');
            },
            ///////////////////////////////////////////////////////////
            //
            function mqtt_configure (next_function) {
                gv.config.log.debug('  +start of MQTT');

                if (gv.config.sys.license.mqtt &&gv.config.sys.license.mqtt.url != "") {
                    fv.mqtt_client = mqtt.connect(gv.config.sys.license.mqtt.url, {
                        // protocolId: 'MQIsdp', 	// 'MQTT' Or 'MQIsdp' in MQTT 3.1.1
                        // protocolVersion : 3,
                        clientId: gv.config.sys.license.mqtt.clientId,
                        reconnectPeriod: 1000,
                        username: gv.config.sys.license.mqtt.username,
                        password: gv.config.sys.license.mqtt.password,
                    });

                    fv.mqtt_client.on('connect', function () {
                        gv.config.log.debug("[MQTT] connected");

                        var mqtt_subs = gv.config.sys.license.mqtt.subscribe;
                        fv.mqtt_client.subscribe(mqtt_subs);
                        gv.config.log.debug("[MQTT] subscribe:" + gv.inspect(mqtt_subs));
                    });

                    // TODO-MQTT : 2017.10.09, mqtt connect error 처리 추가할 것.
                }
                else {
                    gv.config.log.info('    -no MQTT founctions');
				}

                gv.config.log.debug('  +end of MQTT');
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
	log.info('   -load ./modules/front-push.js');
	fv.push = require('./modules/front-push.js')(gv, fv);

	// log.info('   -load ./modules/front-socketio-manager.js');
	// fv.sio_manager = require('./modules/front-socketio-manager.js')(gv, fv);
    log.info('   -load ./modules/front-websockets-manager.js');
    fv.ws_manager = require('./modules/front-websockets-manager.js')(gv, fv);

	log.info('   -load ./modules/front-protocol.js');
	fv.protocol = require('./modules/front-protocol.js')(gv, fv);

/*
	log.info('   -load ./modules/front-svc.js');
	fv.svc = require('./modules/front-svc.js')(gv, fv);
*/


	// load handlers
	log.info('   -load ./interfaces/front-express-handler.js');
	require('./interfaces/front-express-handler.js')(gv, fv);

    // deprecated : 2017.10.09,
	// log.info('   -load ./interfaces/front-socketio-handler.js');
	// require('./interfaces/front-socketio-handler.js')(gv, fv);

    log.info('   -load ./interfaces/front-websockets-handler.js');
    require('./interfaces/front-websockets-handler.js')(gv, fv);


    if (fv.mqtt_client != null) {
        log.info('   -load ./interfaces/front-mqtt-handler.js');
        require('./interfaces/front-mqtt-handler.js')(gv, fv);
    }

    log.info('   -load ./interfaces/front-redis-handler.js');
	require('./interfaces/front-redis-handler.js')(gv, fv);


	// load models. (local)
	// log.info('   -load ./models/front-connection.js');
	// fv.models.connection = require('./models/front-connection.js')(gv, fv);
    log.info('   -load ./models/front-connection-model.js');
    fv.models.connection = require('./models/front-connection-model.js')(gv, fv);


    log.info('   -load ./models/front-info.js');
	fv.models.front_info = require('./models/front-info.js')(gv, fv);

	log.info('   -load ./models/message-queue.js');
	fv.models.message_queue = require('./models/message-queue.js')(gv, fv);

    log.info('   -load ./models/message-channel.js');
    fv.models.message_channel = require('./models/message-channel.js')(gv, fv);

    log.info('   -load ./models/ui-object.js');
	fv.models.ui_object = require('./models/ui-object.js')(gv, fv);
}



var init_service_modules = function () {
	fv.datas.front_info = new fv.models.front_info();			// instance 를 만들어 둔다.
	fv.datas.front_info.setCount(0, 0);							// 접속수를 0으로 만든다.

/* deprecated
	log.info('-- INIT SERVICE DATA START --');
	var Connection = new fv.models.connection();
	Connection.clearConnection(function() {
		log.debug('#####redis ---clear data');
	});
	log.info('-- INIT SERVICE DATA END --');
*/


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
	// start listen websocket & express
	fv.http_server.listen(gv.config.crm.httpd_port);
	// TODO : listen 에러처리. (express가 아니기에 모르것다)


	// TODO : special service logic
/*
	setInterval(function() {
		fv.svc.broadcast_message();
	}, 1000);
*/
}










/*
 * main function
 *
 */
//int main()
{


	configure();
}

