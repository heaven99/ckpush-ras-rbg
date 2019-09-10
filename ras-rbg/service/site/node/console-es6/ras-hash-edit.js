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
        if (es.getUserData().data.edit.keyName) {
            redis_client.multi([
                ['hdel', es.getUserData().data.key, es.getUserData().data.model.keyName],
                ['hset', es.getUserData().data.key, es.getUserData().data.edit.keyName, es.getUserData().data.model.keyValue],
            ]).exec(function (error, result) {
                if (error) console.error('ERROR ras-hash-edit:multi(hdel, hset)', result);

                console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
                gv.exit(0);
            });
        }
        else if (es.getUserData().data.edit.keyValue) {
            redis_client.send_command('hset', [es.getUserData().data.key, es.getUserData().data.model.keyName, es.getUserData().data.edit.keyValue], function (error, result) {
                if (error) console.error('ERROR ras-hash-edit:hset', result);

                console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
                gv.exit(0);
            });
        }
    }
});
