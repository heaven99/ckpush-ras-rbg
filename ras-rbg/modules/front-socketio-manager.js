/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-socketio-manager.js
 * @version : 3.0.0
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
	//////////////////////////////////////////////////////////////////////
	var sio_manager = {
		// deprecated : 2014.01.02 (이거 쓰지 마라...)
		clients : 0,		// 총 접속 Client 의 수
		
		//
		//
		set_user_info : function (socket, next_function) {
			// TODO : sec_key 를 검증해야 한다. 
			//  --> log.debug('@@@@sec_key=' + pdata.sec_key);
			socket.handshake._user_.ssid = 'authorized';		// INFO: authorized 유저로 분류한다. 
			gv.setTag(socket);
			
			// INFO : 단순 접속에서 인증키로 바꿔야 한다.
			var connection = new fv.models.connection();
			connection.setAuthConnection(socket);
			
			var event = new fv.models.message_queue({ qname : 'queue.event' });
            // deprecated : 2016.08.15 : event.pushData(socket.handshake._user_.app_id, 'connected', { user_tag : gv.getTag(socket) } );
            // Info : hello 시의 추가 정보도 전달한다. (user_tag 는 하위 호환을 위해서 사용함)
            event.pushData(socket.handshake._user_.app_id, 'connected', { user : socket.handshake._user_, user_tag : gv.getTag(socket) } );

			// DEPRECATED : 2014.07.07
			// TODO : check app_id
			//socket.join(fv.socket_io_room_svc);			// 
			//if (socket.handshake._user_.app_id == 'admin' || socket.handshake._user_.app_id == 'console') socket.join(fv.socket_io_room_admin);			// admin only
			
			// INFO : app_id 별 room 으로 격리시키고, 통합 room 에는 모두 모은다. (2014/07/07)
			if (socket.handshake._user_.app_id) {
				socket.join(fv.socket_io_room_svc);				// INFO : all apps for broadcast (확장용)
				socket.join(socket.handshake._user_.app_id);	// INFO : 각 앱별 room
				
			}
			
			next_function(null, {});
		},
		

		//
		//		
		unset_user_info : function (socket, ssid) {
			// TODO : check lap time
			
			if (ssid == 'authorized' || ssid == 'dup') {
				// deprecated : 2014.07.07
				//socket.leave(fv.socket_io_room_svc);	// 
				//if (socket.handshake._user_.app_id == 'admin' || socket.handshake._user_.app_id == 'console') socket.leave(fv.socket_io_room_admin);		// admin only
				
				// INFO : app_id 별 room 에서 탈퇴 시키다. 
				if (socket.handshake._user_.app_id) {
					socket.leave(fv.socket_io_room_svc);	
					socket.leave(socket.handshake._user_.app_id);
				}

				var connection = new fv.models.connection();
				connection.setDisconnection(socket);
				
				var event = new fv.models.message_queue({ qname : 'queue.event' });
                // deprecated : 2016.08.15 : event.pushData(socket.handshake._user_.app_id, 'disconnected', { user_tag : gv.getTag(socket) } );
                // Info : hello 시의 추가 정보도 전달한다. (user_tag 는 하위 호환을 위해서 사용함)
                event.pushData(socket.handshake._user_.app_id, 'disconnected', { user : socket.handshake._user_, user_tag : gv.getTag(socket) } );
			}
			// INFO : 접속은 했으나, 초기 인증을 하지 않은 접속을 의미한다.
			// -서버상에서 소켓접속은 잘랐으나 redis 상에는 접속이 남아 expire 를 기다리게 되어 바로 삭제한다.
			else if (ssid == 'unknown') {
				log.info('unset_user_info:ssid unknown:' + gv.getLogTag(socket));

				var connection = new fv.models.connection();
				connection.setDisconnection(socket);
			}
			// INFO : 이런 경우는 나오면 안된다. 
			else {
				log.error('unset_user_info:ssid undefined:' + gv.getLogTag(socket));
			}
			
		},
		
		
		/*
		 * INFO : 이거슨 실제 지원하는 함수는 아니므로, 버전에 따라 주의가 필요하다.
		 * INFO : 이 함수는 handshake._uid_ 를 사용하고 있는데, 확실히 연결이 보증된 부분에서만 사용해야 한다.
		 */
		get_rooms_count : function(socket, room_name) {
			// console.log('clients-->' + util.inspect(socket.sio_manager.roomClients));
		
			var room = socket.sio_manager.rooms['/' + room_name];
			
			//console.log('----> room : ' + util.inspect(room));
			//console.log('----> rooms : ' + util.inspect(socket.sio_manager.rooms));
			if (room) return room.length;
			
			return 0;
		},

		
		// INFO : member_srl 로 접속자의 socket 을 구한다. 
		// TODO :  --> 이 부분이 현재로서 가장 문제다. --> fv.socket_io.sockets.sockets[dup_socket.soc_id].disconnect() 이 부분을 참고할 것. 
		// deprecated
		get_socket_info : function (_srl) {
			var member_srl = 'N' + _srl;
			
			if (sio_manager.client_info[member_srl]) return sio_manager.client_info[member_srl].socket;
			
			return null;
		},
		
	}
	
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return sio_manager;
}

