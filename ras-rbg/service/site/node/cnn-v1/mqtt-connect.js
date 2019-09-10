// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');
var moment  = require('moment');

var redis = require('redis');

var async = require('async');


var gv = require('../inc/ras.config.js');
var es = require('../inc/ras.event-script.js')();

//////////////////////////////////////////////
//////// START SCRIPT
//////////////////////////////////////////////

var selectDeviceStatus = function(device_id, callback) {
    redis_client.send_command('hgetall', ["ui.cnn-v1.device-status-" + device_id], function (error, result) {
        if (error) {
            console.log('-----err', param1);
        }

        delete result["_ras_label"];

        callback(error, result);
    });
}


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

    // es.getMqttData()
    // {
    //     "topic": "$SYS/broker/ckpush_con_state/010",
    //     "message": 1
    // }

    var tokens = es.getMqttData().topic.split("/");
    var device_id = tokens[3];

    // make status
    var con_status;     // 연결 상태
    if (es.getMqttData().message == 1) {
        con_status = "connect";
    }
    else {
        con_status = "disconnect";
    }


    //
    // TODO : disconnect 일 경우에는 아래 정보를 내려줄 이유가 없다. (현재로서는 그냥 다 한다.)
    //
    var user_data = {};
    redis_client.send_command('hgetall', ["config.cnn-v1.devices"], function (error, result) {
        if (error) {
            console.log('-----err', param1);
            // TODO exit
        }

        //console.log('-----result=', result);

        var devices_all = result;
        delete devices_all["_ras_label"];


        var user_data = {};
        user_data.devices = Object.keys(devices_all).map(function(key) {
            return [key, devices_all[key]];
        });

        async.times(user_data.devices.length, function(n, next) {
            var did = user_data.devices[n][0];      // get device id (for local)

            selectDeviceStatus(did, function(err, data) {
                if (device_id === did) data.status = con_status;    // 자기 자신은 접속 최신 상태를 반영한다.
                user_data[did] = data;    // set global data

                next(err, data);
            });
        }, function (err, datas) {
            var action = "none";
            var ac_data = null;
            var rc = (devices_all[device_id]) ? devices_all[device_id] : "unknown";

            if (rc !== "auth") {
                action = "disconnect";
                ac_data = "now"
            }

            var mqttData = {
                "ai": "cnn-v1",
                "ti": "T-" + moment().format("x"),
                "t1": parseInt(moment().format("x")),
                "rt": "res",
                "et": "connect",
                "rc" : rc,
                "ac" : {
                    "action" : action,
                    "data" : ac_data
                },
                "ud" : user_data
            };



            var pTopic = "sub/00/00/" + device_id;
            console.log(es.makeActionToMQTT("cnn-v1", pTopic, "connect", {
                "cmd" : "server-event",
                "mqtt_data" : mqttData
            }));


            // UI Object update
            es.setUIObject(redis_client, "cnn-v1", "device-status-" + device_id, {
                "_ras_label" : "디바이스 " + device_id + " 상태",
                "license" : "auth",
                "status": con_status
            });


            // TODO : 디바이스 상태를 별도로 빼는 것 고려할 것
            // FOR report
            mqttData = {
                "ai": "cnn-v1",
                "ti": "T-" + moment().format("x"),
                "t1": parseInt(moment().format("x")),
                "rt": "rep",
                "et": "device-status-change"
            };

            // user_data[device_id].status = con_status;       // 최신 상태를 그냥 업데이트한다.
            mqttData.ud = {};
            mqttData.ud[device_id] = user_data[device_id];

            var pTopic = "sub/00/AA/FF";
            es.publishTopicData(redis_client, "cnn-v1", pTopic, mqttData);


            gv.exit(0);
        });
    });
});

