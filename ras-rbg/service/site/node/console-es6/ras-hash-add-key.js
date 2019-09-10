"use strict";

var _arguments = arguments;

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _redis = require("redis");

var _redis2 = _interopRequireDefault(_redis);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ras = require("../inc-es6/ras.config");

var _ras2 = require("../inc-es6/ras.event-script");

var _ras3 = _interopRequireDefault(_ras2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//////////////////////////////////////////////
//////// START SCRIPT
//////////////////////////////////////////////
_bluebird2.default.promisifyAll(_redis2.default.RedisClient.prototype);
_bluebird2.default.promisifyAll(_redis2.default.Multi.prototype);

var es = new _ras3.default();
console.log('-----###########config', _ras.config);
process.exit(0);


es.init(process.argv[2]);

console.log('-----config', _ras.config);

var redis_client = _redis2.default.createClient(_ras.config.redis_server_port, _ras.config.redis_server, {});

redis_client.on('error', function (error) {
    console.log('[REDIS] error Handler :' + error);
});

redis_client.send_command('SELECT', [_ras.config.redis_db]).then(function () {

    console.log('-----then arguments length', _arguments.length);
}).catch(function (err) {

    console.log("-----error", err);
});

// // INFO : Redis DB 를 선택한다.
// redis_client.send_command('SELECT', [gv.config.redis_db], function (error, result) {
//     if (error) {
//         console.log('ERROR redis_configure:send_command:SELECT ');
//         console.log('  +end of REDIS with ERROR');
//     }
//     else {
//         redis_client.send_command('hset', [es.getUserData().data.key, '_ras_label', es.getUserData().data.text], function (error, result) {
//             if (error) console.error('ERROR ras-hash-add-key', result);
//
//             console.log(es.makeActionToUser(es.getAppId(), "r-ras-console", es.getUserData().user_tag.member_srl, {"result": "OK"}));
//             gv.exit(0);
//         });
//     }
// });
//
//# sourceMappingURL=ras-hash-add-key.js.map