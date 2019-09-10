/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-redis-handler.js
 * @version : 3.0.0
 * @notes
 */


/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	//var util = require('util');
    var _ = require('lodash');

	// global variable for this file (scope : in file)
	var log = gv.config.log;


	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	// INFO : REDIS message 를 처리한다.
	//
	fv.redis_sub_ch.on('message', function (channel, message) {
		//log.info(':->[REDIS] message#>CH:' + channel + ':' + message);

		//
		// INFO : 1시간 단위 event 임.
		//
		if (channel == 'ckpush-time-1hour') {
			log.info(':->[REDIS] message#>CH:' + channel + ':' + message);

			fv.datas.front_info.shiftHourly();		// instance 를 그대로 사용한다.

			var sql = 'SELECT count(*) as cnt FROM ras_connect_mode ';		// INFO : 그냥 mysql을 한번 select 한다.
			fv.mysql_client.query(sql, function(error, results) {
				if (error) log.error('ERROR : ' + sql);
			});
		}
		//
		// INFO : event-script 에서 front 용으로 알린 것임
		//
		else if (channel == 'ckpush-action-to-broadcast') {
			var omsg = JSON.parse(message);
			if (!omsg) return;

			log.info(':->[REDIS] message#>CH:' + channel + ':' + message);
			//LOG : message={"app_id":"p2x1","tid":"1396257551875_7533","ctime":1396257551,"et":"changed-user-info-broadcast",
			//      "ud":{"action":"ACTION_TO_BROADCAST","member_srl":0,"shell":100,"pearl":999}}
			//TODO : 정확히는 parse_channel_notification 혹은 그 관련 함수를 하나 추가하는 것이다.
			//단말이 수신하는 데이터 {"action":"ACTION_TO_BROADCAST","member_srl":0,"shell":100,"pearl":999,"_t":"test-changed-user-info-broadcast","_i":"1396258859993_6796"}
			omsg.ud._t = omsg.et;	//
			omsg.ud._i = omsg.tid;
			fv.protocol.parse_channel_notification(channel, omsg);
		}
        //
        // INFO : event-script 에서 front to MQTT 용으로 알린 것임
        //
        else if (channel == 'ckpush-action-to-mqtt') {
            var omsg = JSON.parse(message);
            if (!omsg) return;
			// LOG DEPRECATED
            // log.info(':->[REDIS:MQTT] message#>CH:' + channel + ':' + message);

            if (omsg.ud && omsg.ud.ack_topic) {
                var topic = omsg.ud.ack_topic;

                // message data topic (message 는 String 이어야 한다.)
                // INFO: 2019.01.20, tooic type 에 따라 멀티 토픽을 지원하고, 데이터의 타입에 따라 string bypass 지원한다.
                //log.info(':->[REDIS:MQTT] message#>topic type:' + (typeof topic) + ', topic=' + JSON.stringify(topic));
                //log.info(':->[REDIS:MQTT] message#>data type:' + (typeof omsg.ud.mqtt_data) + ', data=' + JSON.stringify(omsg.ud.mqtt_data));

                // TODO : message 내부에 커스텀 프로토콜 하위 필드가 있다고 가정하면 omsg.ud.reply 형태로 결과를 전송하면 된다.
                // TODO : ud.mqtt_data 체크로직 필요함.
				// INFO : 2017.04.09 - mqtt_data.message 를 삭제하고 mqtt_data 로 수정함.
				// INFO : 2017.05.17 - topic 을 string || array 도 처리할 수 있도록 바꿈. (publish 는 array 를 지원하지 않아 그냥 발송한다)
                // INFO: 2018.12.18, string type 을 먼저 분석처리하고, 혹시나 Array 인지 확인한다.
				if (typeof topic === "string") {
                    // INFO: 2019.01.20, data type 을 확인해서 string 이면 bypass 한다.
					if (typeof omsg.ud.mqtt_data === "string") {
                        fv.mqtt_client.publish(topic, omsg.ud.mqtt_data);
					}
                    else {
                        fv.mqtt_client.publish(topic, JSON.stringify(omsg.ud.mqtt_data));
                    }
                }
                else if (topic.constructor === Array) {
                    for (var ti = 0; ti < topic.length; ti++) {
                        // LOG DEPRECATED
                        // log.debug(':->[REDIS:MQTT] message#>topic array, topic(' + ti + ')' + topic[ti]);

                        // INFO: 2019.01.20, data type 을 확인해서 string 이면 bypass 한다.
                        if (typeof omsg.ud.mqtt_data === "string") {
                            fv.mqtt_client.publish(topic[ti], omsg.ud.mqtt_data);
                        }
                        else {
                            fv.mqtt_client.publish(topic[ti], JSON.stringify(omsg.ud.mqtt_data));
                        }
                    }
                }

                // deprecated : 2018.12.18
				// if (topic.constructor === Array) {
                //     for (var ti = 0; ti < topic.length; ti++) {
                //         fv.mqtt_client.publish(topic[ti], JSON.stringify(omsg.ud.mqtt_data));
                //     }
                // }
                // else {
                //     fv.mqtt_client.publish(topic, JSON.stringify(omsg.ud.mqtt_data));
				// }

                // TODO : ud.mqtt_data.message 체크로직 필요함.
                //fv.mqtt_client.publish(topic, JSON.stringify(omsg.ud.mqtt_data.message));
                // deprecated : 전체데이터 전송,
				//fv.mqtt_client.publish(topic, message);
                //fv.mqtt_client.publish('/ack/smartmat/1', "test result");
            }
            else {
            	log.error(':->[REDIS:MQTT] message#>CH:' + channel + ':error in topic=' + message);
			}
        }		//
		// INFO : 뒷단에서 front 로 요청이 날라온 것임. (휘발성 채널임)
		//
		else if (channel == 'ckpush-push-' + gv.config.crm.hostname + '-' + gv.config.crm.httpd_port) {
			var omsg = JSON.parse(message);
			if (!omsg) return;

			//log.debug('>CHANNEL:received ch[' + channel + '] : ' + message);

			// LOG : >>> push channel received:{"app_id":"p2x1","tid":"1392710028820_7744","ctime":1392710028,"et":"OLD-PUSH","ud":{"member_srl":"7777","soc_id":"5SDF4A1X7RJ5XBym_GTN"}}
			// LOG : >>>   {"app_id":"p2x1","tid":"1392887469694_3752","ctime":1392887469,"et":"push-member","ud":{"member_srl":"7504","message":"가나다\n","user_tag":{"app_id":"admin","ssid":"authorized","ip":"112.216.155.226","soc_id":"63JgA-N323g2hvJkjBcR"}}}
			if (omsg.ud.action) {
				if (omsg.ud.action == 'ACTION_TO_USER') {
                    var tag = fv.ws_manager.get_connect_info(omsg.ud.soc_id);
                    if (tag && tag.conInfo) {
                        fv.push.message_to_node(omsg.ud.soc_id, omsg.et, omsg.ud.push_object);
                    }
                    else {
                    	// NOT Found socket, ignore (이전 레디스에 저장된 소켓일 수 있으니 착각 금지)
                    	log.warn('#CHANNEL soc_id not found : ' + omsg.ud.soc_id + ', to_uid=' + omsg.ud.to_uid);
                    }

                    // var	socket = fv.socket_io.sockets.sockets[omsg.ud.soc_id];
					// if (socket) {
					// 	//log.debug('<<try PUSH to user=' + gv.getLogTag(socket));
					// 	if (socket.handshake._user_.app_id == omsg.app_id && socket.handshake._user_.member_srl == omsg.ud.to_uid) {
					// 		// 단말이 수신하는 데이터 : {"action":"ACTION_TO_USER","to_uid":0,"member_srl":0,"shell":100,"pearl":999,"_t":"test-changed-user-info-user","_i":"s_1396258696675"}
					// 		fv.push.message_to_node(socket, omsg.et, omsg.ud.push_object);
					// 	}
					// 	else {
					// 		log.error('#CHANNEL:app_id && to_uid invalid :' + omsg.app_id + ', to_uid=' + omsg.ud.to_uid);
					// 	}
					// }
					// else {
					// 	// NOT Found socket, ignore
					// 	log.warn('#CHANEEL soc_id not found : ' + omsg.ud.soc_id + ', to_uid=' + omsg.ud.to_uid);
					// }
				}
				// else if (omsg.ud.action == 'ACTION_TO_USER') { ; }
			}
			else {
				var	socket = fv.socket_io.sockets.sockets[omsg.ud.soc_id];
				if (socket) {
					//log.debug('<<try PUSH to user=' + gv.getLogTag(socket));
					if (socket.handshake._user_.app_id == omsg.app_id && socket.handshake._user_.member_srl == omsg.ud.member_srl) {
						// INFO : PHP --OLD_ALARM--> ckpush-event--> push-notify-hint--> ckpush-front
						if (omsg.et == 'push-notify-hint') {
							fv.push.notify_hint_to_node(socket);
						}
						// INFO : ADMIN(or) --push-message--> ckpush-event--> push-message--> ckpush-front
						else if (omsg.et == 'push-message') {
							fv.push.message_to_node(socket, 'NOTIFY_MESSAGE', omsg.ud.push_object);
						}
						// INFO : 뒷단에서 admin 으로 리포팅을 위한 기본 프로토콜
						else if (omsg.et == 'report-admin') {
							fv.push.message_to_node(socket, 'REPORT_ADMIN', omsg.ud.push_object);
						}
						else {
							log.error('#CHANNEL:unknown event_type :' + omsg.et);
						}
					}
					else {
						log.error('#CHANNEL:app_id && member_srl invalid :' + omsg.app_id + ', member_srl=' + omsg.ud.member_srl);
					}
				}
				else {
					// NOT Found socket, ignore
					log.warn('#CHANEEL soc_id not found : ' + omsg.ud.soc_id + ', member_srl=' + omsg.ud.member_srl);
				}
				//
			}
		}
		//
		// INFO : 뒷단에서 front 로 monitor 용으로 알린 것임 (별도 용도임)
		//
		else if (channel == 'ckpush-event-monitor') {
			var omsg = JSON.parse(message);
			if (!omsg) return;

			//var packet = fv.protocol.make_packet(omsg.et, omsg);
			omsg._t = 'ras-monitor'; // 강제로 _t 를 ras-monitor로 수정한다.
			omsg._i = 0;

            // TODO : 2017.10.22, 모든 console 로 다 전달해야 한다.
			var socketManager = fv.ws_manager.get_socket_manager();
            //log.debug('##[TODO:socketManager key size]=' + _.keys(socketManager).length);     // 1

            // INFO : 2017.12.05, 접속된 socket 처리
			var sockets = _.keys(socketManager);
			for (var i = 0; i < sockets.length; i++) {
                //log.debug('socketManager app_id]=' + fv.ws_manager.get_connect_info(sockets[i]).conInfo.app_id + ', channelType=' + fv.ws_manager.get_connect_info(sockets[i]).conInfo.channelType) ;     // 1
                // INFO : 2017.12.05, console 로만 전송한다.
				if (fv.ws_manager.get_connect_info(sockets[i]) && fv.ws_manager.get_connect_info(sockets[i]).conInfo.app_id != 'console') continue;

                fv.push.message_to_node(sockets[i], omsg._t, omsg);
            }
		}
	});



	// INFO : REDIS keyspace notification 처리.
	fv.redis_sub_ch.on('pmessage', function (pattern, channel, message) {
		//pmessage#>pattern=__keyspace@*__:*, channel=__keyspace@15__:connect.7504.hostname.10000.hxDJWCZxe84RkMeW1cz-, message=expired
		//  MUST : +set, expired, rpush, hset
		//  NOT  : -rename_from, rename_to, set, rpush, hset, expire, expired

		//log.debug(':->[REDIS] pmessage#>pattern=' + pattern + ', channel=' + channel + ', message=' + message);

		var channel_keyspace = '__keyspace@' + gv.config.sys.license.redis_event_db.db_id + '__:';
		if (channel_keyspace == channel.substring(0, channel_keyspace.length)) {
            //INFO:채널메시지 로그용
			//log.debug(':->[REDIS] pmessage#>pattern=' + pattern + ', channel=' + channel + ', message=' + message);
			var keyspace = channel.substring(channel_keyspace.length);
			var cmd = message;

            //log.error('TODO:front-redis-handler:fv.protocol.parse_keyspace_notification', channel_keyspace);
			// LOG DEPRECATED
            // log.debug('[REDIS] pmessage#>pattern=' + pattern + ', channel=' + channel + ', message=' + message);
            // // INFO : keyspace notification parse
			fv.protocol.parse_keyspace_notification(keyspace, cmd);
		}


	});


	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

