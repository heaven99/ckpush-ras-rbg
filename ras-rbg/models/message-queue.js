/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : message-queue.js
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
		defaults : {
			// _eg : 	// event group
			// _peg :	// prev. event group
			// _ec : 	// event traverse count
			cb_function : null,
			qname : '',				// from new instance
			qcmd : '',				
			app_id : '',			// app_id
			et : '',				// event type
			pid : '',				// process id
			tid : '',				// transaction id
			ctime : '',				// create time
			ud : '',				// user data
		},
		
		
		// TODOs : define queue name - init 할때 어캐하는지 찾아보자 
		initialize : function() {
			this.on('change', function(model) {
				// connect(auth), disconnect
			
	        	//var	key_name = 'queue.event';
	        	var key_name    = model.get('qname');
	        	var cmd			= model.get('qcmd');
	        	
	        	if (cmd == 'RPUSH') {
		        	var data = {
		        		app_id : model.get('app_id'),
			        	tid : model.get('tid'),
			        	ctime : model.get('ctime'),
			        	et  : model.get('et'),
			        	ud  : model.get('ud'),
		        	};
		        	
					fv.redis_client.send_command(cmd, [key_name, gv.inspect(data)], function (error, result) {
						if (error) {
							log.error('ERROR RPUSH' + key_name + gv.inspect(error));
						}
						else {
                            //INFO: 메시지큐 푸쉬 로그
							//log.debug('>RPUSH :' + key_name + ':' + gv.inspect(data));
                            ;
						}
					});
				}
				//
	        	else if (cmd == 'LPOP') {
					// TODO : queue 처리를 위한 기본 function 형태가 맞다.
					fv.redis_client.send_command('LLEN', [key_name], function (error, result) {
						if (error) {
							log.error('ERROR send_command:LLEN:' + gv.inspect(error));
							return;
						}

                        //INFO : 메시지큐 팝 로그
						//log.debug('>>queue:' + key_name + ':LLEN=' + gv.inspect(result));
						
						// TODO : 갯수를 모른다면 LRANGE 형태로 받아와도 되는데, 여기서는 약간의 트릭들이 필요할 듯 하다.
						// 일단은 단순 루프 형태로 작동하도록 한다. 100개 정도를 한번에 처리하도록 했는데, 필드테스트는 필요하다. 
						// 실제, 1 개 이상일때는 무조건 노티를 날리는 것보다는 그룹핑 방식도 필요하다. 
						// 노티를 못 받는 경우를 대비해 일정 시간에 한번 검사하는 로직을 보조로 돌리면 된다. 
						var pop_count = result;
						if (pop_count > 10) pop_count = 10;		// MAX 10 까지 동시처리로 제한한다.
						for (var i = 0; i < pop_count; i++) {
							// 일종의 비정규형으로 for loop 를 돌게 된다. (대부분의 경우 1이다.)
	        	
							fv.redis_client.send_command(cmd, [key_name], function (error, result) {
								if (error) {
									log.error('ERROR parse_keyspace_notification:send_command:LPOP:' + gv.inspect(error));
								}
								else {
                                    //INFO : queue POP 로그
									//log.debug('>LPOP:' + key_name + ':' + result);
								}
								
								if (model.get('cb_function')) {
									if (result == null) error = 'not found';
									
									model.get('cb_function')(error, result);	// function call
								}				
							});
						}
					});
				}
				else {
					log.error('ERROR message-queue.js : ' + key_name );
				}
			});
		},

		pushData : function (app_id, event_type, user_data) {
			this.set({ 
				qcmd		: 'RPUSH',
				app_id		: app_id, 
				tid			: gv.getTimeS() + '_' + (Math.floor(Math.random() * 10000)),
				ctime		: gv.getUnixTime(),
				et			: event_type,
				ud			: user_data,
			});
		},
		
		// pop 의 결과는 callback 된다. cb_function == null 이면 데이터만 pop 된다.
		popData : function (cb_function) {
			this.set({ 
				qcmd		: 'LPOP',
				tid			: gv.getTimeS() + '_' + (Math.floor(Math.random() * 10000)),
				cb_function : cb_function,
			});
		},
	});
	
	return Model;
}
