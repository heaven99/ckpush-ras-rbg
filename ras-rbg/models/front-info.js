/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-info.js
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
		// key_name : info.front.hostname.10000
		defaults : {
			count : -1,				// current connect
			count_hour : -1,		// for hour
			count_day : -1,			// for day
			count_hour_prev : -1,	// for hour (prev)
			count_day_prev : -1,	// for day  (prev) 
		},
		
		initialize : function(){
			//this.on('change:count', function(model, count) {
			this.on('change', function(model) {
				//log.debug('####chnage:count=' + count);
	        	// var	key_name = 'info.front.' +  hostname + '.' + port;
	        	var	key_name = 'ui.front.' + port;
				if (model.get('type') == 'set') {
	        		fv.redis_client.multi([
						['hincrby', key_name, 'count_hour', model.get('adder')],					
						['hincrby', key_name, 'count_day', model.get('adder')],					
        				['hmset', key_name, '_ras_label', '접속 관리자 정보(' + port + ' : ' + model.get('count') + ')', '_ras_image', 'images/ras-ckpush-front.png',
        					'count', model.get('count'), 'utime', gv.getUnixTime()],		// 이걸 마지막에 해서 event를 발생시킨다. 
	        		]).exec(function (error, result) {	
						if (error) log.error('ERROR model.front-info:change:' + gv.inspect(result));
					});
				}
				else if (model.get('type') == 'shiftHourly') {        
					// TODO : 좀 더 정교하게 작업하면 자체적으로 처리 가능함. 
					log.debug('@@shiftHourly');		
					fv.redis_client.send_command('hmget', [key_name, 'count_hour', 'count_day'], function (error, result) {
						if (error) {
							log.error('ERROR model.front-info:change:count:hmset:' + gv.inspect(result));
						}
						else {
							// TODO : 날짜단위/시간단위는 별도로 작업해야 한다. 
							// 필요하다면 ras_info_hist 테이블을 하나 만들도록 한다. 
			        		fv.redis_client.send_command('hmset', [key_name, 'count_hour', 0, 'count_day', 0, 'count_hour_prev', result[0], 'count_day_prev', result[1]], function (error, result) {
								if (error) log.error('ERROR model.front-info:change:count:hmset:' + gv.inspect(result));
			        		});
							
						}
					});
        		}
			});
		},
		
		
		setCount : function (newCount, newAdder) {
			//log.debug('####newCount=' + newCount);
			this.set({ 
				type  : 'set',
				count : newCount,
				adder : newAdder,
			});
		},
		
		shiftHourly : function () {
			this.set({ 
				type   : 'shiftHourly',
				ticker : gv.getUnixTime(),
			});
		},
		
		
	});
	
	return Model;
}
