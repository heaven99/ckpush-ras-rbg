/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : event-protocol.js
 * @version : 3.0.0
 * @notes
 */


/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var _ = require('lodash');
	var exec = require('child_process').exec, child;
    var request = require('request');


    // global variable for this file (scope : in file)
	var log = gv.config.log;
	
	

	
	//
	// INFO : event map 을 처리한다. 
	//
	var event_map_processor = function (pobject) {
		
		//
		// TODO : assert app_id (당장은 큰의미가 없는게, 없으면 이벤트가 실행되지 않는다.
		//  다만, 혹시나 app_id 를 초기 인증이후에 바꾼다는 등의 방법으로 속일 수는 있다. 
		
		// INFO : 이벤트를 매핑한다.
		// TODO : 이벤트 매핑을 그때 그때 하지말고 binding data 처리하도록 한다.
		// 
		fv.redis_client.send_command('hget', ['config.' + pobject.app_id + '.event-map', pobject.et], function (error, result) {
			if (error || result == null) {
				log.error('[EVENT-SCRIPT] ERROR config.' + pobject.app_id + '.event-map, event-map(' + pobject.et + ':' + result + ')');

				// TODO : 이것은 좀 나누어서 별도의 monitor로 연결하면 좋것다. (이벤트 모니터로 나오기 때문에 불편함)
				var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
				event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : 'Event "' + pobject.et + '" 에 등록된 Event-script 가 없습니다.'});
			}
			else {
                //INFO : 이벤트 스크립트 매핑로그
				//log.debug('[EVENT-SCRIPT] config.' + pobject.app_id + '.event-map, event-map(' + pobject.et + ':' + result + ')');
				
                //
                //INFO : PHP 지원
				if (result.indexOf("$PHP") == 0 || result.indexOf("#PHP") == 0) {
                    var run_script;
                    var run_path;
					var path = result.substring(5).split("/", 2);
                    var scriptLog = true;
                    if (result.indexOf("#PHP") == 0)
                        scriptLog = false;

                    // path를 가지고 있으면 붙여 준다.
					if (path.length == 2) {
						run_path = gv.config.crm.event_script_path + '/' + path[0] + '/';
						run_script = 'php ' + path[1];
					}
                    // path가 없으면 그냥 화일명으로 처리한다.
					else {
						run_path = gv.config.crm.event_script_path + '/';
						run_script = 'php ' + path[0];
					}

                    // INFO : 매핑에 성공하면 이벤트 스크립트를 실행시킨다.(JSON 파라메터를 ‘ '로 감쌀것)
                    // TODO : ' 기호는 schell 로 넘길 수 없다. 일단 @#1#@ 로 바꾼다. (추후 여러개가 나올경우 encoding logic 을 별도로 둔다, 2014/06/24
                    var run_param = gv.inspect(pobject).replace(/'/g, "@#1#@");

                    if (scriptLog) log.debug('[EVENT-SCRIPT] exec :path=' + run_path + ', script=' + run_script);
                    if (scriptLog) log.debug('[EVENT-SCRIPT] ' + run_script + ', exec param :' + run_param);
                    // LOG : {"app_id":"admin","tid":"1394516074955_3237","ctime":1394516074,"et":"event-test",
                    //        "ud":{"data":{"_t":"MANAGE","_cmd":"user test"},
                    //              "user_tag":{"app_id":"admin","ssid":"authorized","ip":"112.216.155.226","soc_id":"qzOTdJsPfKTq0cngMNHJ","member_srl":0}}}

                    // INFO : 2015.10.03 - maxBuffer 옵션추가
                    child = exec(run_script + " '" + run_param + "'", { cwd : run_path, maxBuffer: 1024 * 500 }, function(error, stdout, stderr) {
                        if (error !== null) {
                            // error: [EVENT-SCRIPT] exec error:/bin/sh: 1: ras-noaction: not found
                            log.error('[EVENT-SCRIPT] exec error:stderr=' + stderr + ', sys error=' + gv.inspect(error) + ', run script=' + run_script + ', param=' + gv.inspect(pobject));

                            // TODO : 이것은 좀 나누어서 별도의 monito로 연결하면 좋것다. (이벤트 모니터로 나오기 때문에 불편함)
                            var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
                            event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : 'Event-script 실행 오류, "' + error + '"'});
                        }
                        // 성공이면 결과 처리를 호출한다.
                        else {
                            es_result_processor(stdout, run_script, pobject, scriptLog);
                        }
                    });

				}
                //
                //INFO : Node.js 지원 (#NODE 는 로그 없음)
                if (result.indexOf("$NODE") == 0 || result.indexOf("#NODE") == 0) {
                    var run_script;
                    var run_path;
                    var path = result.substring(6).split("/", 2);
                    var scriptLog = true;
                    if (result.indexOf("#NODE") == 0)
                        scriptLog = false;

                    // TODO: 2018.03.22, 3단 path 를 지원해 달라고 한다 성조.
                    // path를 가지고 있으면 붙여 준다.
                    if (path.length == 2) {
                        run_path = gv.config.crm.node_script_path + '/' + path[0] + '/';
                        run_script = 'node ' + path[1];
                    }
                    // path가 없으면 그냥 화일명으로 처리한다.
                    else {
                        run_path = gv.config.crm.node_script_path + '/';
                        run_script = 'node ' + path[0];
                    }

                    // INFO : 매핑에 성공하면 이벤트 스크립트를 실행시킨다.(JSON 파라메터를 ‘ '로 감쌀것)
                    // INFO : ' 기호는 schell 로 넘길 수 없다. 일단 @#1#@ 로 바꾼다.
                    var run_param = gv.inspect(pobject).replace(/'/g, "@#1#@");

                    // LOG DEPRECATED
                    // if (scriptLog) log.debug('[EVENT-SCRIPT] exec :path=' + run_path + ', script=' + run_script);
                    // if (scriptLog) log.debug('[EVENT-SCRIPT] ' + run_script + ', exec param :' + run_param);

                    log.debug('[EVENT-SCRIPT] run_script=' + run_script);

                    //
                    // TODO : BMT TEST : 아래 부분에 성능이 필요한 필요코드가 들어오면 된다.
                    if (run_script == 'xx node mqtt-load-test.js') {
                        var stdout = '{"app_id":"dysystem","topic":"000/dysystem/pub/pump/vdevice/1260DB2A007CK1","et":"type-cp-event","ud":{"action":"ACTION_TO_MQTT","member_srl":"_member_srl_","cmd":"res-cp-event","mqtt_data":{"ProduMac":"device-id","f1":"123","f2":"456"}},"tid":"1548932821330_7383","ctime":1548932821}';
                        es_result_processor(stdout, run_script, pobject, scriptLog);
                    }
                    else {
                        child = exec(run_script + " '" + run_param + "'", { cwd : run_path, maxBuffer: 1024 * 500 }, function(error, stdout, stderr) {
                            if (error !== null) {
                                // error: [EVENT-SCRIPT] exec error:/bin/sh: 1: ras-noaction: not found
                                log.error('[EVENT-SCRIPT] exec error:stderr=' + stderr + ', sys error=' + gv.inspect(error) + ', run script=' + run_script + ', param=' + gv.inspect(pobject));

                                // TODO : 이것은 좀 나누어서 별도의 monitor로 연결하면 좋것다. (이벤트 모니터로 나오기 때문에 불편함)
                                var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
                                event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : 'Event-script 실행 오류, "' + error + '"'});
                            }
                            // 성공이면 결과 처리를 호출한다.
                            else {
                                log.debug('[EVENT-SCRIPT] stdout=' + stdout);
                                es_result_processor(stdout, run_script, pobject, scriptLog);
                            }
                        });

                    }
                }
                //
                //INFO : HTTP 지원
                else if (result.indexOf("$HTTP") == 0) {
                    var event_url = result.substring(6);
                    // TODO : assert url
                    // TODO : assert pobject type (must be string)
                    log.debug('[EVENT-SCRIPT HTTP] url=' + event_url);
                    request({
                        url: event_url,
                        method: "POST",
                        //json: true,       // result가 JSON Object 로 처리된다.
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(pobject)               // TODO : 수신측에서 body 에 대한 확인을 해야 한다.
                    }, function(error, response, body) {
                        if (!error && response && response.statusCode == 200) {
                            log.debug('[EVENT-SCRIPT HTTP] result=' + body);
                            es_result_processor(body, event_url, pobject);
                        }
                        else {
                            // log.warn('[EVENT-SCRIPT HTTP] error:' + error + ', response.statusCode=' + response.statusCode + ':' + event_url + ':' + gv.inspect(pobject));
                            log.warn('[EVENT-SCRIPT HTTP] error:' + error + ':' + event_url + ':' + gv.inspect(pobject));

                            // TODO : 이것은 좀 나누어서 별도의 monito로 연결하면 좋것다. (이벤트 모니터로 나오기 때문에 불편함)
                            var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
                            // event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : 'Event-script HTTP 오류:URL=' + event_url + ', statusCode=' + response.statusCode + ', error=' + error});
                            event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : 'Event-script HTTP 오류:URL=' + event_url + ', error=' + error});
                        }
                    });
                }
                //
                //
                //INFO : Shell 지원
                else if (result.indexOf("$SH") == 0 || result.indexOf("#SH") == 0) {
                    var run_script;
                    var run_path;
                    var path = result.substring(4).split("/", 2);
                    var scriptLog = true;
                    if (result.indexOf("#SH") == 0)
                        scriptLog = false;

                    // TODO: 2018.03.22, 3단 path 를 지원해 달라고 한다 성조.
                    // path를 가지고 있으면 붙여 준다.
                    if (path.length == 2) {
                        run_path = '/home/ckpush/ras/sites-config/ckpush.com/' + path[0] + '/';
                        run_script = path[1];
                    }
                    // path 붙이는 방식
                    else {
                        run_path = '/home/ckpush/ras/sites-config/ckpush.com/';
                        run_script = run_path + path[0];
                    }

                    // INFO : 매핑에 성공하면 이벤트 스크립트를 실행시킨다.(JSON 파라메터를 ‘ '로 감쌀것)
                    // INFO : ' 기호는 schell 로 넘길 수 없다. 일단 @#1#@ 로 바꾼다.
                    var run_param = gv.inspect(pobject).replace(/'/g, "@#1#@");

                    // LOG DEPRECATED
                    // if (scriptLog) log.debug('[EVENT-SCRIPT] exec :path=' + run_path + ', script=' + run_script);
                    // if (scriptLog) log.debug('[EVENT-SCRIPT] ' + run_script + ', exec param :' + run_param);

                    log.debug('[EVENT-SCRIPT] run_script=' + run_script);

                    child = exec(run_script + " '" + run_param + "'", { cwd : run_path, maxBuffer: 1024 * 500 }, function(error, stdout, stderr) {
                        if (error !== null) {
                            // error: [EVENT-SCRIPT] exec error:/bin/sh: 1: ras-noaction: not found
                            log.error('[EVENT-SCRIPT] exec error:stderr=' + stderr + ', sys error=' + gv.inspect(error) + ', run script=' + run_script + ', param=' + gv.inspect(pobject));

                            // TODO : 이것은 좀 나누어서 별도의 monitor로 연결하면 좋것다. (이벤트 모니터로 나오기 때문에 불편함)
                            var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
                            event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : 'Event-script 실행 오류, "' + error + '"'});
                        }
                        // 성공이면 결과 처리를 호출한다.
                        else {
                            log.debug('[EVENT-SCRIPT] stdout=' + stdout);
                            es_result_processor(stdout, run_script, pobject, scriptLog);
                        }
                    });
                }
                //
                //INFO : 기타 Shell 지원, 현재는 지원하지 않으므로 오류만 발생시킨다. (2015.08.27)
                // 이렇게 하지 않으면 Console 에서 오류가 발생했는지 알 수 없다.
				else {
					//
					// TODO : shell 은 path 를 지정해도 실행이 안되네 ? (일단은 path를 환경변수에 걸어서 사용한다.)
                    // TODO : 그냥 일반 shell 은 지원을 포기하자, 장비별 호환성이나 이런것에 문제가 있다.
					// TODO : 2015.07.27 - PHP, HTTP 를 지원하는 모듈을 추가함에 따라 일반 Shell 지원은 당분가 deprecated 된다.
                    var run_script;
                    var run_path;

					//run_path = gv.config.crm.event_script_path;
					run_path = '';
					run_script = result;

                    log.warn('[EVENT-SCRIPT EXCEPTION] error:Does not support script.');

                    // TODO : 이것은 좀 나누어서 별도의 monito로 연결하면 좋것다. (이벤트 모니터로 나오기 때문에 불편함)
                    var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
                    event_monitor.sendData(pobject.app_id, 'event-monitor', { app_id : pobject.app_id, desc : '지원하지 않는 Event-script 입니다.:script name=' +  run_script});
				}
			}
		});

	};


    //INFO : event script 의 result 를 처리한다.
    // es_result - event script 의 결과 data (JSON string)
    // run_script
    // pobject
    var es_result_processor = function(es_result, run_script, pobject, scriptLog) {
        //log.info('stderr=' + stderr);
        // INFO : result 는 기본적으로 event queue type을 따른다.
        //   -action : ACTION_NONE, ACTION_TO_USER, ACTION_TO_BROADCAST
        //   -reserved : ACTION_TO_GROUP, , ... 필드를 추가적으로 고려한다.
        try {
            var res_object = JSON.parse(es_result);
            if (typeof res_object != 'object') res_object = {};		// "{}" 이런 case string 이 나온다, 그래서 empty object 로 바꾼다.
            // LOG DEPRECATED
            // if (scriptLog) log.debug('[EVENT-SCRIPT] ' + run_script + ', check OK:' + es_result.trim());
        }
        catch (err) {
            log.error('[EVENT-SCRIPT] ' + run_script + ', result is not json:' + es_result.trim());

            var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
            event_monitor.sendData(pobject.app_id, 'event-monitor',
                { app_id : pobject.app_id, desc : 'Event-script "' + pobject.et + '" 결과 확인 필요:' + es_result });

            return;
        }

        // INFO : ud 가 없으면 ACTION 이 없는 것으로 처리해 준다.
        if (!res_object.ud) res_object.ud = { action : 'ACTION_NONE' };
        if (res_object.ud && !res_object.ud.action) res_object.ud.action = 'ACTION_NONE';

        if (res_object.ud.action == 'ACTION_NONE') {
            ;
            //log.info('[EVENT-SCRIPT] ' + run_script + ' ACTION_NONE, skip');
        }
        else if (res_object.ud.action == 'ACTION_ERROR') {
            log.warn('[EVENT-SCRIPT] ' + run_script + ' ACTION_ERROR:_ras_error=' + res_object.ud._ras_error);
        }
        else if (res_object.ud.action == 'ACTION_TO_USER') {
            // log.info('[EVENT-SCRIPT] ACTION_TO_USER');
            // LOG : {"app_id":"p2x1","tid":"1394087430837_1923","ctime":1394087430,"et":"user-data-changed","ud":{"action":"ACTION_TO_USER", "member_srl":0, "data":100}}
            es_action_to_user(res_object.app_id, res_object.et, res_object.ud, scriptLog);
        }
        else if (res_object.ud.action == 'ACTION_TO_BROADCAST') {
            es_action_to_broadcast(res_object.app_id, res_object.et, res_object.ud);
        }
        else if (res_object.ud.action == 'ACTION_TO_MQTT') {
            es_action_to_mqtt(res_object.app_id, res_object.topic, res_object.et, res_object.ud);
        }
        else {
            log.warn('[EVENT-SCRIPT] ' + run_script + 'unknown action:' + res_object.action );
        }
    };
	
	// INFO : 앱 가입자에게 메시지 전달 처리. ACTION_TO_USER
	//   -실시간 접속 유저에게만 알릴 수 있다.
	//   -to_uid === String/Number or Array
	// event_type :
	//   -report_
	var es_action_to_user = function (app_id, event_type, ud, scriptLog) {
		var	action = ud.action;
		
		// INFO : array 로 변경한다.
		if (typeof ud.to_uid === 'string' || typeof ud.to_uid === 'number') {
			var	send_uids = [];		// array 로 만든다.
			send_uids[0] = ud.to_uid;
		}
		else {
			// 나머지는 Array 로 간주한다. 
			send_uids = ud.to_uid;			
		}
		
		if (scriptLog) log.debug('[EVENT-SCRIPT] es_action_to_user:event_type=' + event_type + ', app_id=' + app_id + ', send_uids=' + gv.inspect(send_uids) + ':ud=' + gv.inspect(ud) );

		_(send_uids).forEach(function(to_uid) {
			// 1. check connect (connect.[app_id].7777.*'
			var	key_name = 'connect.' + app_id + '.' + to_uid + '.*';
			fv.redis_client.send_command('keys', [key_name], function (error, result) {
				if (error) {
					log.error('[EVENT-SCRIPT] es_action_to_user:ERROR send_to_user:' + gv.inspect(error));
					return;
				}
				
				// 2. 실시간 접속자가 있다.
				if (result.length > 0) {
					log.debug('[EVENT-SCRIPT] es_action_to_user:PUSH user_info:' + gv.inspect(result));
					// 2-1. PUSH to front-server
					for (var i = 0; i < result.length; i++) {
						var pushNode = new fv.models.data_push( { key : result[i] } );
						pushNode.getNode();
						// log.debug('>>RTS PUSH node=' + pushNode.get('node') + ', port=' + pushNode.get('port') + ', soc_id=' + pushNode.get('soc_id'));
						// LOG : push channel ex : ckpush-push-hostname-20001
						var qname = 'ckpush-push-' + pushNode.get('node') + '-' + pushNode.get('port');
						log.debug('[EVENT-SCRIPT] es_action_to_user:PUSH channel="' + qname + '"');
						
						var push_message = new fv.models.message_channel({ qname : qname });
						push_message.sendData(app_id, event_type, { action : action, to_uid : to_uid, member_srl : pushNode.get('uid'), soc_id : pushNode.get('soc_id'), push_object : ud } );
					}
				}
				else {
				// 3. 실시간 접속자가 없다. 할일 없다.
					log.info('[EVENT-SCRIPT] es_action_to_user:PUSH not found:key=' + key_name);
				}
	        });
		});	// _(send_uids).
	};


	// INFO : 앱 가입자에게 메시지 전달 처리. (ACTION_TO_BROADCAST)
	//  -실시간 접속 유저에게만 알릴 수 있다. 
	//  -ckpush-action-to-broadcast cahnnel 을 이용한다.
	// event_type :
	//   -report_
	var es_action_to_broadcast = function (app_id, event_type, ud) {
		var	action = ud.action;
		log.debug('[EVENT-SCRIPT] es_action_to_broadcast:event_type=' + event_type + ', app_id=' + app_id + ':ud=' + gv.inspect(ud) );

		// INFO : broadcast : to ckpush-front
		var send_broadcast = new fv.models.message_channel({ qname : 'ckpush-action-to-broadcast' });
		send_broadcast.sendData(app_id, event_type, ud);
	};


    // INFO : 특정 채널로 전송
	// ch 은 변수가 된다.
    // event_type :
    //   -report_
    var es_action_to_mqtt = function (app_id, topic, event_type, ud) {
        var	action = ud.action;

        ud.ack_topic = topic;		// ud 에 응답할 topic 을 추가/수정 한다.
        // LOG DEPRECATED
        // log.debug('[EVENT-SCRIPT] es_action_to_mqtt:ack_topic=' + gv.inspect(topic) + ', event_type=' + event_type + ', app_id=' + app_id + ':ud=' + gv.inspect(ud) );

        // INFO : publish to channel : to ckpush-front
       var send_channel = new fv.models.message_channel({ qname : 'ckpush-action-to-mqtt' });
       send_channel.sendData(app_id, event_type, ud);
    };


    //
	// push_delyed_event, (TODO) key space를 사용하지 않고, 실제로 메시지를 delay 시키도록 한다.
	//  -중복발생시, cancel or ignore 옵션 줘야함.
	// postDelayed 규격 참조.
	//
	var push_delyed_event = function (keyspace) {
		log.debug('@push_delyed_event:' + keyspace);
		
		var key_split = keyspace.split(".");

/* for debug TODO : delayed 구조 수정 검토..
		for (var i = 0; i < key_split.length; i++) {
			// post.app_id.check-club-level.111
			log.debug('@index=' + i + '=' + key_split[i]);
		}
*/
		
		if (key_split.length < 3) {
			log.warn('@invalid push_delayed_event key. keyspace=' + keyspace);
			return;
		}

		// key space 를 기준으로 새로운 이벤트를 만들어 낸다.
		// post delayed 규격을 따른다. 
		var event = new fv.models.message_queue({ qname : 'queue.event' });
		event.pushData(key_split[1], key_split[2], { delayed_data : key_split[3] } );
	};

	
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	var protocol = {
		// INFO : 구간(Term) 반응 UI (keyspace notification) 아님.
		parse_timer_notification : function (keyspace, cmd) {
			log.debug(':parse_timer_notification:' + keyspace);
			

		},
		
		// TODO : 메시지를 날리는 부분은 app 단위로 수정할 것 (06.02)
		//
		// INFO : keyspace notification parse	
		parse_keyspace_notification : function (keyspace, cmd) {
            // log.debug('[REDIS] >>parse_keyspace_notification:FCM:' + keyspace + ', cmd=' + cmd);
			// pmessage#>pattern=__keyspace@15__:*, channel=__keyspace@15__:queue.event, message=rpush
			if (keyspace == 'queue.event' && cmd == 'rpush') {
				//log.debug('[REDIS] >>parse_keyspace_notification:' + keyspace + ', cmd=' + cmd);
				
				var event = new fv.models.message_queue({ qname : 'queue.event' });
				event.popData(function(error, result) { 
					if (error) {
						//동시 발생 이벤트로 인해 주로 발생함. (not 1 event 1 queue data)
						if (error == 'not found') return;
						
						log.error('>>ERROR pop queue.event:' + gv.inspect(error));
						return;
					}
					
					
					if (result == null) {
						log.error('>>ERROR result is null, pop queue.event:' + gv.inspect(error));
						return;		// by pass
					}

                    //LOG PRECATED : INFO : 이벤트 처리 로그
					//log.debug('>>EVENT:' + result);
					
					var pobject = JSON.parse(result);
											//
					// INFO : 이벤트 맵을 가동시킨다.
					//
					event_map_processor(pobject);
					
/* TODO : deprecated : 05/31 - 일단 사용하지 않는다.
					try {
						var pobject = JSON.parse(result);

						// EVENT : 전체 event monitoring (일단 console 만 처리한다.)  
						var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
						event_monitor.sendData('console', 'event-monitor', pobject);


						//
						// INFO : 이벤트 맵을 가동시킨다.
						//
						event_map_processor(pobject);
						
					}

					catch (e) {
						log.error('Exception:parse_keyspace_notification:' + gv.inspect(e) );
					}
*/
				});
				
			}
			else if (keyspace.substring(0, 5) == 'post.' && cmd == 'expired') {
			// post.app_id.check-club-level.111, message=expired
				push_delyed_event(keyspace);
			}
            else if (keyspace == 'queue.fcm' && cmd == 'rpush') {
                log.debug('[REDIS] >>parse_keyspace_notification:FCM:' + keyspace + ', cmd=' + cmd);

                // INFO: 2018.03.02 - queue.event 와 같이 Model 구조를 사용했어야 하는데, 그냥 코드를 가지고 온것 같다.
                var key_name    = keyspace;
                fv.redis_client.send_command('LLEN', [key_name], function (error, result) {
                    if (error) {
                        log.error('ERROR send_command:LLEN:' + gv.inspect(error));
                        return;
                    }

                    // TODO : 갯수를 모른다면 LRANGE 형태로 받아와도 되는데, 여기서는 약간의 트릭들이 필요할 듯 하다.
                    // 일단은 단순 루프 형태로 작동하도록 한다. 100개 정도를 한번에 처리하도록 했는데, 필드테스트는 필요하다.
                    // 실제, 1 개 이상일때는 무조건 노티를 날리는 것보다는 그룹핑 방식도 필요하다.
                    // 노티를 못 받는 경우를 대비해 일정 시간에 한번 검사하는 로직을 보조로 돌리면 된다.
                    var pop_count = result;
                    if (pop_count > 10) pop_count = 10;		// MAX 10 까지 동시처리로 제한한다.
                    for (var i = 0; i < pop_count; i++) {
                        // 일종의 비정규형으로 for loop 를 돌게 된다. (대부분의 경우 1이다.)

                        fv.redis_client.send_command('LPOP', [key_name], function (error, result) {
                            if (error) {
                                log.error('ERROR parse_keyspace_notification:send_command:LPOP:' + gv.inspect(error));
                            }
                            else {
                                //INFO : queue POP 로그
                                log.debug('>LPOP:' + key_name + ':' + result);
                                if (result == null) return;     // 2018.03.02 - Error Assert

                                var fcm_object = JSON.parse(result);

                                //
                                // APNS
                                // TODO: 2018.03.22, 메시지쪽으로 _mt 를 올릴것
                                if (fcm_object.ud && fcm_object.ud._mt == 'APNS') {
                                    log.debug("[APNS] sent message:", fcm_object);
                                    delete fcm_object._mt;

                                    // INFO : - 에러를 내고 죽는다. Error: certificate has expired: 2016-05-25T03:43:33.000Z
                                    // 를 처리하려고 했으나 실제 처리되지 않았다.
                                    try {
                                        var apns_tokens = fcm_object.rids;
                                        var apns_data = {
                                            app_id : fcm_object.app_id,
                                            title: fcm_object.ud.title,
                                            message : fcm_object.ud.message,
                                            payload : fcm_object.ud.payload,
                                        };

                                        log.debug('[APNS] apns_tokens=' + gv.inspect(apns_tokens));
                                        log.debug('[APNS] apns_data=' + gv.inspect(apns_data));


                                        // TODO: 2018.03.22, check try
                                        var recv_devices = [];
                                        for (var i = 0; i < apns_tokens.length; i++) {
                                            recv_devices[i] = new fv.apn.Device(apns_tokens[i]);
                                        }

                                        // INFO : 하나의 메시지를 만든다.
                                        var note = new fv.apn.Notification();
                                        note.badge = 0;                                     //INFO : 아이콘 뱃지 카운트 (값을 주지 않으면, 기존 값이 남아있게된다.)
                                        note.expiry = Math.floor(Date.now() / 1000) + 3600; //INFO : Expires 1 hour from now.
                                        note.sound = "default"; //"ping.aiff";              //INFO : 사운드가 있으면 진동도 된다.
                                        note.alert = {
                                            title: apns_data.title,        //INFO : from iOS8.2, Apple Watch displays this string as part of the notification interface
                                            body: apns_data.message            //INFO : 실제 메시지 수신후 보이는 메시지로 보면됨.
                                        };

                                        // INFO: 2018.08.20, payload 부를 user data 부로 사용한다.
                                        // INFO: 2018.08.20, APNS 는 payload 이하부가 Object type 이 가능하다. (FCM 은 String이 가능하다)
                                        if (apns_data.payload) {
                                            note.payload = apns_data.payload;
                                            //note.payload = {'url': 'ckpush://rainbird/test/hi'};
                                        }
                                        // deprecated: 2018.08.20,
                                        // if (apns_data.url) {
                                        //     note.payload = {
                                        //         ckpush: {
                                        //             url: apns_data.url
                                        //         }
                                        //     };
                                        // }

                                        // TODO : recv_device 에 오류가 있으면 그냥 전체 발송을 포기해 버린다.
                                        // -이에 대한 방안은 필요하다.
                                        if (apns_data.app_id) {
                                            // TODO : 결과 확인 할것, sendNotification 과 비교해 볼 것.
                                            log.debug('[APNS] try send apns=' + gv.inspect(note));
                                            fv.apnConnection[apns_data.app_id].pushNotification(note, recv_devices);
                                        }
                                    }
                                    catch (e) {
                                        log.error('[APNS] try/catch exception:' + e);
                                    }
                                }
                                //
                                // FCM2 Message (레인버드지오)
                                //
                                else if (fcm_object.ud && fcm_object.ud._mt == 'FCM2') {
                                    log.debug("[FCM2] send message:", fcm_object);
                                    delete fcm_object._mt;

                                    // TODO: check JSON(fcm_object)
                                    var registrationTokens = fcm_object.rids;
                                    var payload = {data: fcm_object.ud};

                                    fv.fcm.messaging().sendToDevice(registrationTokens, payload)
                                        .then(function (response) {
                                            // See the MessagingDevicesResponse reference documentation for
                                            // the contents of response.
                                            log.debug("FCM sent message:", response);
                                        })
                                        .catch(function (error) {
                                            log.error("FCM Error sending message:", error);
                                        });
                                }
                                //
                                // FCM Message (제일사료 : 초기 스타일)
                                //
                                else {
                                    log.debug("[FCM] send message:", fcm_object);

                                    // TODO: check JSON(fcm_object)
                                    var registrationTokens = fcm_object.rids;
                                    var payload = {data: fcm_object.ud};

                                    fv.fcm.messaging().sendToDevice(registrationTokens, payload)
                                        .then(function (response) {
                                            // See the MessagingDevicesResponse reference documentation for
                                            // the contents of response.
                                            log.debug("FCM sent message:", response);
                                        })
                                        .catch(function (error) {
                                            log.error("FCM Error sending message:", error);
                                        });
                                }
                            }
                        });
                    }
                });
            }
		},	
		
		// INFO : GCM을 전송한다. dry_run 옵션을 처리할 수 없는 라이브러리다..
		// config.crm.gcm_real_send == true 면 실제 전송을 진행한다.
		//  -gcm_id : array of gcm_rid
		//  -push_object : { message : 'msg', message_en : 'msg_en' }
		//
		// #SIMPLE GCM FORMAT
		//	{
		//		key1: 'gcm-v1',			// App 단의 Notification 부분을 확인할 것.
		//		key2: gv.inspect({ _t : 'multi', message : push_object.message, message_en : push_object.message_en,  }),
		//	}
		gcm_simple_send : function (gcm_id, push_object, cb_function) {
			log.debug('[GCM] gcm_simple_send:push_object:' + gv.inspect(push_object));

			if (!push_object.message) push_object.message = '#EMPTY MESSAGE';
			if (!push_object.message_en) push_object.message_en = push_object.message;
			if (!push_object._mg) push_object._mg = 'ga';		// message group : ga, g1, g2, g3, ...
					
			var message_tid = gv.getTimeS() + '_' + (Math.floor(Math.random() * 10000));
			var message = new fv.gcm.Message({
				collapseKey    : 'collapseKey',		
				delayWhileIdle : false,			// indicates that the message should not be sent immediately if the device is idle
				timeToLive     : 86400,			// default time-to-live is 4 weeks
				data           : {
					tid : message_tid,			// tid 추가, 
					key1: 'gcm-v1',			// App 단의 Notification 부분을 확인할 것.
					key2: gv.inspect({ 
						_t : 'multi', 
						//type : push_object.type, 		// deprecated : 2014.06.17
						_mg : push_object._mg,			// added : 2014.08.14, message group
						message : push_object.message, 
						message_en : push_object.message_en,  
					}),
				}
			});
	
			var registrationIds = gcm_id;	// 바로 수신자들을 대응시킨다.
			log.info('[GCM] gcm_simple_send:gcm_send:' + gv.inspect(registrationIds));
			
			if (gv.config.crm.gcm_real_send == true) {
			// INFO : 실제 전송 모드 
				fv.gcm_sender.send(message, registrationIds, 2, function(error, result) {
					if (error) {
						log.error('[GCM] ERROR gcm_simple_send:gcm_send:' + gv.inspect(error));
					}
					else {
						result.tid = message_tid;		// result 에 tid 추가 
						log.info('[GCM] gcm_simple_send:gcm_send result=' + gv.inspect(result));
					}
					
					cb_function(error, result);
				});
			}
			else {
			//
			// INFO : 개발 전송 모드 
			//
				var test_gcm_result = [];
				for (var i = 1; i < gcm_id.length; i++) {
					test_gcm_result[i] = { "message_id": "0:1394621389789959%6f54fd31b105c772" }; 	// sample 이라서 똑 같다.
				}
				test_gcm_result[0] = { "error": "InvalidRegistration" };	// error 한개를 포함한다. 
			
				var test_result = {
					"tid" : message_tid,					// 추가
				    "multicast_id": 5486022024109520000,
				    "success": gcm_id.length - 1,
				    "failure": 1,
				    "canonical_ids": 0,
				    "results": test_gcm_result
				};
				
				cb_function(null, test_result);
			}
		},

		// INFO : GCM을 전송한다. dry_run 옵션을 처리할 수 없는 라이브러리다..
		// config.crm.gcm_real_send == true 면 실제 전송을 진행한다.
		//  -gcm_id : array of gcm_rid
		//  -gcm_data : { from http }
		gcm_object_send : function (gcm_id, gcm_data, cb_function) {
			log.debug('[GCM] gcm_object_send:push_object:' + gv.inspect(gcm_data));

            var message_tid = gv.getTimeS() + '_' + (Math.floor(Math.random() * 10000));
            var gcm_dry_run = gv.config.crm.gcm_dry_run;        // true 면 테스트 모드
			var message = new fv.gcm.Message({
				collapseKey    : 'collapseKey',
                dryRun         : gcm_dry_run,       // dry_run 실행 (true 면 테스트 모드)
				delayWhileIdle : false,			    // indicates that the message should not be sent immediately if the device is idle
				timeToLive     : 86400,			    // default time-to-live is 4 weeks
				data           : gcm_data,          // 그냥 받은대로 쏜다.
			});

			var registrationIds = gcm_id;	// 바로 수신자들을 대응시킨다.
            if (gcm_dry_run == true) {
                log.info('[GCM] message dry_run mode:test mode');
            }
            else {
                log.info('[GCM] message dry_run mode:real mode');
            }
			log.info('[GCM] gcm_object_send:gcm_send:' + gv.inspect(registrationIds));

            if (gcm_data.app_id) {
                //TODO : 선행조건으로 gv.config.sys.license.gcm_server_keys[] 가 유효한지 부터 확인해야한다.
                var gcm_server_key = gv.config.sys.license.gcm_server_keys[gcm_data.app_id];
                if (!gcm_server_key) {
                    log.warn('[GCM] gcm_object_send:Invalid gcm_server_key:' + gcm_server_key);
                    return;
                }

                var gcm_sender = new fv.gcm.Sender(gcm_server_key);
                gcm_sender.send(message, registrationIds, 3, function(error, result) {
                    if (error) {
                        log.error('[GCM] ERROR gcm_objects_send:gcm_send:' + gv.inspect(error));
                    }
                    else {
                        result.tid = message_tid;		// result 에 tid 추가
                        log.info('[GCM] gcm_object_send:gcm_send result=' + gv.inspect(result));
                    }

                    cb_function(error, result);
                });
            }
            else {
                log.warn('[GCM] gcm_object_send:Invalid app_id:' + gcm_data.app_id);
            }

            //fv.gcm_sender.send(message, registrationIds, 2, function(error, result) {
            //    if (error) {
            //        log.error('[GCM] ERROR gcm_objects_send:gcm_send:' + gv.inspect(error));
            //    }
            //    else {
            //        result.tid = message_tid;		// result 에 tid 추가
            //        log.info('[GCM] gcm_object_send:gcm_send result=' + gv.inspect(result));
            //    }
            //
            //    cb_function(error, result);
            //});
		},
	}
	
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return protocol;
}