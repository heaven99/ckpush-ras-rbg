/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : sync-redis-handler.js
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
	// INFO : REDIS message 를 처리한다.
	// 
	fv.redis_sub_ch.on('message', function (channel, message) {
		log.debug(':->[REDIS] message#>CH:' + channel + ':' + message);
		//		
	});
	
	//////////////////////////////////////////////////////////////////////
	// INFO : REDIS keyspace notification 처리. 
	fv.redis_sub_ch.on('pmessage', function (pattern, channel, message) {
		var channel_keyspace = '__keyspace@' + gv.config.sys.license.redis_event_db.db_id + '__:';
		//log.debug('[REDIS] channel=' + channel + ', message=' + message);
		if (channel_keyspace == channel.substring(0, channel_keyspace.length)) {
			//log.debug('[REDIS] #>pattern=' + pattern + ', channel=' + channel + ', message=' + message);
			//log.debug('[REDIS] channel=' + channel + ', message=' + message);
			var keyspace = channel.substring(channel_keyspace.length);
			var cmd = message;
			
			if (keyspace != 'config.global.cronjob') return;
			
			// INFO : config.global.cronjob 이 변경되면 load를 시도한다.
			log.info('[REDIS] config.global.cronjob changed:keyspace=' + keyspace + ', cmd=' + cmd);
			fv.time_division.load_config();
			
			var event_monitor = new fv.models.message_channel({ qname : 'ckpush-event-monitor' });
			event_monitor.sendData('global', 'event-monitor', 
				{ app_id : 'global', desc : 'ckpush-sync cronjob loaded:' + cmd });

		}
	});


	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

