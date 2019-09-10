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
 *  TODO : Check protocol
 *  -ras-user-auth 		: base protocol
 *  -ras-alive 			: base protocol
 *  -ras-bye			: base protocol
 *  -ras-command		: console protocol
 *  -ras-protocol-v1	: service protocol v1
 */


/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var _ = require('lodash');
	var request = require('request');
	var exec = require('child_process').exec, child;
    var fs = require('fs');

	// global variable for this file (scope : in file)
	var log = gv.config.log;


	// object-changed event syncer
	var object_changed = function (keyspace, cmd) {
		// [REDIS] pmessage#>pattern=__keyspace@10__:*, channel=__keyspace@10__:ui.app_id.test, message=hset
		// hset, del


		// TODO : key name 규격을 정리해야 대응할 수 있다.
		//  -ui object : ui.app_id.name
		//  -config object : config.app_id.event-map
		//  -widget : widget.name
		//
		var bind_object = new fv.models.ui_object({ ui_name : keyspace });

        // INFO : 2015.06.30 : hincrby 추가 (parse_keyspace_notification() 에서도 필터 로직이 있으므로 주의할것)
        // TODO : 조금 더 고려한다면 field 단위의 변경은 field 단위의 변경으로 처리하면 튜닝이 가능해진다.
		if (cmd == 'hset' || cmd == 'hdel' || cmd == 'rename_to' || cmd == 'hincrby') {
			bind_object.getObject(function(error, result) {
				// INFO : bind_object 에서 문제가 있으면 result == null 상태가 된다.
				//   2015.08.27, Spring serialize에서 이런 경우가 발생했음, event 쪽에서는 문제가 없이 처리가 됨.
				//   TEST code : (hset ui.console.com "\x00\x06kodaji" 1223)
				//   console 에서는 kodaji 1223 으로 정상적 값으로 보임.
                if (result == null) {
                    log.warn('bind-object is null. bind_object.getObject() error');
                    return;
                }

                log.debug('bind-object(' + cmd + ')=' + gv.inspect(result));

				result.app_id = bind_object.get('app_id');	// app_id 추가
				result._key = keyspace; //ui_object.get('ui_name');		// ui 이름 추가

				// INFO : 전체로 전송하는 것은 막는다.
				//protocol.sync_room(null, fv.socket_io_room_svc, protocol.make_packet('object-changed', result) );
				protocol.sync_room(null, bind_object.get('app_id'), protocol.make_packet('object-changed', result) );
			});
		}
		// INFO : 2014.06.23 rename_from 추가함.
		else if (cmd == 'del' || cmd == 'expired' || cmd == 'rename_from') {
			bind_object.getName();		// object 초기화만 한다.

			// INFO : 전체로 전송하는 것은 막는다.
			//protocol.sync_room(null, fv.socket_io_room_svc, protocol.make_packet('object-deleted', { app_id : bind_object.get('app_id'), _key : keyspace } ) );
			protocol.sync_room(null, bind_object.get('app_id'), protocol.make_packet('object-deleted', { app_id : bind_object.get('app_id'), _key : keyspace } ) );
		}
	};

	//////////////////////////////////////////////////////////////////////
	//
	//////////////////////////////////////////////////////////////////////
	var protocol = {
		//
		// INFO : message.ud 만 전송한다. 주의할것. ud._t = 'xx' 형태로 들어가야 한다.
		parse_channel_notification : function (keyspace, message) {
			// INFO : 로그가 너무 많이 나온다.
			//log.debug('parse_channel_notification:' + keyspace + ', message=' + gv.inspect(message));
			log.debug('>>action_to_broadcast:app_id=' + message.app_id + ', keyapsce=' + keyspace + ', ud=' + gv.inspect(message.ud));

			// INFO : socket notification
			//protocol.sync_room(null, fv.socket_io_room_svc, message.ud);
			protocol.sync_room(null, message.app_id, message.ud);		// 해당 app_id 로만 전송한다.
		},

		//
		// INFO : keyspace notification parse
		parse_keyspace_notification : function (keyspace, cmd) {

			// INFO : del, expired : connect.*.* 처리 : connect.app_id.uid.hostname.port.socket_id
			//                                         connect.unknown.unauthorized.app_id.20002.Bn3GqvhGhlkCEbT0HVrM
			//if (keyspace.substring(0, 8) == 'connect.' && (cmd == 'expired' || cmd == 'del')) {	// 2014.03.19 - cmd del 에 대해서도 지원하나, 자기가 삭제한 것에 대해서도 이벤트가 발생한다.
			//if (keyspace.substring(0, 8) == 'connect.' && cmd == 'expired') {		// 2014.03.19 - del 에 대해서는 더 이상 삭제를 지원하지 않는다. (이런 경우는 cmd line에서 발생한다)
			if (keyspace.substring(0, 8) == 'connect.' && (cmd == 'expired' || cmd == 'del')) {	// 2014.04.10 - cmd del 에 대해서도 다시 지원한다.
				log.debug('>>parse_keyspace_notification:(dis)connect:' + keyspace + ', cmd=' + cmd);

				var keys = keyspace.split(".");
				// connect.unknown.unauthorized.hostname.20002.Bn3GqvhGhlkCEbT0HVrM
				// 0 : prefix, connect
				// 1 : app_id, p2sx
				// 2 : userid, 7504
				// 3 : hostname, host-name (dot 사용금지)
				// 4 : port, 30001
				// 5 : soc_id, EQ_gWEpF3o4_LFdKAV7X
				try {
					if (gv.config.crm.hostname == keys[3] && gv.config.crm.httpd_port == keys[4]) {
						//log.debug('>>parse_keyspace_notification:my connect');

						var soc_id = keys[5];	// get soc_id
						//log.debug('>>parse_keyspace_notification:my connect:' + soc_id);

                        // TODO : 2017.12.26,disconnect by socket id
                        log.debug('>>[WS] TRY disconnect, found connect info=', soc_id);

                        // INFO : 2017.12.26, closedByExpire
                        fv.ws_manager.unset_connect_info(soc_id, true);

                        // INFO : 2017.12.26, 하기 로직은 deprecated 처리함.
                        // var user_socket = fv.socket_io.sockets.sockets[soc_id];
                        //
						// if (user_socket && user_socket.handshake && user_socket.handshake._user_) {
						// 	log.debug('>>TRY disconnect, find user_socket=' + gv.inspect(user_socket.handshake._user_));
                        //
						// 	user_socket.disconnect(true);
						// }
						// else {
						// 	log.debug('>>skip, not managed user_socket=' + soc_id);
						// }
					}
					else {
						; // 나와는 무관한 분리된 서버이므로 무시한다.
					}
				}
				catch (e) {
					log.error('>>parse_keyspace_notification:(dis)connect:' + e);
				}

			}
			//
			// [REDIS] pmessage#>pattern=__keyspace@10__:*, channel=__keyspace@10__:ui.fapp_id.test, message=hset
			//
			else if ((keyspace.indexOf('ui.') == 0 || keyspace.indexOf('config.') == 0 || keyspace.indexOf('widget.') == 0)
				  && (cmd == 'hset' || cmd == 'hdel' || cmd == 'del' || cmd == 'expired' ||
                      cmd == 'rename_from' || cmd == 'rename_to' || cmd == 'hincrby')
                ) {
                //INFO : ui, config, widget 로그용
				//log.debug('>>parse_keyspace_notification:bind-object:' + keyspace + ', cmd=' + cmd);

				object_changed(keyspace, cmd);
			}
		},


		//
		// TODO : log.debug 외에 warning, notice 를 삼키고 있는데, 확인이 필요하다.
		//   _t, _i, user_data
		// -전체적인 프로토콜에 대한 ASSERT 가 필요하다.
		// -하지 않으면, 클라이언트에서의 잘못된 요청이 서버에 영향을 미친다. (점차 패킷 체크를 하여라.)
		parse_packet : function (socketId , pdata) {
			if (!pdata) return;

			switch (pdata._t) {
				//{"_t":"ras-user-auth","user_name":"chohs","member_srl":632,"user_email":"chohs@ckstack.com","sex":"male","photo":"","ras_app_id":"console","sec_key":"1234."}
				case 'ras-user-auth':
                    // TODO : 2017.10.22, user 정보 저장건
                    // let conInfo = {
                    //     user_name: pdata.user_name,
                    //     member_srl :pdata.member_srl,
						// user_email : pdata.user_email,
						// sex : pdata.sex,
						// photo : pdata.photo,
						// app_id : pdata.ras_app_id,		// ras 내에서는 app_id 로 통일됨.
						// sec_key : pdata.sec_key,
						// noti_count : 0,					// TODO : deprecate, 2014/02/18
						// noti_srl : 0,					// TODO : deprecate, 2014/02/18
                    // };

                    // TODO : 2017.10.22, 클라이언트에서 올린 접속 인증정보를 사용해서 뭔가 해야한다.

                    // TODO : CONSOLE, ADMIN 은 일단 IP로 막는다., 기타 거부로직 일차 제거

                    // INFO : 일단 답을 주고,
                    protocol.send_reply(socketId, 0, pdata._t, pdata._i);

                    //
                    // TODO : sec_key 를 검증해야 한다.

					//
                    // TODO :  set_user_info 에서 데이터 처리를 진행하므로, 그 결과로 send_reply 와 여러가지 인증처리를 진행하도록 한다.

                    // TODO : ws 정보가 없다.  인증에 의해서 유저 정보를 업데이트 하는 로직이 별도 필요하다.
		            //fv.ws_manager.set_connect_info(userAuth.member_srl, socketId, ws);

                    // TODO : 2017.10.22, user 정보가 없기에 그냥 이벤트로 바로 처리한다.
                    // TODO : 2017.10.22, 일단 초기 접속시에 저장된 그대로 사용한다. (아직 클라이언트가 올린 데이터를 저장하지 않는다.)
                    // TODO : 2017.10.22, 초기 'connected' event 처리로직과도 관련이 있다.
                    var tag = fv.ws_manager.get_connect_info(socketId);
                    if (tag && tag.conInfo) {
                        var event = new fv.models.message_queue({ qname : 'queue.event' });
                        event.pushData(tag.conInfo.app_id, 'connected', { user : tag.conInfo, user_tag : gv.getTag(tag.conInfo) } );
                    }

                    break;

// Socket.io 버전 임.
// 				case 'ras-user-auth':
// 					// socket.handshake._user_.soc_id : 'connection' 에서 세팅되어 올라옴.
// 					// socket.handshake._user_.ssid
// 					// socket.handshake._user_.ctime
// 					socket.handshake._user_.user_name  = pdata.user_name;
// 					socket.handshake._user_.member_srl = pdata.member_srl;
// 					socket.handshake._user_.user_email = pdata.user_email;
// 					socket.handshake._user_.sex        = pdata.sex;
// 					socket.handshake._user_.photo      = pdata.photo;
// 					socket.handshake._user_.app_id	   = pdata.ras_app_id;	// ras 내에서는 app_id 로 통일됨.
// 					socket.handshake._user_.sec_key    = pdata.sec_key;
// 					socket.handshake._user_.noti_count = 0;					// TODO : deprecate, 2014/02/18
// 					socket.handshake._user_.noti_srl   = 0;					// TODO : deprecate, 2014/02/18
//
// 					// deprecated : admin, ip
// 					// CONSOLE, ADMIN 은 일단 IP로 막는다.
// 					if (socket.handshake._user_.app_id == 'console' || socket.handshake._user_.app_id == 'admin') {
// /* INFO : IP check 방식
// 						if (_.contains(gv.config.crm.admin_ips, socket.handshake._user_.ip) == false) {
// 							log.debug('@@DENY ADMIN. Access:' + socket.handshake._user_.ip);
// 							fv.protocol.send_packet(socket, 'ras-deny', fv.protocol.make_packet('ras-deny', {} ) );
// 							socket.disconnect(true);
// 							return;
// 						}
// */
// 						// TODO : sec-key check 추가 할 것. (DB상에서 조회)
//                         // deprecated : 2017.04.05, if (_.contains(gv.config.crm.admin_pws, pdata.sec_key) == false) {
// 						if (_.includes(gv.config.crm.admin_pws, pdata.sec_key) == false) {
// 							log.debug('@@DENY ADMIN. Access:' + socket.handshake._user_.ip);
// 							fv.protocol.send_packet(socket, 'ras-deny', fv.protocol.make_packet('ras-deny', {} ) );
// 							socket.disconnect(true);
// 							return;
// 						}
// 					}
//                     // 일반 접속의 경우 처리하는 경우가 없어 추가함. (2016.09.01)
//                     else {
//                         // TODO : sec-key check 추가 할 것. (DB상에서 조회)
//                         // 어드민과 나누어서 처리할 수 있을 것 같음 (2016.09.01)
//                         // deprecated : 2017.04.05, if (_.contains(gv.config.crm.admin_pws, pdata.sec_key) == false) {
// 						if (_.includes(gv.config.crm.admin_pws, pdata.sec_key) == false) {
//                             log.debug('@@DENY ADMIN. Access:' + socket.handshake._user_.ip);
//                             fv.protocol.send_packet(socket, 'ras-deny', fv.protocol.make_packet('ras-deny', {} ) );
//                             socket.disconnect(true);
//                             return;
//                         }
//                     }
//
//
//
// 					//
// 					//
// 					// INFO : 일단 답을 주고,
// 					protocol.send_reply(socket, 0, pdata._t, pdata._i);
//
// 					//################
// 					// TODO : sec_key 를 검증해야 한다.
// 					//  --> log.debug('@@@@sec_key=' + pdata.sec_key);
// 					// 검증 후에 접속을 정리하면 된다.  일단은 클라이언트 신용모드로 사용한다.
// 					//################
//
//
// 					// INFO : 접속 처리를 진행한다.
// 					//  -(TODO) :  set_user_info 에서 데이터 처리를 진행하므로, 그 결과로 send_reply 와 여러가지 인증처리를 진행하도록 한다.
//
// 					// TODO : 여기서 처리할지 es로 빼서 처리할 지는 별도로 결정하자.
// 					fv.sio_manager.set_user_info(socket, function(error, result) {
// 						log.debug(':->SOCKET::ras-user-auth:TAG=' + gv.getLogTag(socket));
//
// 						if (error) {
// 							// login 처리를 하지 않는다.
// 						}
// 						else {
// 							// login 처리를 한다.
// 						}
//
// 					});
// 					break;

				// INFO : Alive check 가 들어오면 접속 유지시간을 업데이트 한다.
				case 'ras-alive' :
					protocol.send_reply(socketId, 0, pdata._t, pdata._i);

                    var tag = fv.ws_manager.get_connect_info(socketId);
                    if (tag && tag.conInfo) {
                        log.debug(':->ras-alive:', gv.inspect(tag.conInfo));
                        var connection = new fv.models.connection();
                        connection.updateConnection(tag.conInfo);
                    }
					break;

				// INFO : 원하기에 바로 끊어 버린다.
				case 'ras-bye' :
                    var tag = fv.ws_manager.get_connect_info(socketId);
					log.debug(':->ras-bye:' + gv.inspect(pdata) + gv.getLogTag(tag.conInfo));
					tag.ws.close();
					break;

                // TODO : 2017.10.23, 아직 사용하지 않음
				// INFO : console command protocol 처리 (별도 함수 parse_console 참조)
				case 'ras-command' :
                    var tag = fv.ws_manager.get_connect_info(socketId);

                    log.debug(':->ras-command:' + gv.inspect(pdata) + gv.getLogTag(tag.conInfo));
					fv.protocol.parse_console(tag.conInfo, pdata);
					break;

				// INFO : app protocol 처리 (별도 함수 parse_app_protocol 참조)
				case 'ras-protocol-v1' :
                    var tag = fv.ws_manager.get_connect_info(socketId);
                    // TODO : 2017.10.22, tag 의 값은 현재 접속에서 계속 같이 사용되므로 그냥 사용할 수 있다.

					// TODO : app 에 허용된 protocol을 먼저 필터할 필요가 있다.
					//  -전체 프로토콜을 볼 필요는 없고, app_id 가 등록된 것인지 확인할 필요가 있다.
					//  -app_id 를 console 로 가지고 오면 곤란해진다.
					log.debug(':->ras-protocol-v1:' + gv.inspect(pdata) + gv.getLogTag(tag.conInfo));
					fv.protocol.parse_app_protocol(tag.conInfo, pdata);
					break;

				default:
                    var tag = fv.ws_manager.get_connect_info(socketId);
					log.warn('protocol.parse_packet:unknown type:[' + pdata._t + ']' + gv.getLogTag(tag.conInfo));
					break;
/*
	protocol.sync_room(socket, 'R' + socket.handshake._user_.mdn, pdata);
	protocol.send_reply(socket, pdata, 0, { b : ''} );
*/
			}
		},
		//
		// INFO : console 전용
		//
		// parse_console : function (socket , pdata) {
		// 	var cmd_line = pdata._cmd;
		// 	if (cmd_line == null) return;
        //
		// 	var token = cmd_line.split(/[+= ]/) 	// Delimiter is a regular expression
		// 	for (var i = 0; i < token.length; i++) {
		// 		log.debug('@console token-' + i + '=' + token[i]);
		// 	}
        //
		// 	switch (token[0].toLowerCase()) {
		// 		case 'help' :
		// 			log.debug('[M]->HELP:' + gv.inspect(pdata) + gv.getLogTag(socket));
        //
		// 			//child = exec('ls -alF', function(error, stdout, stderr) {
		// 			child = exec('ras-help', function(error, stdout, stderr) {
		// 				fv.protocol.send_reply(socket, 0, 'ras-help', pdata._i, { type : pdata.type, stdout : stdout, stderr : stderr, error : error });
		// 				if(error !== null) {
		// 				// TODO : error
		// 					console.log('exec error: '+ error);
		// 				}
		// 			});
		// 			break;
        //
		// 		case 'event' :
		// 			// token[1] == app_id, token[2] == event name, else == data
		// 			if (token[1] && token[2]) {
		// 				var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
		// 				event_fire.pushData(token[1], token[2], { data : pdata, user_tag : gv.getTag(socket) } );
		// 			}
		// 			else {
		// 				var omsg = {};
		// 				omsg._t = 'ras-monitor'; // 강제로 _t 를 ras-monitor로 수정한다.
		// 				omsg._i = 0;
		// 				omsg.ud = {};
		// 				omsg.ud.app_id = 'console';
		// 				omsg.ud.desc = "명령어 : event app_id event_name [params]";
        //
		// 				//fv.socket_io.sockets.in(fv.socket_io_room_admin).emit(fv.socket_io_type, omsg);
		// 				fv.socket_io.sockets.in('console').emit(fv.socket_io_type, omsg);
		// 			}
		// 			break;
        //
		// 		default :
		// 			var omsg = {};
		// 			omsg._t = 'ras-monitor'; // 강제로 _t 를 ras-monitor로 수정한다.
		// 			omsg._i = 0;
		// 			omsg.ud = {};
		// 			omsg.ud.app_id = 'console';
		// 			omsg.ud.desc = "실시간 Console 에서 지원되지 않는 명령어 입니다.";
        //
		// 			//fv.socket_io.sockets.in(fv.socket_io_room_admin).emit(fv.socket_io_type, omsg);
		// 			fv.socket_io.sockets.in('console').emit(fv.socket_io_type, omsg);
		// 			break;
		// 	}
		// },
        parse_console : function (conInfo , pdata) {
            var cmd_line = pdata._cmd;
            if (cmd_line == null) return;

            var token = cmd_line.split(/[+= ]/) 	// Delimiter is a regular expression
            for (var i = 0; i < token.length; i++) {
                log.debug('@console token-' + i + '=' + token[i]);
            }

            switch (token[0].toLowerCase()) {
                // TODO : 2017.10.23,
                case 'help' :
                    log.debug('[M]->HELP:' + gv.inspect(pdata) + gv.getLogTag(conInfo));

                    //child = exec('ls -alF', function(error, stdout, stderr) {
                    child = exec('ras-help', function(error, stdout, stderr) {
                        fv.protocol.send_reply(socket, 0, 'ras-help', pdata._i, { type : pdata.type, stdout : stdout, stderr : stderr, error : error });
                        if(error !== null) {
                            // TODO : error
                            console.log('exec error: '+ error);
                        }
                    });
                    break;

                case 'event' :
                    // token[1] == app_id, token[2] == event name, else == data
                    if (token[1] && token[2]) {
                        var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
                        event_fire.pushData(token[1], token[2], { mode : 'dev', data : pdata, user_tag : gv.getTag(conInfo) } );
                    }
                    else {
                        var omsg = {};
                        omsg._t = 'ras-monitor'; // 강제로 _t 를 ras-monitor로 수정한다.
                        omsg._i = 0;
                        omsg.ud = {};
                        omsg.ud.app_id = 'console';
                        omsg.ud.desc = "명령어 : event app_id event_name [params]";

                        //
                        // TODO : websocket 으로 바꿀것, fv.socket_io.sockets.in('console').emit(fv.socket_io_type, omsg);
                        //
						log.error('TODO: front-protocol:fv.socket_io.sockets.in(\'console\').emit(fv.socket_io_type, omsg)');
                    }
                    break;

                case 'file-manage' :
                    // token[1] == app_id, token[2] == event name, else == data
                    if (token[1] && token[2]) {
                        var event_type = token[2];
                        var base_path = "/home/ckpush/ras/ckpush-ras/service/site/node/";
                        //var file_name = 'ras-redis-test.js';
                        var file_name = pdata._ud.file_name;

                        if (event_type == 'load-file') {
                            fs.readFile(base_path + file_name, 'utf8', function(error, data) {
                                if (error) {
                                    fv.protocol.send_reply(conInfo.soc_id, 0, 'file-manage', pdata._i, {
                                        event : 'load-file',
                                        result : 'error'
                                    });
                                }
                                else {
                                    fv.protocol.send_reply(conInfo.soc_id, 0, 'file-manage', pdata._i, {
                                        event : 'load-file',
                                        // base_path : base_path,
                                        file_name : file_name,
                                        // full_file : base_path + file_name,
                                        result : 'loaded',
                                        content: data
                                    });
                                }
                            });
                        }
                        else if (event_type == 'save-file') {
                            // TODO : 2017.12.05, check _ud
                            var file_name = pdata._ud.file_name;
                            var content   = pdata._ud.content;

                            fs.writeFile(base_path + file_name, content, 'utf8', function(error, data) {
                                if (error) {
                                    fv.protocol.send_reply(conInfo.soc_id, 0, 'file-manage', pdata._i, {
                                        event : 'save-file',
                                        result: 'error'
                                    });
                                }
                                else {
                                    fv.protocol.send_reply(conInfo.soc_id, 0, 'file-manage', pdata._i, {
                                        event : 'save-file',
                                        // base_path : base_path,
                                        file_name : file_name,
                                        result : 'saved'
                                    });
                                }
                            });
                        }
                        else {
                            fv.protocol.send_reply(conInfo.soc_id, 0, 'file-manage', pdata._i, { result : 'unknown file-manage event type :' + event_type });
                        }
                    }
                    break;

                default :
                    var omsg = {};
                    omsg._t = 'ras-monitor'; // 강제로 _t 를 ras-monitor로 수정한다.
                    omsg._i = 0;
                    omsg.ud = {};
                    omsg.ud.app_id = 'console';
                    omsg.ud.desc = "실시간 Console 에서 지원되지 않는 명령어 입니다.";

                    //
                    // TODO : 2017.12.05, fv.socket_io.sockets.in('console').emit(fv.socket_io_type, omsg);
                    //
                    log.error('TODO: front-protocol:fv.socket_io.sockets.in(\'console\').emit(fv.socket_io_type, omsg)');

                    break;
            }
        },
		//
		// INFO : apps 전용
		//
		parse_app_protocol : function (conInfo , pdata) {
			var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
			// INFO : pdata.data 만 전송한다. _cmd, _i, _t는 제거된다.
			event_fire.pushData(conInfo.app_id, pdata._cmd, { data : pdata.data, user_tag : gv.getTag(conInfo) } );
		},


		/*
		 * _t, _i 추가
		 */
		make_packet : function(type, object, tid) {
			object._t = type;

			if (tid)
				object._i = object._i;							// INFO : 요청한 tid 를 사용한다.
			else
				object._i = 's_' + (new Date()).getTime();		// INFO : server의 경우 s_number 구조임.

			return object;
		},


		// for websocket
        send_packet : function (socketId, type, object) {
            var newTarget = fv.ws_manager.get_connect_info(socketId);
            if (newTarget != null) {
                // TODO : 2017.08.15, ASSERT
                try {
                    var packet = protocol.make_packet(type, object);

                    newTarget.ws.send(JSON.stringify(packet));
                    log.debug('[WS] SEND << ' + fv.ws_manager.getTag(socketId) + ', message:' + JSON.stringify(object));
                }
                catch (e) {
                    log.warn('[WS] ERROR SEND << message:' + fv.ws_manager.getTag(socketId), e);
                    // 15:57:23.237 - warn: [WS] ERROR SEND << message: Error: not opened
                    // TODO : 2017.08.16, close socket
                }

                return true;
            }
            else {
                log.warn('[WS] SEND << invalid socket id=' + socketId);
                return false;
            }
        },

        send_reply : function(socketId, r, t, i, opt) {
            var newTarget = fv.ws_manager.get_connect_info(socketId);
            if (newTarget != null) {

                var packet = protocol.make_packet('r-' + t, {});
                packet._i = i;
                packet._r = r;			// _r 을 추가한다.

                if (opt != null) {		// option key/value 를 추가한다.
                    for (var prop in opt) {
                        packet[prop] = opt[prop];
                    }

                }

                newTarget.ws.send(JSON.stringify(packet));
                log.debug('[WS] REPLY << ' + packet._t + gv.getLogTag(newTarget.conInfo));
            }
            else {
                log.warn('[WS] REPLY << invalid socket id=' + socketId);
                return false;
            }
        },
        sync_room : function (socketId, rid, packet) {
			log.debug('@@sync_room:socketId=' + socketId + ', rid=' + rid + ', packet=', packet);
            //
            // INFO : for socket
            if (socketId) {
                log.debug('(TODO) <-:SOCKET-id:sync_room(all):global');
                if (rid == 'global') {
                    // socket.broadcast.to(fv.socket_io_room_svc).emit(fv.socket_io_type, packet);					// 모든 접속으로 알린다.
                    //INFO : 메시지 브로드캐스트 로그
                    //log.debug('<-:SOCKET:sync_room:global');
                }
                else {
                    log.debug('(TODO) <-:SOCKET-id:sync_room():rid=' + rid);

                    // socket.broadcast.to(rid).emit(fv.socket_io_type, packet);									// 각 앱별
                    // if (rid != 'console') socket.broadcast.to('console').emit(fv.socket_io_type, packet);		// console 에는 같은 내용으로 똑같이 전송

                    //INFO : 메시지 브로드캐스트 로그
                    //log.debug('<-:SOCKET:sync_room:app_id=' + rid);
                }
            }
            //
            // INFO : for internal or http
            else {
                if (rid == 'global') {
                    log.debug('<-:SOCKET:sync_room(all):global:packet=', packet);

                    var socketManager = fv.ws_manager.get_socket_manager();
                    log.debug('##[socketManager key size]=' + _.keys(socketManager).length);     // 1

					var socketIds = _.keys(socketManager);
					for (var i = 0; i < socketIds.length; i++) {
                        socketId = socketIds[i];
                        protocol.send_packet(socketId, packet._t, packet);
                        //protocol.send_packet(socketId, 'global', JSON.stringify(packet));
                    }
                }
                else {
                    // TODO : 2017.10.23, 일단은 global 과 차이가 없다.
                    log.debug('(TODO) <-:SOCKET:sync_room():rid=' + rid);

                    var socketManager = fv.ws_manager.get_socket_manager();
                    log.debug('##[socketManager key size]=' + _.keys(socketManager).length);     // 1

                    var socketIds = _.keys(socketManager);
                    for (var i = 0; i < socketIds.length; i++) {
                        socketId = socketIds[i];
                        protocol.send_packet(socketId, packet._t, packet);
                        //protocol.send_packet(socketId, 'global', JSON.stringify(packet));
                    }
                }
            }
        },
        /*
         *
         */
		// send_packet : function(socket, type, object) {
		// 	if (!socket) {
		// 		log.debug('<-:SOCKET:send_packet:ignored:' + gv.getLogTag(socket));
		// 		return;
		// 	}
		//
		// 	var packet = protocol.make_packet(type, object);
		// 	socket.emit(fv.socket_io_type, packet);
		//
		// 	log.debug('<-:SCOKET:send:' + type + gv.getLogTag(socket));
		// 	//log.debug('<-:SEND:' + gv.inspect(packet));
		// },

		/*
		 * object 를 반환하지 않는다.
		 */
		// send_reply : function(socket, r, t, i, opt) {
		// 	if (!socket) {
		// 		log.debug('<-:SOCKET:send_reply:ignored:' + gv.getLogTag(socket));
		// 		return;
		// 	}
        //
		// 	var packet = protocol.make_packet('r-' + t, {});
		// 	packet._i = i;
		// 	packet._r = r;			// _r 을 추가한다.
        //
		// 	if (opt != null) {		// option key/value 를 추가한다.
		// 		for (var prop in opt) {
		// 			packet[prop] = opt[prop];
		// 		}
        //
		// 	}
        //
		// 	socket.emit(fv.socket_io_type, packet);
		// 	//log.debug('<-:SOCKET:reply:' + gv.inspect(packet) + gv.getLogTag(socket));
		// 	log.debug('<-:SOCKET:reply:' + packet._t + gv.getLogTag(socket));
		// },
		/*
		 *
		 */
		// sync_room : function (socket, rid, packet) {
		// 	//
		// 	// INFO : for socket
		// 	if (socket)	{
		// 		if (rid == 'global') {
		// 			socket.broadcast.to(fv.socket_io_room_svc).emit(fv.socket_io_type, packet);					// 모든 접속으로 알린다.
         //            //INFO : 메시지 브로드캐스트 로그
		// 			//log.debug('<-:SOCKET:sync_room:global');
		// 		}
		// 		else {
        //
		// 			socket.broadcast.to(rid).emit(fv.socket_io_type, packet);									// 각 앱별
		// 			if (rid != 'console') socket.broadcast.to('console').emit(fv.socket_io_type, packet);		// console 에는 같은 내용으로 똑같이 전송
        //
         //            //INFO : 메시지 브로드캐스트 로그
		// 			//log.debug('<-:SOCKET:sync_room:app_id=' + rid);
		// 		}
		// 	}
		// 	//
		// 	// INFO : for internal or http
		// 	else {
		// 		if (rid == 'global') {
		// 			fv.socket_io.sockets.in(fv.socket_io_room_svc).emit(fv.socket_io_type, packet);								// 각 앱별 전송
         //            //INFO : 메시지 브로드캐스트 로그
         //            //log.debug('<-:SOCKET:sync_room(all):global');
		// 		}
		// 		else {
		// 			fv.socket_io.sockets.in(rid).emit(fv.socket_io_type, packet);								// 각 앱별 전송
		// 			if (rid != 'console') fv.socket_io.sockets.in('console').emit(fv.socket_io_type, packet);	// console 에는 같은 내용으로 똑같이 전송
        //
         //            //INFO : 메시지 브로드캐스트 로그
         //            //log.debug('<-:SOCKET:sync_room(all):app_id=' + rid);
		// 		}
		// 	}
        //
		// },
	}

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return protocol;
}
