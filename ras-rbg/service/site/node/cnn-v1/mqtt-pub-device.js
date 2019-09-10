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

    // es.getMqttData()
    // {
    //     "topic": "pub/00/00/002",
    //     "message": {
    //         "app_id": "002",
    //         "tid": 1562318936346,
    //         "ctime": 1562318936,
    //         "rt": "res",
    //         "et": "alive",
    //         "rc": "ok"
    //    }
    //  }

    var tokens = es.getMqttData().topic.split("/");
    var device_id = tokens[3];

    // TODO : check message.event type
    if (es.getMqttData().message) {
        var mqttMessage = es.getMqttData().message;
        //
        // alive 수신
        //
        if (mqttMessage.et === "alive") {
            // make status

            var lastcheck = parseInt(moment().format("x"));
            var term =  lastcheck - mqttMessage.ud.check;

            var con_status = "connect";     // 연결 상태
            if (term > 1000) {
                con_status = "delay-1000";
            }
            else if (term > 500) {
                // con_status = "delay-500";
            }

            //
            // TODO : lcheck 를 이용해서 별도의 히스토리 로그를 만든다.
            //
            es.setUIObject(redis_client, "cnn-v1", "device-status-" + device_id, {
                "lcheck" : lastcheck,
                "alive" : term,
                "status": con_status
            });

            console.log(es.makeNoAction());
            gv.exit(0);
        }
        //
        // device-message 수신
        //
        else if (mqttMessage.et === "device-message") {
            // 개별 메시지 라우팅
            // "ud":{"targets":["004"],"msg":{"type":1,"text":"hello world"}}}
            var mqttData;

            for (var i = 0; i < mqttMessage.ud.targets.length; i++) {
                // FOR report
                mqttData = {
                    "ai": "cnn-v1",
                    "ti": "T-" + moment().format("x"),
                    "t1": parseInt(moment().format("x")),
                    "rt": "rep",
                    "et": "device-message"
                };

                mqttData.ud = {};       // Targets 만 제외하고 나머지는 살린다.
                mqttData.ud.sender = mqttMessage.ud.sender;
                mqttData.ud.type = mqttMessage.ud.type;
                mqttData.ud.msg = mqttMessage.ud.msg;

                var pTopic = "sub/00/00/" + mqttMessage.ud.targets[i];
                es.publishTopicData(redis_client, "cnn-v1", pTopic, mqttData);
            }

            // 응답
            mqttData = {
                "ai": "cnn-v1",
                "ti": "T-" + moment().format("x"),
                "t1": parseInt(moment().format("x")),
                "rt": "res",
                "et": "device-message",
                "rc" : "0",
                "ac" : {
                    "action" : "none",
                    "data" : null
                },
                "ud" : null
            };

            var pTopic = "sub/00/00/" + device_id;
            console.log(es.makeActionToMQTT("cnn-v1", pTopic, "device-message", {
                "cmd" : "server-event",
                "mqtt_data" : mqttData
            }));



            gv.exit(0);
        }
        //
        // push-message 수신
        //
        else if (mqttMessage.et === "push-message") {
            // 개별 메시지 라우팅
            // "ud":{"targets":["004"],"msg":{"type":1,"text":"hello world"}}}
            var mqttData;

            // TODO : push message 는 사용자의 권한류의 체크를 추가하도록 한다.
            for (var i = 0; i < mqttMessage.ud.targets.length; i++) {
                // FOR report
                mqttData = {
                    "ai": "cnn-v1",
                    "ti": "T-" + moment().format("x"),
                    "t1": parseInt(moment().format("x")),
                    "rt": "rep",
                    "et": "push-message"
                };

                mqttData.ud = {};       // Targets 만 제외하고 나머지는 살린다.
                mqttData.ud.sender = mqttMessage.ud.sender;
                mqttData.ud.type = mqttMessage.ud.type;
                mqttData.ud.msg = mqttMessage.ud.msg;

                var pTopic = "sub/00/00/" + mqttMessage.ud.targets[i];
                es.publishTopicData(redis_client, "cnn-v1", pTopic, mqttData);

                // TODO : push message 에 대한 히스토리 처리를 한다.
            }

            // 응답
            mqttData = {
                "ai": "cnn-v1",
                "ti": "T-" + moment().format("x"),
                "t1": parseInt(moment().format("x")),
                "rt": "res",
                "et": "push-message",
                "rc" : "0",
                "ac" : {
                    "action" : "none",
                    "data" : null
                },
                "ud" : null
            };

            var pTopic = "sub/00/00/" + device_id;
            console.log(es.makeActionToMQTT("cnn-v1", pTopic, "push-message", {
                "cmd" : "server-event",
                "mqtt_data" : mqttData
            }));



            gv.exit(0);
        }
        else {
            console.log(es.makeNoAction());
            gv.exit(0);
        }
    }


    // if 가 끝나면 여기로 내려오기 때문에 여기서 죽으면 안된다.
    // console.log(es.makeNoAction());
    // gv.exit(0);
});

