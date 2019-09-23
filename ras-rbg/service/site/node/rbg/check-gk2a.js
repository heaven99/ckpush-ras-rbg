// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');
var moment  = require('moment');

var winston = require('winston');
var redis = require('redis');
var mysql = require('mysql');
var connection = null;


var exec = require('child_process').exec, child;

var gv = require('../inc/ras.config.js');
var es = require('../inc/ras.event-script.js')();

//////////////////////////////////////////////
//////// START SCRIPT
//////////////////////////////////////////////
var gk2a;
var gk2a_file;
var gk2a_last_min;

var logger = new (winston.Logger)({
    level: 'debug',
    transports: [
        new (winston.transports.File)({ filename: '/home/ckstack/ras/logs/escript.log' , json : false })
    ]
});

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


    // TODO : license 에서 정보를 읽는다.
    var main_db = {
        "host": "nas2.ckstack.com",
        "port": 23307,
        "database": "rainbird_db",
        "user": "rainbird_user",
        "password": "rainbird_pass"
    };

    // gv.config.log.info('  +[DB:MySQL] INFO=' + gv.inspect(main_db));

    connection = mysql.createConnection(main_db);

    connection.connect(function (err) {
        //INFO : err == null 이면 성공, else 면 오류
        if (err !== null) {
            console.log('ERROR mysql connect');
            gv.exit(0);
        }


        //// 9h 10m 이전시간 체크 (시스템 시간과 영향을 가진다.)
        gk2a = moment().subtract(9, 'h').subtract(10, 'm').format("YYYYMMDDHHmm");
        gk2a_last_min = gk2a.substr(gk2a.length - 1);
        var nc_done = false;

        // TODO : 매분 50초 정도에 수행할 예정임
        // 해당 시간대의 전체를 그냥 본다. (마지막 시간에 체크한 것을 오류로 본다.)
        if (gk2a_last_min == "0" || gk2a_last_min == "1" || gk2a_last_min == "2" || gk2a_last_min == "3" || gk2a_last_min == "4" ||
            gk2a_last_min == "5" || gk2a_last_min == "6" || gk2a_last_min == "7" || gk2a_last_min == "8" || gk2a_last_min == "9") {
            gk2a = gk2a.substring(0, gk2a.length - 1) + "0";        // 언제나 마지막 분은 '0' 으로 맞춘다.
            gk2a_file = "gk2a_ami_le1b_ir105_ea020lc_" + gk2a + ".nc";

            // DB 에서 nc 데이터 처리 정보를 확인한다.
            connection.query({
                    sql: 'SELECT * FROM `rbg_nc_file` ORDER BY seq DESC LIMIT 2',
                    timeout: 5000, // 5s
                }, function (error, nc_files, fields) {
                    if (error) {

                    }

                    logger.log('debug', 'db=' + JSON.stringify(nc_files));

                    if (nc_files[0].nc_time === gk2a) {
                        // 디비에 데이터가 있다.
                        if (nc_files[0].file === "none") {
                            logger.log('debug', gk2a + ' NC time is found in DB. but, nc file is not received. check again!' );

                            check_nc_file();
                        }
                        // 실제로는 algo 까지 체크해야 한다.
                        else if (nc_files[0].file === "received") {
                            logger.log('debug', gk2a + ' NC time already processed.' );

                            exit_script(100);
                        }
                    }
                    // 디비에 아예 없으면..
                    else {
                        //  INSERT INTO
                        logger.log('debug', gk2a + ' NC time is not found in DB. insert new nc file data.' );

                        var data  = {
                            seq : null,
                            nc_time : gk2a,
                            file : "none",
                            algo : "none",
                            check_time1 : moment().format("YYYYMMDDHHmmss")
                        };
                        var query = connection.query('INSERT INTO rbg_nc_file SET ?', data, function (error, results, fields) {
                            if (error) throw error;

                            logger.log('debug', 'DB INSERT ' + gk2a + ' time data :' + JSON.stringify(data));

                            check_nc_file();
                        });
                    }
                });
        }
        else {
            //
        }
    });
});




var check_nc_file = function () {
    var check_file = false;

    // INFO : check file exist
    var base_path = "/home/kma/gk2a/";
    if (fs.existsSync(base_path + gk2a_file)) {
        check_file = true;
    }

    // TODO : 일단은 디비를 보지 않고, 화일만 본다. (개발 편의)

    // Console UI 적인 처리임
    // 화일 전송이 되어 있으면,
    if (check_file) {
        logger.log('debug', gk2a + ' nc file is received.' );

        var query = connection.query('UPDATE rbg_nc_file SET file = ? WHERE nc_time = ?', ["received", gk2a], function (error, results, fields) {
            if (error) throw error;

            logger.log('debug', 'DB UPDATE ' + gk2a + ' time data');

            //
            // TODO: run algo.
            //
            logger.log('debug', '(TODO) RUN algo !!');

            run_algorithm(function () {
                logger.log('debug', '(TODO) algo end');

                exit_script(0);
            });
        });
    }
    // 화일 전송이 안 되었으면
    else {
        logger.log('debug', gk2a + ' nc file is not received. yet' );

        // 마지막 시간에도 도착이 안되었으면 ...
        if (gk2a_last_min == "9") {
            var query = connection.query('UPDATE rbg_nc_file SET file = ? WHERE nc_time = ?', ["failed", gk2a], function (error, results, fields) {
                if (error) throw error;

                logger.log('debug', 'DB UPDATE ' + gk2a + ' time data failed!');

                logger.log('debug', gk2a + ' nc file receiving failed!!' );
                exit_script(109);
            });
        }
        else {
            ;

            exit_script(0);
        }
    }
}



var run_algorithm = function (next_function) {
    //
    // 프로그램 실행
    var run_path = '/home/ckstack/';
    var run_script = run_path + 'test.sh';
    var run_param = gk2a_file;

    // log.debug('[EVENT-SCRIPT] run_script=' + run_script);

    var run_result = '';
    child = exec(run_script + " '" + run_param + "'", { cwd : run_path, maxBuffer: 1024 * 500 }, function(error, stdout, stderr) {
        if (error !== null) {
            // error: [EVENT-SCRIPT] exec error:/bin/sh: 1: ras-noaction: not found
            logger.log('debug', '[EVENT-SCRIPT] exec error:stderr=' + stderr + ', sys error=' + JSON.stringify(error) + ', run script=' + run_script + ', param=' +  run_param);
        }
        // 성공이면 결과 처리를 호출한다.
        else {
            logger.log('debug', '[EVENT-SCRIPT] exec success:stdout=\n' + stdout);
        }

        // call back
        next_function();

        //
        // //
        // // 실제 데이터 처리 시도
        // redis_client.send_command('hgetall', ["ui.rbg.gk2a-check"], function (error, result) {
        //     if (error) {
        //         console.log('-----err', error);
        //     }
        //     else {
        //         var mqttData = {
        //             "ai": "rbg-v1",
        //             "ti": "A-" + moment().format("x"),
        //             "rt": "rpt",
        //             "et": "check-gk2a",
        //             "ud": {
        //                 "gk2a-file": gk2a_file,
        //                 "gk2a-time": gk2a,
        //                 "check-time": moment().format("YYYYMMDD HHmmss"),
        //                 "file" : result["file"],
        //                 "algo" : result["algo"],
        //                 "run_result" : run_result
        //             },
        //         };
        //
        //         var pTopic = "sub/00/AA/FF";
        //         console.log(es.makeActionToMQTT("rbg-v1", pTopic, "event-check-gk2a", {
        //             "cmd" : "server-event",
        //             "mqtt_data" : mqttData
        //         }));
        //
        //         // TODO : device last check 를 조사해서 일정시간 이상 지난 (응답이 없는)
        //         // TODO : device 에 대해서 상태 변화를 체크하도록 한다.
        //     }
        //
        //     gv.exit(0);
        // });
    });

}


var exit_script = function (code) {
    logger.log('debug', 'exit script : ' + code);

    setTimeout(function() {
        gv.exit(0);
    }, 1000);
}