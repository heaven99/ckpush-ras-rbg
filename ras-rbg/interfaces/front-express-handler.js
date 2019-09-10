/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-express-handler.js
 * @version : 3.0.0
 * @notes
 */

/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
	var fs = require('fs');
    var multiparty = require('multiparty');
    var formidable = require('formidable');

	// global variable for this file (scope : in file)
	var log = gv.config.log;
	
	
	var getUserTag = function(req) {
		return {
			app_id : req.body.app_id,
			ssid : 'unauthorized',
			ip : req.ip, 
			soc_id : 'HTTP',
			member_srl : req.body.android_id,
		};
			
		
	}

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	// INFO : favicon.icon
/*
	fv.express_app.get('/favicon.ico', function (req, res) {
		res.sendfile(gv.config.crm.httpd_base + '/favicon.ico');
	});
*/

	fv.express_app.post('/api/v1/gcm-any', function (req, res) {
	
		var	tag = '[EXPRESS] API ' + req.route.path + ' : ';	 
		log.debug(tag + 'IP=' + req.ip + ', ' + gv.inspect(req.body));
		// LOG : {"gcm_rid":"APA91bHEcCm8Cue_gkwPAtG2BVNHSO69GZS4s5Khww3vOa2ZOexiNF3EZou8wMM6RAFWmBlziohB_jXcYoN8NEZZUKI7kILCn8z9fzgW2UJhAWyNXsY8KLkHs22-IFJUGR8yfUr6aXc8YWBrMY0vMi_atekynNmMOQ","type":"update","android_id":"3b7bea89f1551382","app_id":"p2y1"}		

		if (req.body.type == 'update') {
			var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
			event_fire.pushData(req.body.app_id, 'ras-gcm-any-update', { data : req.body, user_tag : getUserTag(req) });
		}
		else if (req.body.type == 'delete') {
			log.info(tag + '(TODO) delete GCM request');	
		}
	
		res.send(200, { result : 0 } );
	});


    // deprecated : 2015.06.29
	//fv.express_app.post('/api/v1/gcm-callback', function (req, res) {
	//	var	tag = '[EXPRESS] API ' + req.route.path + ' : ';
	//	log.debug(tag + 'IP=' + req.ip + ', ' + gv.inspect(req.body));
    //
	//	var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
	//	event_fire.pushData(req.body.app_id, 'ras-gcm-callback', { data : req.body, user_tag : getUserTag(req) });
	//
	//	res.send(200, { result : 0 } );
	//});


    fv.express_app.get('/api/v3/gcm-callback', function (req, res) {
        var	tag = '[EXPRESS] API ' + req.route.path + ' : ';
        log.debug(tag + 'IP=' + req.ip + ', ' + gv.inspect(req.query));
        // query.aid == app id,
        // query.tid == gcm tid
        var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
        event_fire.pushData(req.query.aid, 'ras-gcm-callback', { data : req.query, user_tag : getUserTag(req) });

        res.send(200, { result : 0 } );
    });


    // INFO : 싸이니지 화일 업로드 화일 처리
    fv.express_app.post('/upload', function (req, res) {
        var	tag = '[EXPRESS] API ' + req.route.path + ' : ';

        // parse a file upload
        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            // TODO : 결과를 정리하도록 한다.

            //res.writeHead(200, {'content-type': 'text/plain'});
            //res.write('received upload:\n\n');
            //res.end(gv.inspect({fields: fields, files: files}));


            if (err) {
                res.send(200, {"ckError": "E000001"});
            }
            else {
                var sid = fields.sid + '';		// 그냥 처리하면 Array 가 된다.
                // INFO : version 을 1로 고정해서 처리한다.
                log.debug(tag + 'story name=' + '1_' + sid + '.zip');
                var moveFile = gv.config.crm.site_httpd_base + '/download/' + '1_' + sid + '.zip';
                log.debug(tag + 'move file=' + moveFile);

                fs.rename(files.attach_file[0].path, moveFile, function(err) {
                    if ( err ) {
                        res.send(200, {"ckError": "E00000X"});
                    }
                    else {
                        res.send(200, {"ckError": "S000001"});

                        // INFO : signage only
                        var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
                        //event_fire.pushData('signage', 'private-upload', { data : { sid : fields.sid }, user_tag : getUserTag(req) });
                        event_fire.pushData('signage', 'private-upload', { data : { sid : sid } });
                    }
                });

            }

            log.debug(tag + 'uploaded=' + gv.inspect({fields: fields, files: files}));
        });
    });



    // INFO: 2018.12.31, drone file upload
    fv.express_app.get('/drone/api/uploadpage', function (req, res) {
        var	tag = '[EXPRESS] API ' + req.route.path + ' : ';
        log.debug(tag + 'IP=' + req.ip + ', ' + gv.inspect(req.query));
        // query.aid == app id,
        // query.tid == gcm tid
        res.status(200).send(
			'<html>\n' +
            '    <body>\n' +
            '        <form action="/drone/api/uploadfile" enctype="multipart/form-data" method="post">\n' +
            '            <input type="text" name="title">\n' +
            '            <input type="file" name="file">\n' +
            '            <input type="submit" value="Upload">\n' +
            '        </form>\n' +
            '    </body>\n' +
            '</html>'
		);
    });


    // INFO : express 4.x : 드론 업로드
    fv.express_app.post('/drone/api/uploadfile', function (req, res) {
        var	tag = '[EXPRESS] API ' + req.route.path + ' : ';

        // parse a file upload
        // var form = new multiparty.Form();
        var form = new formidable.IncomingForm();

        form.uploadDir = gv.config.crm.site_httpd_base + '/uploads';

        form.parse(req, function(err, fields, files) {
            if (err) {
                res.send(200, {"ckError": "E000001"});
            }
            else {
                var filename = files.file.path;

                // 서버내 필드와 외부 접속 주소가 같지 않다.
                var moveFile = gv.config.crm.site_httpd_base + '/uploads/' + files.file.name;
                log.debug(tag + 'move file=' + moveFile);
                var wwwFile = '/uploads/' + files.file.name;

                fs.rename(filename, moveFile, function(err) {
                    if ( err ) {
                        res.status(200).send({"result": "ERROR"});
                    }
                    else {
                        res.status(200).send({"result": "OK", upload :  wwwFile,
							fields: fields, files: files});
                    }
                });
            }

            log.debug(tag + 'uploaded=' + gv.inspect({fields: fields, files: files}));
        });
    });



    // fv.express_app.post('/upload', function (req, res) {
    //     var	tag = '[EXPRESS] API ' + req.route.path + ' : ';
    //     req.form.on('progress', function(bytesReceived, bytesExpected) {
    //         log.debug(tag + ((bytesReceived / bytesExpected)*100) + "% uploaded");
    //     });
    //
    //     req.form.on('end', function() {
    //         log.debug(tag + req.files);
    //         res.send('{"result" : "ok"');
    //     });
    // });

/*
	fv.express_app.post('/api/v1/check-seckey', function (req, res) {
	
		var	tag = '[EXPRESS] API ' + req.route.path + ' : ';	 
		log.debug(tag + 'IP=' + req.ip + ', ' + gv.inspect(req.body));

		res.send(200, { result : 0 } );
	});
*/
	

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

