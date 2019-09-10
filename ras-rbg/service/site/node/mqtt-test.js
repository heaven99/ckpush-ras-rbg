// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');

var redis = require('redis');

var gv = require('./inc/ras.config.js');
var es = require('./inc/ras.event-script.js')();

//////////////////////////////////////////////
//////// START SCRIPT
//////////////////////////////////////////////

es.init(process.argv[2]);


var redis_client = redis.createClient(gv.config.redis_server_port, gv.config.redis_server, {});

redis_client.on('error', function (error) {
    console.log('[REDIS] error Handler :' + error);
});

    var mqttData = {
        "ai": "cnn-v1",
        "ti": "t-123",
        "t1": 1394421768376,
        "rt": "res",
        "et": "connect",
        "rc" : "auth",
        "ac" : {
            "action" : "none"
        },
        "ud" : es.getUserData()
    };

    var mqttAck = {
        "cmd" : "server-event",
        "mqtt_data" : mqttData
    };

//
// {
//     "ai": "cnn-v1",
//     "ti": "t-123",
//     "t1": 1394421768376,
//     "et": "r-connect",
//     "rc": "auth",
//     "ac": {
//     "action": "none"
// },
//     "ud": {
//     "data": {
//         "topic": "$SYS/broker/ckpush_con_state/cnn_test",
//             "message": 1
//     },
//     "user_tag": {
//         "app_id": "ckpush",
//             "ssid": "MQTT",
//             "ip": "localhost",
//             "soc_id": "MQTT",
//             "member_srl": "_member_srl_"
//     }
// }
// }

    // TODO : data 분석
    var device_id = "001";



// INFO : Redis DB 를 선택한다.
redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
    if (error) {
        console.log('ERROR redis_configure:send_command:SELECT ');
        console.log('  +end of REDIS with ERROR');
    }
    else {
        es.setUIObject(redis_client, "cnn-v1", device_id, { "connect" : "auth", "f1": 1, "f2" : 2});

    }

    var pTopic = "sub/00/00/" + device_id;
    console.log(es.makeActionToMQTT("cnn-v1", pTopic, "test-event", mqttAck));

    gv.exit(0);
});


//
// var redis_client = redis.createClient(gv.config.redis_server_port, gv.config.redis_server, {});
//
// redis_client.on('error', function (error) {
//     console.log('[REDIS] error Handler :' + error);
// });
//
//
// // INFO : Redis DB 를 선택한다.
// redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
//     if (error) {
//         console.log('ERROR redis_configure:send_command:SELECT ');
//         console.log('  +end of REDIS with ERROR');
//     }
//     else {
//         redis_client.send_command('hdel', [es.getUserData().data.key, es.getUserData().data.model.keyName], function (error, result) {
//             if (error) console.error('ERROR ras-hash-remove', result);
//
//             console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
//             gv.exit(0);
//         });
//     }
// });
