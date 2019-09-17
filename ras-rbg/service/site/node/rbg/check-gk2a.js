// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');
var moment  = require('moment');

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

        // TODO :
        gv.exit(0);
    }

    var gk2a = moment().subtract(8, 'h').subtract(50, 'm').format("YYYYMMDDHHmm");
    gk2a = gk2a.substring(0, gk2a.length - 1) + "0";

    var mqttData = {
        "ai": "rbg-v1",
        "ti": "A-" + moment().format("x"),
        "t1": parseInt(moment().format("x")),
        "rt": "rpt",
        "et": "check-gk2a",
        "ud" : {
            "gk2a-file" : "gk2a_ami_le1b_ir105_ea020lc_" + gk2a + ".nc",
            "gk2a-time" : gk2a,
            "check-time" : moment().format("YYYYMMDD HHmm")
        },
    };


    var pTopic = "sub/00/AA/FF";
    console.log(es.makeActionToMQTT("rbg-v1", pTopic, "event-check-gk2a", {
        "cmd" : "server-event",
        "mqtt_data" : mqttData
    }));



    // TODO : device last check 를 조사해서 일정시간 이상 지난 (응답이 없는)
    // TODO : device 에 대해서 상태 변화를 체크하도록 한다.



    gv.exit(0);
});

