/**
 *
 */


/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
    var request = require('request');

	// global variable for this file (scope : in file)
	var log = gv.config.log;

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

    fv.websocket.on('connection', function connection(ws, req) {
        var socketId = req.headers['sec-websocket-key'];
        //log.debug('[WS] websocket id=%s', socketId);
        //log.debug('[WS] websocket headers=', req.headers);
        //log.debug('[WS] req.connection=',req.connection);

        // IP 앞에 이상한게 붙는다. 0|front-1  | 20:42:06.298 - debug: [WS] client IP=::ffff:192.168.0.1
        // req.headers.origin=http://msa.ckpush.com:5001
        // req.headers.host=msa.ckpush.com:5001,
        // const ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
        // log.debug('[WS] client IP=%s',req.connection.remoteAddress);

        let isAuth = true;              // INFO : 2017.10.22, 무조건 성공으로 둔다.

        // TODO : 2017.10.22, front-websockets-manager.set_connect_info 동일해야 함
        let conInfo = {
            // TODO : 2017.10.22, fix
            app_id : 'console',
            ssid : '_ssid_',
            ip : '_ip_',
            member_srl : '_user_uuid_',      // 임시 처리
            /////
            /////
            sec_key		: '',		            // INFO : 서비스 인증용 key
            ctime  		: gv.getUnixTime(),	// INFO : 접속 시간.  TODO : 접속시간으로 unknown 형태를 제거한다.
            /////
            /////
            channelType : 'console',        // use as app_id
            userInfo : socketId,     // websockets
            soc_id   : socketId,
        };

        // let conInfo = {
        //     soc_id 		: socketId,	    		// INFO : Socket.IO ID를 bind 해둔다. (s1 에서 조사를 했는데, 정확한 건 다시 파악 해야것다.)
        //     ssid   		: 'unknown',			// INFO : 검증되지 않은, 모르는 유저. (unknown, authorized, dup)
        //     app_id  	: 'console',			// TODO : 검증되지 않은, 모르는 app_id.
        //     member_srl  : '_USER_UUID_',		// INFO : 검증되지 않은, 모르는 member_srl.  (2014.03.19 추가 - 원래 의도는 ssid 로 사용하려고 한것 같은데...)
        //     sec_key		: '',		            // INFO : 서비스 인증용 key
        //     ctime  		: gv.getUnixTime(),	// INFO : 접속 시간.  TODO : 접속시간으로 unknown 형태를 제거한다.
        // };
        //gv.setTag(conInfo);
        fv.ws_manager.set_connect_info(conInfo.member_srl, socketId, ws);
        fv.protocol.send_packet(socketId, 'ras-hello', fv.protocol.make_packet('ras-hello', { user : conInfo }));

        // 접속 info 처리
        fv.datas.front_info.setCount(fv.ws_manager.get_socket_count(), 1);			// 상태와 1추가
        log.debug('+SOCKET:connection:TOTAL Client : ' + fv.ws_manager.get_socket_count() );


        // TODO : 2017.08.29, 일정시간(5초) 내에 답이 없으면 자른다.
        // -- 비 인증용의 별도의 세션관리자를 사용할 것인지 검토할 것.
        ws.on('message', function incoming(message) {
            log.debug('[WS] message', message);

            if (!isAuth) {
                log.debug('[WS] RECV >> socketId=%s, not authorized, yet', socketId);
                let pdata = JSON.parse(message);
                if (!pdata) {
                    ws.close();
                    log.info('[WS] unknown message, socketId=%s closed', socketId);
                    return;
                }
            }
            // INFO : 2017.08.29, authorized message
            else {
                log.debug('[WS] RECV >> %s::%s', fv.ws_manager.getTag(socketId), message);

                let pMessage = JSON.parse(message);
                fv.protocol.parse_packet(socketId, pMessage);
            }
        });


        // TODO : 2017.08.18, socket close implementation
        ws.on('close', function incoming() {
            log.debug('[WS] CLOSE');

            if (isAuth) {
                log.debug('[WS] CLOSE >> %s', fv.ws_manager.getTag(socketId));
                fv.ws_manager.unset_connect_info(socketId, false);

                // 이미 unset_connect_info 에서 숫자가 정리되었다.
                //fv.datas.front_info.setCount(fv.ws_manager.get_socket_count(), 0);
                log.debug('-SOCKET:close:TOTAL Client : ' + (fv.ws_manager.get_socket_count()));
            }
            else {
                log.debug('[WS] CLOSE >> not authorized socketId=%s', socketId);
            }
        });

    });



    //

    fv.websocket.on("headers", function(headers) {
        // headers["set-cookie"] = "SESSIONID=" + crypto.randomBytes(20).toString("hex");
        log.debug("[WS:headers] handshake header", headers);
    });


    fv.websocket.on("listening", function() {
        log.debug("[WS:listening] ");
    });

    fv.websocket.on("error", function(error) {
        log.debug("[WS:error] ", error);
    });

    //////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

