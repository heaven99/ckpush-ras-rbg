/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : data-push.js
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
		// connect name : connect.app_id.7777.hostname.20001.Ut-cne9sZnA_seC9pgX-
		//  -app_id, uid, node, node-poer, soc_id

		defaults : {
			cmd		: '',
			
			key     : '',				// connect.app_id.7777.hostname.20001.Ut-cne9sZnA_seC9pgX-
			app_id  : 'unknown',		//
			uid     : 'unknown',		//
			node    : '',
			port    : 0,
			soc_id  : '',
		},
		
		initialize : function() {
			// change:cmd 로 명령어 트리거만 사용한다. (내부에서 model.set() 을 사용하고 있어 재귀호출된다.)
			this.on('change:cmd', function(model) {
				var cmd      = model.get('cmd');
				
				//log.debug('model init:' + model.get('key'));
				var con_split = model.get('key').split(".");
				// TODO : ASSERT split count

				for (var i = 0; i < con_split.length; i++) {
                    // INFO : 해당 필드를 이루는 값들은 dot(.) 를 포함하면 안된다.
					// ex : connect.app_id.7777.hostname.20001.Ut-cne9sZnA_seC9pgX-
					model.set('app_id', con_split[1]);
					model.set('uid'   , con_split[2]);
					model.set('node'  , con_split[3]);
					model.set('port'  , con_split[4]);
					model.set('soc_id', con_split[5]);
				}
				
				if (cmd == 'GET-NODE') {
					
				}	
				

			});
		},

		getNode : function () {
			this.set( { 
				cmd : 'GET-NODE',
			} );	
		},
		
	});
	
	return Model;
}
