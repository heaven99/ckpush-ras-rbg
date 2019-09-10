/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-connection.js
 * @version : 3.0.0
 * @notes
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var backbone = require('backbone');

	var log = gv.config.log;
	
	//////////////////////////////////////////////////////////////////////
	var Model = backbone.Model.extend({
		// key_name : connect.7504.hostname.10000.7uF9XEh3NPniugpnskTl
		defaults : {
			connect    : false,		// connect for handler
			utime      : 0,         // update time
			soc_id     : '',		// socket.io connection id (for multi) : soc_id.connection_id
			app_id     : '', 		// application id (for multi apps)
			member_srl : '',		// service member id
			hostname   : gv.config.crm.hostname,
			port       : gv.config.crm.httpd_port,
		},
		
		initialize : function(){
			this.on('change:connect', function(model, connect) {
	        	var	key_name = 'connect.' +  model.get('app_id') + '.' + model.get('member_srl') + '.' + model.get('hostname') + '.' + model.get('port') + '.' + model.get('soc_id')
				//log.debug('@@@@key_name=' + key_name);
				
	        	if (connect == 'CONNECT') {
	        		fv.redis_client.multi([
	        				['hmset', key_name, 'utime', gv.getUnixTime()], 
							['expire', key_name, 5],					// 첫 접속후 expire time 5 초 
	        		]).exec(function (error, result) {	
						if (error) log.error('ERROR model.front-connection:change:CONNECT:hmset/expire:' + gv.inspect(result));
					});
	        	}
	        	else if (connect == 'CONNECT_AUTHORIZED') {
	        		// INFO : unauth --> auth 로 바꿔야 하기 때문에 key_name 을 별도로 정의해야 한다. 
		        	var	key_unauth_name = 'connect.unknown.unauthorized.' + model.get('hostname') + '.' + model.get('port') + '.' + model.get('soc_id');
		        	//log.debug('@@@@-->unauth_key_name=' + key_unauth_name);
		        	
	        		fv.redis_client.multi([
	        				['rename', key_unauth_name, key_name], 
							['expire', key_name, 70],					// 인증후 expire time 70 초
	        		]).exec(function (error, result) {	
						if (error) log.error('ERROR model.front-connection:change:CONNECT_AUTHORIZED:rename/expire:' + gv.inspect(result));
					});
	        	}
	        	else if (connect == 'UPDATE') {							// ping/pong 후 expire time 70 초
	        		fv.redis_client.send_command('expire', [key_name, 70], function (error, result) {
						if (error) log.error('ERROR model.front-connection:change:UPDATE' + gv.inspect(result));
	        		});
	        	}
	        	else {
	        		if (model.get('app_id') == 'unknown') {		// 2014.03.19 - 비인증 접속을 정리한다.
			        	var	key_unauth_name = 'connect.unknown.unauthorized.' + model.get('hostname') + '.' + model.get('port') + '.' + model.get('soc_id');
		        		//log.debug('--->key=' + key_unauth_name + ', app_id=' + model.get('app_id') + ', ' + model.get('member_srl'));
		        		fv.redis_client.send_command('del', [key_unauth_name], function (error, result) {
							if (error) log.error('ERROR model.front-connection:change:(NOT defined,disconnect):del:' + gv.inspect(result));
		        		});
	        		}
	        		else {
		        		fv.redis_client.send_command('del', [key_name], function (error, result) {
							if (error) log.error('ERROR model.front-connection:change:(NOT defined,disconnect):del:' + gv.inspect(result));
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
		
		
/* TODO : check validate
		validate : function (attribs) {
			if (attribs.soc_id == undefined) {
				return 'soc_id is undefined';
			}
		}
*/

		setConnection : function (socket) {
			this.set({ 
				connect    : 'CONNECT',
				soc_id     : socket.handshake._user_.soc_id,			// soc_id.id
				app_id     : socket.handshake._user_.app_id,			// 
				member_srl : socket.handshake._user_.member_srl,
				//member_srl : 'unauthorized',							// 2014.03.19 - remark : 초기 socket.io 접속시 member_srl 을 'unauthorized' 로 초기화 한다.
			});
		},

		setAuthConnection : function (socket) {
			this.set({ 
				connect    : 'CONNECT_AUTHORIZED',
				soc_id     : socket.handshake._user_.soc_id,			// soc_id.id
				app_id     : socket.handshake._user_.app_id,			//
				member_srl : socket.handshake._user_.member_srl,
			});
		},
		
		updateConnection : function (socket) {
			this.set({ 
				connect    : 'UPDATE',
				soc_id     : socket.handshake._user_.soc_id,			// soc_id.id
				app_id     : socket.handshake._user_.app_id,			//
				member_srl : socket.handshake._user_.member_srl,
			});
		},
		
		setDisconnection : function (socket) {
			this.set({ 
				connect    : 'DISCONNECT',
				soc_id     : socket.handshake._user_.soc_id,			// soc_id.id
				app_id     : socket.handshake._user_.app_id,			//
				member_srl : socket.handshake._user_.member_srl,
			});
		},
		
		// deprecated : 2013.12.26
		// INFO : 최최 실행시 초기화 로직
		clearConnection : function (next_function) {
			fv.redis_client.send_command('hgetall', [io_key], function (error, result) {
				if (!error) {
					if (result) {
						gv.config.log.info('    -CLEAR connection lists :' + gv.inspect(result));
	
						
						for (var index in result) {
							log.debug('    -CLEAR connection soc_id=' + index);
							
							var member_srl = result[index];
							fv.redis_client.send_command('hdel', [user_key_prefix + member_srl, 'soc_id.' + index], function (error, result) {
								if (error) log.error('ERROR hdel:' + gv.inspect(error));
							});
						}
						
						fv.redis_client.send_command('del', [io_key], function (error, result) {
							if (error) gv.config.log.error('ERROR del:' + gv.inspect(result));
							
							gv.config.log.info('  +end of REDIS');
							next_function(null, '');
						});
					}
				}
				else {
					log.error('ERROR redis_configure:send_command:hgetall:' + gv.inspect(result));
					log.info('  +end of REDIS with ERROR');
					
					next_function('ERROR REDIS', '');
				}
			});		
		}
		
	});
	
	return Model;
}
