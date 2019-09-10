/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : message-channel.js
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
			qname : '',				// publish channel
			qcmd : '',				// channel command
			app_id : '',			// app_id
			et : '',				// event type
			pid : '',				// process id
			tid : '',				// transaction id
			ctime : '',				// create time
			ud : '',				// user data
		},
		
		
		initialize : function() {
			this.on('change', function(model) {
	        	var key_name    = model.get('qname');
	        	var cmd			= model.get('qcmd');
	        	
	        	if (cmd == 'PUBLISH') {
		        	var data = { 
		        		app_id : model.get('app_id'),
			        	tid : model.get('tid'),
			        	ctime : model.get('ctime'),
			        	et  : model.get('et'),
			        	ud  : model.get('ud'),
		        	};
		        	
		        	fv.redis_pub_ch.publish(key_name, gv.inspect(data));

                    // LOG DEPRECATED : INFO : 모드 데이터 출력
                    //log.debug('>PUBLISH:' + key_name + ':' + gv.inspect(data));
                    //log.debug('>PUBLISH:' + key_name + ':' + data.app_id);
				}
				else {
					log.error('ERROR message-channel.js : ' + key_name );
				}
			});
		},

		sendData : function (app_id, event_type, user_data) {
			this.set({ 
				qcmd		: 'PUBLISH',
				app_id		: app_id,
				tid			: gv.getTimeS() + '_' + (Math.floor(Math.random() * 10000)),
				ctime		: gv.getUnixTime(),
				et			: event_type,
				ud			: user_data,
			});
		},
		
	});
	
	return Model;
}
