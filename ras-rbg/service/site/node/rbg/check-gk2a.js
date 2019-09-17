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

    //// 8h 50m 이전시간 체크 (시스템 시간과 영향을 가진다.)
    var gk2a = moment().subtract(8, 'h').subtract(50, 'm').format("YYYYMMDDHHmm");
    var gk2a_last_min = gk2a.substr(gk2a.length - 1);

    // gk2a = gk2a.substring(0, gk2a.length - 1) + "0";     // 언제나 마지막 분은 '0' 으로 맞춘다.

    var check_file = false;
    // 0, 1, 2, 3, 4 분에 전송된 것만 의미를 가진다.
    if (gk2a_last_min == "0" || gk2a_last_min == "1" || gk2a_last_min == "2" || gk2a_last_min == "3" || gk2a_last_min == "4") {
        gk2a = gk2a.substring(0, gk2a.length - 1) + "0";
        var gk2a_file = "gk2a_ami_le1b_ir105_ea020lc_" + gk2a + ".nc";

        // INFO : check file exist
        var base_path = "/home/kma/gk2a/";
        if (fs.existsSync(base_path + gk2a_file)) {
            check_file = true;
        }

        // TODO : 일단은 디비를 보지 않고, 화일만 본다. (개발 편의)

        // Console UI 적인 처리임
        // 화일 전송이 되어 있으면,
        if (check_file) {
            es.setUIObject(redis_client, "rbg", "gk2a-check", {
                "_ras_label" : "gk2a file status",
                "chk-file": gk2a_file,
                "chk-time": gk2a,
                "file" : "received",        // 화일전송
                "algo" : "none",           // 알고리즘 처리
            });
        }
        // 화일 전송이 안 되었으면
        else {
            es.setUIObject(redis_client, "rbg", "gk2a-check", {
                "_ras_label" : "gk2a file status",
                "chk-file": gk2a_file,
                "chk-time": gk2a,
                "file" : "none",
                "algo" : "none",
            });
        }


        // 실제 데이터 처리 시도
        redis_client.send_command('hgetall', ["ui.rbg.gk2a-check"], function (error, result) {
            if (error) {
                console.log('-----err', error);
            }
            else {
                var mqttData = {
                    "ai": "rbg-v1",
                    "ti": "A-" + moment().format("x"),
                    "rt": "rpt",
                    "et": "check-gk2a",
                    "ud": {
                        "gk2a-file": gk2a_file,
                        "gk2a-time": gk2a,
                        "check-time": moment().format("YYYYMMDD HHmmss"),
                        "file" : result["file"],
                        "algo" : result["algo"]
                    },
                };

                var pTopic = "sub/00/AA/FF";
                console.log(es.makeActionToMQTT("rbg-v1", pTopic, "event-check-gk2a", {
                    "cmd" : "server-event",
                    "mqtt_data" : mqttData
                }));

                // TODO : device last check 를 조사해서 일정시간 이상 지난 (응답이 없는)
                // TODO : device 에 대해서 상태 변화를 체크하도록 한다.
            }

            gv.exit(0);
        });
    }
    else {
        // TODO : 그냥 오류처리로 빠진다.
        es.setUIObject(redis_client, "rbg", "gk2a-check-trash", {
            "_ras_label" : "gk2a file trash",
            "chk-time": gk2a,
        });

        gv.exit(0);
    }
});

