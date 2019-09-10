/**
 * ckpush-ras
 * 
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 * 
 * -----------------------------------------------------------
 * @file : sync-time-division.js
 * @version : 3.0.0
 * @notes
 *  -Timer 의 종류 
 *    ckpush-time-1sec, ckpush-time-5sec, ckpush-time-10sec,
 *    ckpush-time-1min, ckpush-time-5min, ckpush-time-10min, ckpush-time-1hour
 *
 */
/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var moment  = require('moment');
	var os = require('os');

	// global variable for this file (scope : in file)
	var log = gv.config.log;
	
	var	loop_max_term = 20;
	var tick = 0;
	var save_time = 0;
	
	var schedule;
	
	
	//{"* 00 00":"hourly","00 00 00":"daily","* * 00":"minute","* * *":"every-check"}
	// patch : * 00 00 --> cron-name * 00 00
	var parse_schedule = function (data) {
		//log.debug('schedule=' + gv.inspect(schedule));
		
		schedule = [];
		var i = 0;
		for (var key in data) {
			if (key.substring(0, 1) == '_') continue;			// 설명 키는 skip
			//log.debug('@loaded ' + key + ':' + data[key]);
			schedule[i] = {};
			schedule[i].time = key;
			schedule[i].event = data[key];
			
			var sp = key.split(" ", 4);
			
			schedule[i].cron_name = sp[0];
			schedule[i].hour = sp[1];
			schedule[i].minute = sp[2];
			schedule[i].second = sp[3];
			
			log.debug('@loedad ' + i + '= [' + schedule[i].event + ':' + schedule[i].cron_name + '] ' + schedule[i].hour + ':' + schedule[i].minute + ':' + schedule[i].second);
			
			
			i++;
		}
	}		
	
	
	var load_schedule = function () {
		var key_name = 'config.global.cronjob';
		
		fv.redis_client.send_command('hgetall', [key_name], function (error, result) {
			if (error) {
				log.error('ERROR hgetall:' + gv.inspect(result));
			}
			else {
				parse_schedule(result);
			}
		});
		
	};
	
	var cronjob = function (hour, minute, second) {
		//log.debug('@check-time:' + hour + ', ' + minute + ', ' + second);
		var check_count = 0;
		for (var i = 0; i < schedule.length; i++) {
			check_count = 0;
			
			if (schedule[i].second == '*' || schedule[i].second == second) {
				//log.debug('--second true:' + schedule[i].time);
				check_count++;
			}
			
			if (schedule[i].minute == '*' || schedule[i].minute == minute) {
				//log.debug('--minute true:' + schedule[i].time);
				check_count++;
			}
			
			if (schedule[i].hour == '*' || schedule[i].hour == hour) {
				//log.debug('--hour true:' + schedule[i].time);
				check_count++;
			}
			
			// all true
			if (check_count == 3) {
				log.debug('@event fire:' + schedule[i].event);
				
				// INFO : 이벤트서버로 전달 (이벤트 푸시, cronjob은 global app_id 를 사용한다.
				var event = new fv.models.message_queue({ qname : 'queue.event' });
				event.pushData('global', schedule[i].event, { data : { hour : hour, minute : minute, second : second } } );
			}
		}
	};


    //INFO : 스펙코드로 로드를 줄이는 작업에 우선을 둔다.
    var copy_ui_objects = function () {
        //log.debug('@try copy_ui_objects');

        fv.redis_data_client.send_command('keys', ['ui.*'], function (error, result) {
            if (error) {
                log.error('ERROR model.ui-object:keys:' + gv.inspect(result));
            }
            //INFO : keyname 의 ui objects 복사를 시작한다.
            else {
                result.forEach(function(keyname) {
                    //INFO: redis event 쪽에서 해당 ui object 가 있는지 확인하고
                    fv.redis_client.send_command('keys', [keyname], function (error, result) {
                        //INFO: redis-event 에 없으면, redis-data에서 그냥 삭제해서 무시해 버린다.
                        if (error || result.length == 0) {
                            log.warn('copy_ui_objects:source key not found : delete redis-data:' + keyname);
                            fv.redis_data_client.send_command('del', [keyname], function (error, result) {
                                log.debug('copy_ui_objects:deleted key:' + keyname + ', error=' + error);
                                //INFO : 로그도 Aync 하게 기록된다. 이게 참... 검토가 필요한 부분이다.
                                //01:10:50.015 - debug: copy_ui_objects["ui.test.1"]
                                //01:10:50.015 - debug: copy_ui_objects:deleted key:ui.test.2, error=null
                                //01:10:50.014 - notice: copy_ui_objects:source key not found : delete redis-data:ui.test.2
                            });
                        }
                        //INFO : redis-event 에 원본이 있다. 이제 redis-data에서 변경된 값을 복사한다.
                        else {
                            log.debug('copy_ui_objects from redis-data:key=' + keyname);

                            fv.redis_data_client.send_command('hgetall', [keyname], function (error, hashes) {
                                log.debug('copy_ui_objects:key=' + keyname + ', hashes=' + gv.inspect(hashes))

                                fv.redis_client.HMSET(keyname, hashes);
                            });
                            // 원본이 삭제되버리면 어차피 -data쪽은 바로 삭제되어서 문제가 없다.
                            // redis 쪽이 일반적인 ui object 라면 오래지 않아 삭제될 것 이다.
                            // 실제로 더 고민해 봐야 할것은 redis-data 쪽도 변경이 없는데, 또 복사를 시도한다는 것이다.
                            // 이것을 어떻게 막을지 고민이 필요할 것 같다.
                            // INFO : 이러한 사용의 한계는 update 및 field 의 추가는 대응가능하나, field 의 삭제는 불가능하다.
                            // INFO : 또한 데이터의 key 복사를 언제 종료할지 모른다는 것이다. 따라서, 기능상의 한정을 짓거나 보다 복잡한 로직을 동원해야 한다.
                        }
                    });

                });
            }
        });

        //var bind_object = new fv.models.ui_object({ ui_name : keyspace });

    }



	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	var time_division = function () {
		var loop_start = moment().valueOf();
	
		// INFO : 초가 바뀌었다.
		if (moment().unix() != save_time) {
			save_time = moment().unix();
			
			// 초단위 방송.
			fv.redis_pub_ch.publish('ckpush-time-1sec', '');
			
			var hour   = moment().hour();
			var second = moment().second();
			var minute = moment().minute();

            //INFO : CRONJOB 처리
			cronjob(hour, minute, second);

			// INFO : 하기 로직은 절대적인 시간을 기준으로 이벤트를 발생시킨다. 
			//  -이벤트는 redis 를 통해 방송되며, 필요한 서비스들은 해당 방송을 수신하면 된다. 
			if (second % 5 == 0) {
				fv.redis_pub_ch.publish('ckpush-time-5sec', '');
				// INFO : 5초 단위 cronjob 지원 (상용기 전용)
				// deprecated : 2015.07.18 cronjob(hour, minute, second);

                //INFO : [redis-data] 에서 ui objects 들을 조사 후에 [redis-event]로 복사한다.
                copy_ui_objects();
			}
			
			if (second % 10 == 0) {
				fv.redis_pub_ch.publish('ckpush-time-10sec', '');
			}
			
			if (second == 0) {
				fv.redis_pub_ch.publish('ckpush-time-1min', '');
			}
			
			if (minute % 5 == 0 && second == 0) {
				fv.redis_pub_ch.publish('ckpush-time-5min', '');
			}
			
			if (minute % 10 == 0 && second == 0) {
				fv.redis_pub_ch.publish('ckpush-time-10min', '');
			}

			if (minute == 0 && second == 0) {
				fv.redis_pub_ch.publish('ckpush-time-1hour', '');
			}
		}
		
		tick++;
		
		if (moment().valueOf() - loop_start > loop_max_term) {
			log.warn('######### TOO LATE, loop term(ms) = ' + (moment().valueOf() - loop_start) )
		}
	};
	
	
	var Module = {
		init : function (division) {
			load_schedule();
			
			save_time = moment().unix();
			
			setInterval(function() { 
				time_division();
			}, division);
		},
		
		load_config : function() {
			load_schedule();
		}
	};
	
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return Module;
}