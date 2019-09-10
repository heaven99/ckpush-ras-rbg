/**
 *
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var backbone = require('backbone');

	var log = gv.config.log;

	//////////////////////////////////////////////////////////////////////
	var Model = backbone.Model.extend({
        // key_name : connect.{channeltype}.{user}.{host-port}.{socket id}
		defaults : {
			connect     : false,		// connect for handler
			utime       : 0,         	// update time
            channelType : '',
            userInfo    : '',
            hostname    : gv.config.crm.hostname,
            port        : gv.config.crm.httpd_port,
			soc_id      : '',			// websocket connection id (for multi) : soc_id.connection_id
		},

		initialize : function(){
			this.on('change:connect', function(model, connect) {
	        	var	key_name = 'connect.' +  model.get('channelType') + '.' + model.get('userInfo') + '.' + model.get('hostname') + '.' + model.get('port') + '.' + model.get('soc_id');
				log.debug('@Model:key=' + key_name);

	        	if (connect == 'CONNECT') {
	        		fv.redis_client.multi([
	        				['hmset', key_name, 'utime', gv.getUnixTime()],
	                        ['expire', key_name, 35],			// TODO : 2017.10.22, 5초로 할 것.
	        		]).exec(function (error, result) {
						if (error) log.error('ERROR model.gc-connection-model:change:CONNECT:hmset/expire:' + gv.inspect(result));
					});
	        	}
	        	else if (connect == 'CONNECT_AUTHORIZED') {
                    var	key_unauth_name = 'connect.unknown.' + model.get('userInfo') + '.' + model.get('hostname') + '.' + model.get('port') + '.' + model.get('soc_id');

	        		fv.redis_client.multi([
	        				['rename', key_unauth_name, key_name],
							['expire', key_name, 70],
	        		]).exec(function (error, result) {
						if (error) log.error('ERROR model.gc-connection-model:change:CONNECT_AUTHORIZED:rename/expire:' + gv.inspect(result));
					});
	        	}
	        	else if (connect == 'UPDATE') {
	        		fv.redis_client.send_command('expire', [key_name, 70], function (error, result) {
						if (error) log.error('ERROR model.gc-connection-model:change:UPDATE' + gv.inspect(result));
	        		});
	        	}
                else if (connect == 'DISCONNECT') {							// ping/pong 후 expire time 70 초
	        		if (model.get('channelType') == 'unknown') {			// 2014.03.19 - 비인증 접속을 정리한다.
                        var	key_unauth_name = 'connect.unknown.' + model.get('userInfo') + '.' + model.get('hostname') + '.' + model.get('port') + '.' + model.get('soc_id');
		        		//log.debug('--->key=' + key_unauth_name + ', app_id=' + model.get('app_id') + ', ' + model.get('member_srl'));
		        		fv.redis_client.send_command('del', [key_unauth_name], function (error, result) {
							if (error) log.error('ERROR model.gc-connection:change:(NOT defined,disconnect):del:' + gv.inspect(result));
		        		});
	        		}
	        		else {
		        		fv.redis_client.send_command('del', [key_name], function (error, result) {
							if (error) log.error('ERROR model.gc-connection:change:(NOT defined,disconnect):del:' + gv.inspect(result));
		        		});

		        		// INFO : expire 로 처리해도 되나, 실제 del 과 같은 현상은 똑같이 발생한다. (이미 접속은 끊어져 버렸기 때문에)
		        		// -따라서, del / expire 는 같은 결과를 가지게 되며, keyspace notification 처리부에서 유화된 로그 메시지로 처리한다. (2014.04.10)
		        		//fv.redis_client.send_command('pexpire', [key_name, 1], function (error, result) {
						//	if (error) log.error('ERROR model.front-connection:change:(NOT defined,disconnect):pexpire:' + gv.inspect(result));
		        		//});

		        	}
	        	}
			});

		},


		setConnection : function (conInfo) {
			log.debug('@setConnection:', conInfo);
			this.set({
				connect    	: 'CONNECT',
                channelType : conInfo.channelType,			//
                userInfo 	: conInfo.userInfo,
                soc_id     	: conInfo.soc_id,
			});
		},
		//
		//
		setAuthConnection : function (conInfo) {
			this.set({
				connect    	: 'CONNECT_AUTHORIZED',
                channelType : conInfo.channelType,			//
                userInfo 	: conInfo.userInfo,
                soc_id     	: conInfo.soc_id,
			});
		},
		//
		//
		updateConnection : function (conInfo) {
            log.debug('@updateConnection:', conInfo);
			this.set({
				connect    	: 'UPDATE',
                channelType : conInfo.channelType,			//
                userInfo 	: conInfo.userInfo,
                soc_id     	: conInfo.soc_id,
			});
		},

		setDisconnection : function (conInfo) {
			this.set({
				connect     : 'DISCONNECT',
                channelType : conInfo.channelType,			//
                userInfo 	: conInfo.userInfo,
                soc_id     	: conInfo.soc_id,
			});
		},

        // TODO : 2017.08.19, user 정보에 현재 참가한 channel name 을 관리해야 한다.
		create_session : function(channelType, channel, sessionid) {
			//let channelName = channelType + "-" + channel;
			let channelName;
			if (sessionid)
				channelName = sessionid;
			else
				channelName = channel;

            fv.redis_sub_ch.subscribe(channelName);

            return channelName;
		},

        join_session : function(channelName) {
            fv.redis_sub_ch.subscribe(channelName);
            log.debug('@REDIS:sessionManager:subscribe=' + channelName);

        },

        // INFO : 2017.09.06, leave_session 에서는 model 정보를 이용하지 않는것을 기본으로 한다.
		// 만약 사항이 바뀌면 사용하는 로직들을 검토해야 한다.
        leave_session : function(channelName) {
            fv.redis_sub_ch.unsubscribe(channelName);
            log.debug('@REDIS:sessionManager:unsubscribe=' + channelName);
        }
	});

	return Model;
}
