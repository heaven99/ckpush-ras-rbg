// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');

var redis = require('redis');
var _ = require('lodash');

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

// INFO : delete 거부 리스트
var sys_widgets = [
    'widget.console.terminal',
    'config.global.cronjob',
    'config.global.datas',

    'config.global.event-map',
    'config.global.load-controls',
    'config.console.event-map',

    'ui.console.usage-1',
];


if (_.find(sys_widgets, es.getUserData().data.key) < 0) {
    console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, { "result" : "NOT ALLOWED." }));
    gv.exit(0);
}


// INFO : Redis DB 를 선택한다.
redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
    if (error) {
        console.log('ERROR redis_configure:send_command:SELECT ');
        console.log('  +end of REDIS with ERROR');
    }
    else {
        redis_client.multi([
            ['rename', es.getUserData().data.key, 'trash.' + es.getUserData().data.key],
            ['expire', 'trash.' + es.getUserData().data.key, 1 * 3600],     // 한시간 보관
        ]).exec(function (error, result) {
            if (error) console.error('ERROR ras-hash-remove:multi(rename, expire)', result);

            console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
            gv.exit(0);
        });
    }
});
