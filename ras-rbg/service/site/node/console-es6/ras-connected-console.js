// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');

var redis = require('redis');
var _ = require('lodash');
var async = require("async");

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


redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
    if (error) {
        console.log('ERROR redis_configure:send_command:SELECT ');
        console.log('  +end of REDIS with ERROR');
    }
});

//
// Redis 는 그냥 순차가 지원된다.
//

 // 그냥 지랄 코드다.
var keys_object = [];

redis_client.send_command('keys', ['widget.*'], function (error, result) {
    if (error) {
        ;
    }
    else {
        keys_object = _.concat(keys_object, result);

        redis_client.send_command('keys', ['config.*'], function (error, result) {
            if (error) {
                ;
            }
            else {
                keys_object = _.concat(keys_object, result);

                redis_client.send_command('keys', ['ui.*'], function (error, result) {
                    if (error) {
                        ;
                    }
                    else {
                        keys_object = _.concat(keys_object, result);
                        // TODO : 2017.12.04, sort 가 있으면 좋긴하다.
                        // _.sortBy(keys_object, ['user', 'age']);

                        var count = 0;
                        var status_data = {};
                        async.during(
                            function (callback) {
                                return callback(null, count < keys_object.length);
                            },
                            function (callback) {
                                //console.log('-----count=' + count + ', command=' + keys_object[count]);

                                redis_client.send_command('hgetall', [keys_object[count]], function (error, result) {
                                    if (error) {
                                        console.log('-----err', param1);
                                    }

                                    //console.log('-----result=', result);

                                    status_data[keys_object[count]] = result;
                                    //_.merge(status_data, result);

                                    count++;
                                    callback();
                                });
                            },
                            function (err) {
                                //console.log('######### end of for loop:', status_data);
                                // 5 seconds have passed

                                // key object 생성
                                var data_object = {};
                                for (var i = 0; i < keys_object.length; i++) {
                                    data_object[keys_object[i]] = keys_object[i];
                                }

                                var extra_object = {};
                                for (var i = 0; i < keys_object.length; i++) {
                                    extra_object[keys_object[i]] = [];
                                }

                                var user_data = {
                                    "status": {
                                        "type": "key",
                                        "data": data_object,
                                        "hash": status_data,
                                        "extra": extra_object,
                                        "desc": "미정",
                                    }
                                };

                                console.log(es.makeActionToUser(es.getAppId(), "ras-data-init", es.getUserData().user_tag.member_srl, user_data));
                                gv.exit(0);
                            }
                        );
                    }
                });
            }
        });
    }
});





// // INFO : Redis DB 를 선택한다.
// redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
//     if (error) {
//         console.log('ERROR redis_configure:send_command:SELECT ');
//         console.log('  +end of REDIS with ERROR');
//     }
//     else {
//         redis_client.multi([
//             ['rename', es.getUserData().data.key, 'trash.' + es.getUserData().data.key],
//             ['expire', 'trash.' + es.getUserData().data.key, 1 * 3600],     // 한시간 보관
//         ]).exec(function (error, result) {
//             if (error) console.error('ERROR ras-hash-remove:multi(rename, expire)', result);
//
//             console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
//             gv.exit(0);
//         });
//     }
// });
