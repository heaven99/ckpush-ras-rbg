/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-socketio-handler.js
 * @version : 3.0.0
 * @notes
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


	/*
	 * INFO : socket.io auth.
	 *   TODO : 인증시에 WEB, Android 류를 구분할 수 있도록하자.
	 *
	 * 별다른 검증없이 accept 처리한다. 
	 */ 
	fv.socket_io.set('authorization', function (data, accept) {
	
/* L4 or Proxy
		log.debug(':->SOCKET:authorization:-----<>-----' + gv.inspect( { "IP" :  data.headers['x-forwarded-for'], "UA" : data.headers['user-agent'], "Cookie" : data.headers.cookie} ));
		//log.debug(':->SOCKET::--> ' + gv.inspect(data.headers));
		data._user_ = {};						// INFO : ._user_ 오브젝트 생성
		data._user_.ip = data.headers['x-forwarded-for'];	// .ip 를 붙인다. (for L4 or Proxy)
*/

// Single HOST
		log.info(':->SOCKET:authorization:-----| |-----' + gv.inspect( { "IP" :  data.address.address, "UA" : data.headers['user-agent'], "Cookie" : data.headers.cookie} ));
		//log.debug(':->SOCKET::--> ' + gv.inspect(data.headers));
		data._user_ = {};						// INFO : ._user_ 오브젝트 생성
		data._user_.ip = data.address.address;			// .ip 를 붙인다. 
		
		// log.debug(':->SOCKET::SUCCESS authorization:-----<>-----:' + gv.inspect(data._user_));
		// 무조건 성공하기 때문에 별다른 처리를 하지 않는다. 
		accept(null, true);
	});
	

	/*
	 * INFO : socket.io connection/data.
	 */
	fv.socket_io.sockets.on('connection', function (socket) {
		socket.handshake._user_.soc_id 		= socket.id;			// INFO : Socket.IO ID를 bind 해둔다. (s1 에서 조사를 했는데, 정확한 건 다시 파악 해야것다.) 
		socket.handshake._user_.ssid   		= 'unknown';			// INFO : 검증되지 않은, 모르는 유저. (unknown, authorized, dup)
		socket.handshake._user_.app_id  	= 'unknown';			// INFO : 검증되지 않은, 모르는 app_id.
		socket.handshake._user_.member_srl  = 'unauthorized';		// INFO : 검증되지 않은, 모르는 member_srl.  (2014.03.19 추가 - 원래 의도는 ssid 로 사용하려고 한것 같은데...)
		socket.handshake._user_.sec_key		= '';					// INFO : 서비스 인증용 key
		socket.handshake._user_.ctime  		= gv.getUnixTime();	// INFO : 접속 시간.  TODO : 접속시간으로 unknown 형태를 제거한다. 
		gv.setTag(socket);
		
		log.info(':->SOCKET::connection:-----<>-----' + gv.inspect( { "_user_" : socket.handshake._user_ }) );
		
		var node_host = gv.config.crm.httpd_port;
		// TODO: event fire
		//fv.redis_pub_ch.publish('ckpush-connection', gv.inspect({ '_t' : 'try', 'user_tag' : gv.getTag(socket) }));

	    socket.emit(fv.socket_io_type, fv.protocol.make_packet('ras-hello', { user : socket.handshake._user_ }) );

		// 접속 info 처리
		fv.datas.front_info.setCount(fv.socket_io.sockets.clients().length, 1);			// 상태와 1추가	
		log.debug('+SOCKET:TOTAL Client : ' + fv.socket_io.sockets.clients().length );
		
		// TODO : 접속은 했는데, SET_NAME--> 을 전송하지 않는 상태가 발생할 수 있는데, 이것은 별도의 관리로직으로 처리해야한다. (접속 포트만 잡고 있는 상태가 된다.)
		//  아직 실질적인 접속을 한 상태도 아니기 때문에 이걸 전체 관리 DB로 올릴 이유도 없어 보인다. (자체 해결할 것) 
		//  unknown 상태가 일정시간 이상 지나면 그냥 끊어 버리자.  (_.ctime) 참고 
		var Connection = new fv.models.connection();
		Connection.setConnection(socket);

		//////////////////////////////////////////////////////////////////
		// INFO : 실제 데이터를 처리한다. (sdata : object or json)
		socket.on(fv.socket_io_type, function (sdata) {
			var pdata = gv.parse_socket_io(sdata);
			
			//log.debug(':->SOCKET:' + fv.socket_io_type + ':' + gv.inspect(pdata));
			log.debug(':->SOCKET::pdata:' + gv.inspect(pdata) + gv.getLogTag(socket));
			
			// TODO : pdata (sdata 의 파싱결과) 에 대한 ASSERT 가 필요하다.
			fv.protocol.parse_packet(socket, pdata);
		});
		
		
		//////////////////////////////////////////////////////////////////
		// disconnect 
		//
		socket.on('disconnect', function () {
			log.info(':-:SOCKET: disconnected. -----/  /----- : ' + gv.inspect({ "_user_" : socket.handshake._user_}) );
						
			// INFO : 서버의 관리 범위에서 벗어난 socket 은 manger 가 별도로 관리하지 않는다. 
			//  -socket.handshake._user_.ssid : [unknown, dup, authorized]
			//			
			//fv.sio_manager.leave_room(socket, socket.handshake._user_.ssid);
			fv.sio_manager.unset_user_info(socket, socket.handshake._user_.ssid);

			fv.datas.front_info.setCount(fv.socket_io.sockets.clients().length -1, 0);		// 상태와 증가는 0
			log.debug('-SOCKET:TOTAL Client : ' + (fv.socket_io.sockets.clients().length -1));
		});
		
		//////////////////////////////////////////////////////////////////
		// TODO : 검증안됨. error 
		//
		socket.on('error', function () {
			// TODO : socket.io 가 사용하는 key
		    log.error(':-:SOCKET: ON_ERROR: uid : ' + socket.uid);
	//	    monitor({ "uid" : socket.uid, "type" : "disconnect", "data" : ""});
		});
		
		//////////////////////////////////////////////////////////////////
		// TODO : 검증안됨. connect 
		//
		socket.on('connect', function () {
			// TODO : socket.io 가 사용하는 key
		    log.warn('(TODO):->SOCKET: ON_CONNECT : uid :' + socket.uid);
	//	    monitor({ "uid" : socket.uid, "type" : "connect", "data" : ""});
		});

	});


	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

