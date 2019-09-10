/**
 * ckpush-ras
 *
 * Copyright(C) 2015-2017 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-push.js
 * @version : 4.0.0
 * @notes
 *  -전체적으로 범용형태로 만들어야 함.
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	//var util = require('util');

	// global variable for this file (scope : in file)
	var log = gv.config.log;


	//////////////////////////////////////////////////////////////////////
	// 많은 부분을 deprecated 시켜야 함....
	// 사용중 --> message_to_node, notify_hint_to_node
	//////////////////////////////////////////////////////////////////////
	var push = {
		// INFO : 그냥 메시지를 알린다. (message_type 은 ras 에서 사용하는 message_type 과는 다르다.
		//  -for CLIENT 용 메시지로 봐야 한다.
		//  -내부는 redis channel/queue message, 외부는 Socket.IO message로 서로 패킷형태가 다르므로, 같은 이름이면 혼돈이 발생한다.
		message_to_node : function (socketId, message_type, push_object) {
			// if (!socket) {
			// 	log.warn('-WARNING message_to_node:invalid socket');
			// 	return;
			// }
			//var member_srl = socket.handshake._user_.member_srl;

			fv.protocol.send_packet(socketId, message_type, push_object );
		},

		// INFO : 알림 갯수를 구해서 알린다. (v0.6.4)
		notify_hint_to_node : function (socket) {
			if (!socket) {
				log.warn('-WARNING notify_hint_node:invalid socket');
				return;
			}

			var member_srl = socket.handshake._user_.member_srl;

			//member_srl = "\"" + member_srl + "\"";		// 문자열 아니다.
			var sql = 'SELECT count(*) as cnt FROM fspx_fsp_notification '
			        + ' WHERE member_srl = ' + member_srl + ' AND active="Y"';
			log.debug('-notify_hint_node:sql=' + sql + gv.getLogTag(socket));

			fv.mysql_client.query(sql,
				function(error, results) {
					if (error) {
						log.debug('ERROR : ' + error);

						return;
					}

					log.debug('-notify_hint_node:notify count=' + results[0].cnt + gv.getLogTag(socket));

					// 해당 유저에게 count 를 알린다.
					fv.protocol.send_packet(socket, 'NOTIFY_HINT', { count : results[0].cnt } );
				}
			);
		},

		select_notify_list : function (socket, pdata) {
			if (!socket) {
				log.warn('-WARNING select_notify_list:invalid socket');
				return;
			}

			var noti_srl   = pdata.key;
			var member_srl = socket.handshake._user_.member_srl;

			//member_srl = "\"" + member_srl + "\"";
			// TODO : 몇개를 보낼지 결정이 필요한다. (최종 한개만 보낸다.)
			var sql = 'SELECT noti_srl, type, icon, label, link, regdate FROM fspx_fsp_notification '
			        + ' WHERE member_srl = ? AND active = "Y" AND noti_srl < ? '
			        + ' ORDER BY noti_srl DESC LIMIT 20';
			log.debug('-select_notify_list:push:sql=' + sql);

			fv.mysql_client.query(sql, [member_srl, noti_srl], function(error, results) {
				if (error) {
					log.error('select_notify_list:ERROR : ' + error);

					return;
				}

				// INFO : ALARM 을 전송한다.
				log.debug('-select_notify_list:push:count=' + results.length);
				//log.debug('-select_notify_list:push:count=' + results.length + ':data=' + gv.inspect(results));

				var packet = {
					count : results.length,				// 숫자 표시는 카운트로
					data : results						// 내용 추가는 내용으로
				}

				// reply 처리한다.
				fv.protocol.send_reply(socket, 0, 'NOTIFY_LIST', pdata._i, packet );		// pdata._i를 사용해야하나, 그냥 0 처리한다.
			});
		},

		remove_notify_list : function (socket, pdata) {
			if (pdata.key == 'CHECK ALL') {
				var sql = 'UPDATE fspx_fsp_notification SET active = "N"'
				        + ' WHERE member_srl = ?';

				log.debug(':->NOTIFY_REMOVE (ALL) :sql=' + sql + gv.getLogTag(socket));
				fv.mysql_client.query(sql, [socket.handshake._user_.member_srl], function(err, result) {
					if (err) {
						// 성공이면 0, else -100 (단순히 callback 처리용이다.)
						fv.protocol.send_reply(socket, -100, 'NOTIFY_REMOVE', pdata._i, { count : 0, noti_srl : -1 });
					}
					else {
						fv.protocol.send_reply(socket, 0, 'NOTIFY_REMOVE', pdata._i, { count : 0, noti_srl : -1 });
					}
				});
			}
			else {
			// key == 'CHECK ONE', v1 == noti_srl, v2 == noti count
				var remove_noti_srl = pdata.v1;

				var sql = 'UPDATE fspx_fsp_notification SET active = "N"'
				        + ' WHERE noti_srl = ?';

				log.debug(':->NOTIFY_REMOVE (ONE) :sql=' + sql + gv.getLogTag(socket));
				fv.mysql_client.query(sql, [remove_noti_srl], function(err, result) {
					if (err) {
						// 성공이면 0, else -100 (단순히 callback 처리용이다.)
						fv.protocol.send_reply(socket, -100, 'NOTIFY_REMOVE', pdata._i, { count : pdata.v2, noti_srl : remove_noti_srl });
					}
					else {
						fv.protocol.send_reply(socket, 0, 'NOTIFY_REMOVE', pdata._i, { count : (pdata.v2 - 1), noti_srl : remove_noti_srl });
					}
				});
			}
		},
//////////////////////////////////////////////////////////////////////
//////// TODO : deprecate : 하기 함수는 삭제하도록 한다. (2014/02/18)
//////////////////////////////////////////////////////////////////////





		//
		// INFO : PUSH hint
		//  -.외부에서 악용하는 경우를 막아야 한다.
		//    -.내부 장비간 연동에 대한 인증 방식이 필요해진다.
		//    -.or internal port 를 별도로 유지한다.
		//  -.별도의 push server 로 운용할 수 있도록 해야 한다.
		notify_hint : function (req, res) {
			// INFO : 추후에는 REDIS channel 에서 온다고 가정해야 한다.

			log.debug(':->(DEPRECATED) HTTP PUSH hint received:' + gv.inspect(req.query) );
			//	{"p":"ALARM","member_srl":"111"}

			res.send({ _r : 0, _desc : 'SUCCESS' });

			if (req.query.p == 'ALARM') {
				log.debug('-(TODO move to redis channel) PUSH HINT:notify_hint:member_srl=' + req.query.member_srl);

				// TODO : push manager 로 날린다고 생각하면 된다.
				// TODO : php 에서도 앞으로 이렇게 수정하도록 한다.

				// deprecated : 2014.01.13 - 뒤에서 날라오는 hint 를 어떻게 처리할 것인가에 대한 문제처리.
				//fv.redis_pub_ch.publish('ch_notify_member', gv.inspect({ 'type' : 'private_alarm', 'member_srl' : req.query.member_srl }) );
			}
			else {

			}
		},

		notify_member_redis : function (rdata) {
			var node_host = gv.config.crm.httpd_port;
			fv.redis_client.send_command('hmget', ['huser.' + rdata.member_srl, 'node', 'soc_id', 'gcm_rid'], function (error, result) {
				//result:["10000","dQe72Zkx7amoBNwv552I","APA91bGoJuwAhjkEyX9LVLdu2Rknlmmvupw8ttitbGlfbGP82_J-kW6ZFC40kOBAsqtMovCG0xkhcDXaKivvIDGK2YRwKpZ3DodNxWtlI-jtS9y3aGVjAyPSWeS3dUdvRyCFqHOuFhSb"]
				//result:[null,"dyi0ELvudqkslxVj6H9e","APA91bGoJuwAhjkEyX9LVLdu2Rknlmmvupw8ttitbGlfbGP82_J-kW6ZFC40kOBAsqtMovCG0xkhcDXaKivvIDGK2YRwKpZ3DodNxWtlI-jtS9y3aGVjAyPSWeS3dUdvRyCFqHOuFhSb"]
				if (error) log.error('ERROR notify_member_redis:send_command:hmget:' + gv.inspect(result));

				if (result) {
					if (result[1]) {
						// 현재의 node 에 접속되어 있으므로, socket_io 으로 보낸다.
						log.info('-notify_member_redis:PUSH to node:member_srl=' + rdata.member_srl);
						var user_socket = fv.socket_io.sockets.sockets[result[1]];
						push.check_node_notify_db(user_socket);
					}
					else if (result[2]) {
						log.info('-notify_member_redis:PUSH to google gcm:member_srl=' + rdata.member_srl + ' gcm_rid=' + result[2]);
						push.check_gcm_notify_db( { gcm_rid : result[2], member_srl : rdata.member_srl });
					}
					else {
						log.warn('-notify_member_redis:PUSH SKIP, unknown member_srl=' + rdata.member_srl);
					}
				}
				else {
					log.error('-notify_member_redis:ERROR:send_command:hmget:NO DATA received');
				}
			});
		},

		check_gcm_notify_db : function (user_info) {
			if (!user_info || user_info.gcm_rid == '') {
				log.warn('check_gcm_notify_db:not registered gcm user. pass');
				return;
			}

			var member_srl = parseInt(user_info.member_srl);		// 명시적 숫자로 바꾼다.

			//member_srl = "\"" + member_srl + "\"";
			// TODO : 몇개를 보낼지 결정이 필요한다. (최종 한개만 보낸다.)
			var sql = 'SELECT noti_srl, type, icon, label, link, regdate FROM fspx_fsp_notification '
			        + ' WHERE member_srl = ' + member_srl + ' AND active="Y"'
			        + ' ORDER BY noti_srl DESC LIMIT 1';
			log.debug('-check_gcm_notify_db:push:sql=' + sql);

			fv.mysql_client.query(sql,
				function(error, results) {
					if (error) {
						log.error('check_gcm_notify_db:ERROR : ' + error);

						return;
					}

					// INFO : ALARM 을 전송한다.
					log.debug('-check_gcm_notify_db:push:notify count=' + results.length + ':data=' + gv.inspect(results));

					var packet = {
						count : results.length,				// 숫자 표시는 카운트로
						data : results											// 내용 추가는 내용으로
					}

					//
					//log.debug('-push:notify data=' + util.inspect(packet));

					// INFO : 이 부분의 테스트는 지속적으로 필요하다.
					//  -한번에 1000개의 메시지는 보내지 말라는 이야기가 있다. 가능하면 GCM 을 자주 사용하는 구조는 피해야 할 듯 하다.
					var message = new gcm.Message({
						collapseKey:'collapseKey',
						delayWhileIdle : false,			// indicates that the message should not be sent immediately if the device is idle
						timeToLive : 86400,				// default time-to-live is 4 weeks
						data : {
							key1: 'PUSH_ALARM',
							key2: packet.data[0]
						}
					});


					var registrationIds = [];
					registrationIds.push(user_info.gcm_rid);

					fv.gcm_sender.send(message, registrationIds, 2,
						function(error, result) {
							log.info('-check_gcm_notify_db:gcm_send result=' + gv.inspect(result));
						}
					);
				}
			);
		},

		// INFO : 최종 notify srl 을 보관해 뒀다가, 그 이상만 노티를 한다.
		//  -
		check_node_notify_db : function (socket) {
			if (!socket) {
				log.warn('-WARNING check_node_notify_db:invalid socket');
				return;
			}

			var member_srl = socket.handshake._user_.member_srl;

			//member_srl = "\"" + member_srl + "\"";		// 문자열 아니다.
			var sql = 'SELECT noti_srl, type, icon, label, link, regdate FROM fspx_fsp_notification '
			        + ' WHERE member_srl = ' + member_srl + ' AND active="Y"'
			        + '   AND noti_srl > ' + socket.handshake._user_.noti_srl
			        + ' ORDER BY noti_srl';
			log.debug('-check_node_notify_db:sql=' + sql + gv.getLogTag(socket));

			fv.mysql_client.query(sql,
				function(error, results) {
					if (error) {
						log.debug('ERROR : ' + error);

						return;
					}

					log.debug('-check_node_notify_db:notify count=' + results.length + gv.getLogTag(socket));
					var last_noti_srl = 0;
					for (var i = 0; i < results.length; i++) {
						if (i == 0) last_noti_srl = results[i].noti_srl;		// desc 이므로 0 번이 최대번호 임.
					}

					//log.debug('--> last_noti_srl=' + last_noti_srl);
					socket.handshake._user_.noti_srl    = last_noti_srl;
					socket.handshake._user_.noti_count += results.length;

					var packet = {
						count : socket.handshake._user_.noti_count,				// 숫자 표시는 카운트로
						data : results											// 내용 추가는 내용으로
					}

					fv.protocol.send_packet(socket, 'ALARM_PUSH', packet);
				}
			);
		}


	}

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return push;
}

