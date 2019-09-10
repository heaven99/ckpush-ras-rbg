/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ui-object.js
 * @version : 3.0.0
 * @notes
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var backbone = require('backbone');

	var log = gv.config.log;

	var hostname = gv.config.crm.hostname;
	var port     = gv.config.crm.httpd_port;
	
	//////////////////////////////////////////////////////////////////////
	var Model = backbone.Model.extend({
		// key_name : ui.app_id.key, message=hset
		// INFO : key name 자체는 그냥 key 일 뿐이고, 내부의 데이터가 중요하다.
		defaults : {
			key_name : '',				//
			app_id : '',
			ui_name : '',
		},
		
		initialize : function() {
			this.on('change', function(model) {
	        	var	key_name = model.get('ui_name');
	        	var key_split = key_name.split(".");
	        	if (key_split.length < 3) return;
	        	
	        	// set app_id, ui_name 
	        	model.set('app_id', key_split[1]);
	        	if (key_split.length == 3) model.set('ui_name', key_split[2]);
	        	else if (key_split.length == 4) model.set('ui_name', key_split[2] + '.' + key_split[3]);
	        	else model.set('ui_name', key_split[2] + '.' + key_split[3] + '.' + key_split[4]);

				if (model.get('type') == 'get') {        		
					//log.debug('@@get:' + key_name);
  
	        		fv.redis_client.send_command('hgetall', [key_name], function (error, result) {
						if (error) log.error('ERROR model.ui-object:change:hgetall:' + gv.inspect(result));
						
						//log.debug('@@' + gv.inspect(result));
						model.get('cb_function')(error, result);	// function call
					});

           		}
				else if (model.get('type') == 'set') {
					// INFO : hmset 함수를 바로 호출한다. (object로 넘길 수 있기 때문, send_command는 arg array로 넘겨야 한다.)
	        		fv.redis_client.hmset(key_name, model.get('ui_object'), function (error, result) {
						if (error) log.error('ERROR model.ui-object:change:hmset:' + gv.inspect(result));
						
						//log.debug('@@' + gv.inspect(result));
						model.get('cb_function')(error, result);	// function call
					});

           		}
			});
		},

		// name parse 및 hgetall까지 수행한다. 
		getObject : function (cb_function) {
			//log.debug('####newCount=' + newCount);
			this.set({ 
				type  : 'get',
				
				cb_function : cb_function,
			});
		},
		
		// name parse 만 처리한다.
		getName : function () {
			this.set({
				type : 'getName',
			});
		},
		
		// name parse 및 hgetall까지 수행한다. 
		setObject : function (ui_object, cb_function) {
			//log.debug('####newCount=' + newCount);
			this.set({ 
				type  : 'set',
				ui_object : ui_object,
				cb_function : cb_function,
			});
		},
		
		
	});
	
	return Model;
}
