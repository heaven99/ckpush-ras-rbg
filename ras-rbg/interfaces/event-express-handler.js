/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : event-express-handler.js
 * @version : 3.0.0
 * @notes
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var fs = require('fs');
	// global variable for this file (scope : in file)
	var log = gv.config.log;
	

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	// INFO : favicon.icon
/*
	fv.express_app.get('/favicon.ico', function (req, res) {
		res.sendfile(gv.config.crm.httpd_base + '/favicon.ico');
	});
*/
/*
	// INFO : 
	// deprecated : move to P1-API
	fv.express_app.post('/gcm_register', function (req, res) {
		log.debug('>>HTTP gcm_register API:IP=' + req.ip + ', ' + gv.inspect(req.body));
		//IP=211.36.149.2, {"gcm_rid":"APA91bHStZkPLQ7ySmau6rvLRi8CJywefVTTP2DAX7g-u0CTDpKPOt5huoA7zI6Zw6ByskL6ti-v3t_wNhCfpHuUefr0qXqbnTnOUDkZGQ2YYsJWP6EmoX-Hf_9PxPcIDbxoHAdqcaDFWRJMmWzUC5eovHCUhHx-fw",
		//"uid":"3b7bea89f1551382","api_key":"089654cc9f27bcc4e37eb0b96c2f222dc6aa8c00"}

		var sql = 'INSERT INTO t_gcm_user SET ? ON DUPLICATE KEY UPDATE ? ';
		log.debug(':->gcm_register:sql=' + sql);
		fv.mysql_client.query(sql, [{ api_key : req.body.api_key, uid : req.body.uid, gcm_rid : req.body.gcm_rid }, 
								    { gcm_rid : req.body.gcm_rid }], function(error, result) {
								    
			if (error) {
				log.error('ERROR:gcm_register=' + error);
			}
			else {
			
			}
		});
	
		res.send(200, { result : 0 } );
	});
*/	

	// INFO :
	// TODO : POST :
	fv.express_app.post('/gcm_simple_send', function (req, res) {
		//log.debug('[EXPRESS] gcm_simple_send API:IP=' + req.ip + ', ' + gv.inspect(req.body));
		log.debug('[EXPRESS] gcm_simple_send API:IP=' + req.ip );

		var gcm_rids = req.body.gcm_rids;	// 그냥 바로 넣는다.
		var message =  req.body.message;
		// TODO : ASSERT
		
		log.debug('[EXPRESS] gcm_rids=' + gv.inspect(gcm_rids));
		log.debug('[EXPRESS] message=' + message);

		// CALL : GCM
		fv.protocol.gcm_simple_send(gcm_rids, { message : message }, function(error, result) {
			if (error) {
				res.send(200, { "result" : -1, "error_string" : gv.inspect(error) } );
			}
			else {
				res.send(200, { "result" : 0, "data" : result } );
			}
		});
	});


	// INFO :
	// TODO : POST :
	fv.express_app.post('/gcm_object_send', function (req, res) {
		//log.debug('[EXPRESS:GCM] gcm_simple_send API:IP=' + req.ip + ', ' + gv.inspect(req.body));
		log.debug('[EXPRESS:GCM] gcm_object_send API:IP=' + req.ip );

		var gcm_rids = req.body.gcm_rids;	// 그냥 바로 넣는다.
		var gcm_data =  req.body.gcm_data;		// 그냥 바로 넣는다. gcm_data = { title, msg, image_url, ... }

		log.debug('[EXPRESS:GCM] gcm_rids=' + gv.inspect(gcm_rids));
		log.debug('[EXPRESS:GCM] gcm_data=' + gv.inspect(gcm_data));

		// CALL : GCM
		fv.protocol.gcm_object_send(gcm_rids, gcm_data, function(error, result) {
			if (error) {
				res.send(200, { "result" : -1, "error_string" : gv.inspect(error) } );
			}
			else {
				res.send(200, { "result" : 0, "data" : result } );
			}
		});
	});



    // INFO :
    fv.express_app.post('/apns_object_send', function (req, res) {
        log.debug('[EXPRESS:APNS] apns_object_send API:IP=' + req.ip );
        //log.debug('[EXPRESS:APNS] apns_object_send API:body=' + gv.inspect(req.body) );

        var apns_tokens = req.body.apns_tokens;	    // 그냥 바로 넣는다.
        var apns_data =  req.body.apns_data;		// 그냥 바로 넣는다. apns_data = { title, msg, image_url, ... }

        log.debug('[EXPRESS:APNS] apns_tokens=' + gv.inspect(apns_tokens));
        log.debug('[EXPRESS:APNS] apns_data=' + gv.inspect(apns_data));
        // APNS object:{"app_id":"hotdealfinderios","rcb":"http:\/\/dev.ckpush.com:20001\/api\/v3\/apns-callback?aid=hotdealfinderios&tid=27","title":"aaaa","msg":"aaaaa"}



        // TODO : APNS test
        //var token = '995be21cfd9a67cbc8e591ec28bb1a6a1c883cf2c1715a61bbd5e5d9bb61ee77';
        var recv_devices = [];
        for (var i = 0; i < apns_tokens.length; i++) {
            recv_devices[i] = new fv.apn.Device(apns_tokens[i]);
        }

        // INFO : 하나의 메시지를 만든다.
        var note = new fv.apn.Notification();
        note.badge = 0;                                     //INFO : 아이콘 뱃지 카운트 (값을 주지 않으면, 기존 값이 남아있게된다.)
        note.expiry = Math.floor(Date.now() / 1000) + 3600; //INFO : Expires 1 hour from now.
        note.sound = "default"; //"ping.aiff";              //INFO : 사운드가 있으면 진동도 된다.
        note.alert = {
            title: apns_data.title,        //INFO : from iOS8.2, Apple Watch displays this string as part of the notification interface
            body: apns_data.msg            //INFO : 실제 메시지 수신후 보이는 메시지로 보면됨.
        };
        if (apns_data.url) {
            note.payload = {
                ckpush: {
                    url: apns_data.url
                }
            };
        }

        // INFO : - 에러를 내고 죽는다. Error: certificate has expired: 2016-05-25T03:43:33.000Z
        // 를 처리하려고 했으나 실제 처리되지 않았다.
        try {
            // TODO : recv_device 에 오류가 있으면 그냥 전체 발송을 포기해 버린다.
            // -이에 대한 방안은 필요하다.
            if (apns_data.app_id) {
                // TODO : 결과 확인 할것, sendNotification 과 비교해 볼 것.
                fv.apnConnection[apns_data.app_id].pushNotification(note, recv_devices);

                res.send(200, {"result": 0, "data": []});
            }
        }
        catch (e) {
            log.error('[EXPRESS:APNS] try/catch exception:' + e);
        }
    });


    //////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

