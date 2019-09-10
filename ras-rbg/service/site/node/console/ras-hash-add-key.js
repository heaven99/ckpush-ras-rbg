// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');

var redis = require('redis');

var gv = require('../inc/ras.config.js');
var es = require('../inc/ras.event-script.js')();

//////////////////////////////////////////////
//////// START SCRIPT
//////////////////////////////////////////////

es.init(process.argv[2]);


var redis_client = redis.createClient(gv.config.redis_server_port, gv.config.redis_server, {});

redis_client.on('error', function (error) {
    console.log('[REDIS] error Handler :' + error);
});


// INFO : Redis DB 를 선택한다.
redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
    if (error) {
        console.log('ERROR redis_configure:send_command:SELECT ');
        console.log('  +end of REDIS with ERROR');
    }
    else {
        redis_client.send_command('hset', [es.getUserData().data.key, '_ras_label', es.getUserData().data.text], function (error, result) {
            if (error) console.error('ERROR ras-hash-add-key', result);

            console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
            gv.exit(0);
        });
    }
});
