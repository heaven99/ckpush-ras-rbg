/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : event-redis-handler.js
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
		//log.debug(':->[REDIS] message#>CH:' + channel + ':' + message);
		
		//
		// INFO : 1시간 단위 event 임. 
		//
		if (channel == 'ckpush-time-1hour') {
			;	// do nothing
		}
	});
	
	//////////////////////////////////////////////////////////////////////
	// INFO : REDIS keyspace notification 처리. 
	fv.redis_sub_ch.on('pmessage', function (pattern, channel, message) {
		//pmessage#>pattern=__keyspace@*__:*, channel=__keyspace@15__:connect.7504.hostname.10000.hxDJWCZxe84RkMeW1cz-, message=expired
		//  MUST : +set, expired, rpush, hset
		//  NOT  : -rename_from, rename_to, set, rpush, hset, expire, expired
		
		//log.debug(':->[REDIS] pmessage#>pattern=' + pattern + ', channel=' + channel + ', message=' + message);
		
		var channel_keyspace = '__keyspace@' + gv.config.sys.license.redis_event_db.db_id + '__:';
		if (channel_keyspace == channel.substring(0, channel_keyspace.length)) {
            //INFO : 채널메시지 로그용
			//log.debug('[REDIS] channel=' + channel + ', message=' + message);
			
			//
			// TODO : 모든 이벤트를 발생 시킬것이 아니라 어느정도 걸러도 된다.
			// --protocol 부로 갈지 말지 고민좀 합시다. (여기서 해결해도 될듯 하고)
			// --> 그냥 분리된대로 가자.. 성능보다는 형상으로 관리한다. 
			//
			var keyspace = channel.substring(channel_keyspace.length);
			var cmd = message;
			
			// INFO : keyspace notification parse
			fv.protocol.parse_keyspace_notification(keyspace, cmd);
		}
	});


	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

