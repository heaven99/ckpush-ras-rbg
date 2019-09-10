/**
 *
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
    var _ = require('lodash');
	//var util = require('util');

	// global variable for this file (scope : in file)
	var log = gv.config.log;

    // TODO : 2017.08.14, socket id & user mapping manager
    var socketManager = [];

    var sessionManager = [];

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	//
	var ws_manager = {
	    get_socket_manager : function() {
	        return socketManager;
        },

		get_connect_info : function(socketId) {
			// ws, conInfo
			return socketManager[socketId];
		},

        get_socket_count : function() {
            return _.keys(socketManager).length;
        },

        getTag : function(socketId) {
            var tag = fv.ws_manager.get_connect_info(socketId);
            if (tag && tag.conInfo) {
            	return '[WS:UUID:' + tag.conInfo.userInfo + ', socket:' + tag.conInfo.soc_id + ', channel:' + tag.conInfo.channelType + ']';
			}
			else {
                return '[WS:UUID:UNKNOWN, socket:' + socketId + ']'
            }
		},


		//
		//
		set_connect_info : function(userAuth, socketId, ws) {
            // 			socket.handshake._user_.tag = { "app_id" : socket.handshake._user_.app_id,
            // "ssid" : socket.handshake._user_.ssid, "ip" : socket.handshake._user_.ip, "soc_id" : socket.handshake._user_.soc_id };

            // TODO : 2017.12.05, 아래 conInfo 를 외부에서 쉽게 볼 수 있도록 해야 한다.
            let conInfo = {
                // TODO : 2017.10.22, fix
                app_id : 'console',
                ssid : '_ssid_',
                ip : '_ip_',
                member_srl : '_user_uuid_',      // 임시 처리
                /////
                /////
                channelType : 'console',        // 임시 처리, use as app_id
                userInfo : userAuth,     // websockets
                soc_id   : socketId,
            };

            // set tag
            log.debug('@@before :socketId=' + socketId);
            log.debug('@@before :gv.setTag(conInfo)', conInfo);
            gv.setTag(conInfo);

            log.debug('@@set_connect_info:', conInfo);
            var Connection = new fv.models.connection();
            Connection.setConnection(conInfo);

            // TODO : 2017.08.14, authorized key 를 management 에 추가할 것. (이러한 형태에서 문제가 되는것 확인할 것)
            socketManager[socketId] = {};
            socketManager[socketId].ws = ws;
            socketManager[socketId].conInfo = conInfo;

            log.debug('@@[WS:socketManager key size]=' + _.keys(socketManager).length);     // 1
        },

        // INFO : 2017.12.26, closeEvent 파라메터를 사용하는 곳이 없어 closeByExpire 로 바꾼다.
        // unset_connect_info : function (socketId, closeEvent) {
        unset_connect_info : function (socketId, closeByRedis) {
		    var connectInfo = fv.ws_manager.get_connect_info(socketId);
            if (connectInfo && connectInfo.conInfo) {
                //log.debug('TODO unset_connect_info:leave joined_session:' + fv.ws_manager.getTag(socketId) + '::' + JSON.stringify(connectInfo.joined_session));

                // INFO : 2017.08.20, leave joined channels
                var connection = new fv.models.connection();
                if (connectInfo.joined_session) {
                    // INFO : 2017.08.20, leave session
                    log.debug('unset_connect_info:leave joined_session:' + fv.ws_manager.getTag(socketId) + '::' + connectInfo.joined_session);

                    if (fv.ws_manager.leave_session(connectInfo.joined_session, socketId)) {
                        /// INFO : 2017.08.20, redis unsubscribe
                        connection.leave_session(connectInfo.joined_session);
                    }

                    connectInfo.joined_session = '';
                }

                // INFO : 2017.12.26, if (connectInfo.closeByExpire) {
                // INFO : 2017.12.26, Redis 에서 명령어로 처리했을 경우에 발생한다.
                if (closeByRedis) {
                    log.warn('unset_connect_info:by redis:socket closed:, client unknown status:' + fv.ws_manager.getTag(socketId));
                }
                else {
                    connection.setDisconnection(connectInfo.conInfo);
                }

                // INFO : 2017.12.26, null 을 대입하면 필드는 남아있기 때문에 제거를 한다.
                //log.debug("CLOSE:before count=" + fv.ws_manager.get_socket_count());
                delete socketManager[socketId];
                //socketManager[socketId] = null;
                //log.debug("CLOSE:after count=" + fv.ws_manager.get_socket_count());
            }
            // unknown socketId (이런경우 발생하면 안되나 Redis 에 저장된 값이 왔다면 가능하다.)
            else {
                if (closeByRedis) {
                    log.info('unset_connect_info:by redis:socketId unknown:socketId=' + fv.ws_manager.getTag(socketId));
                }
                else {
                    log.error('unset_connect_info:socketId unknown:socketId=' + fv.ws_manager.getTag(socketId));
                }
            }
        },
		//
        //
        set_session_info : function(socketId, sessionid) {
            var connectInfo = fv.ws_manager.get_connect_info(socketId);
            if (connectInfo) {
                connectInfo.joined_session = sessionid;         // 한개만 가능하다.
            }
            else {
                ; // error socketid;
            }

            log.debug('set_session_info:' + fv.ws_manager.getTag(socketId) + '::' + connectInfo.joined_session);
        },

        // unset 은 unset_connect_info 에서 직접 처리하는게 나을 듯..
        // unset_session_info : function(socketId, sessionid) {
        //     var connectInfo = fv.ws_manager.get_connect_info(socketId);
        //     if (connectInfo) {
        //         connectInfo.joined_session = [sessionid];
        //     }
        //     else {
        //         ; // error socketid;
        //     }
        // },


        //
        //
		get_join_session : function(sessionid) {
            return sessionManager[sessionid];
		},

		join_session : function (sessionid, socketId) {
			if (sessionManager[sessionid]) {
                var sessions = sessionManager[sessionid];
                sessionManager[sessionid] = _.concat(sessions, socketId);
			}
			else {
                sessionManager[sessionid] = [socketId];
			}

			log.debug('----> sessionManager:sessionId=' + sessionManager[sessionid].length + ', ' + JSON.stringify(sessionManager[sessionid]));
		},

        // INFO : 2017.08.20, do unsubscribe (true)
        leave_session : function (sessionid, socketId) {
            if (sessionManager[sessionid]) {
                 _.remove(sessionManager[sessionid], function(_socket_id) {
                    //log.debug('----> sessionManager:remove orig=' + socketId + ', _socket_id=' + _socket_id + ', T/F=' + (_socket_id === socketId));

                     return _socket_id === socketId;
                });

                log.debug('----> sessionManager:sessionId=' + sessionManager[sessionid].length + ', ' + JSON.stringify(sessionManager[sessionid]));
                if (sessionManager[sessionid].length == 0) {
                    sessionManager[sessionid] = null;
                    return true;
                }

                return false;
            }
            else {
                sessionManager[sessionid] = null;
                log.warn('----> (unknown??) sessionManager:sessionId=null');

                return true;    // do unsubscribe channel
            }

        },
    }

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return ws_manager;
}

