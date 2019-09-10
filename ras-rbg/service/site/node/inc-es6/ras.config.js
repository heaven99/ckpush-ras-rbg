"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.config = exports.inspect = exports.exit = undefined;

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exit = exports.exit = function exit(ecode) {
    return process.exit(ecode);
};

var inspect = exports.inspect = function inspect(data) {
    return (0, _stringify2.default)(data);
};

var config = exports.config = {
    // MySQL DB ADMIN (MASTER)
    // CKPUSH - DEV DBUSER

    db_user: 'ckpush_user',
    db_pass: 'uWyEaUs4uQ7Ayc',
    db_name: 'ckpush_db',

    // REDIS for EVENT
    redis_server: '127.0.0.1',
    redis_server_port: 6379,
    redis_db: 5,

    redis_data_server: '127.0.0.1',
    redis_data_server_port: 6379,
    redis_data_db: 6,

    // MONGO DB
    mongo_server: 'mongodb://localhost:27017'
};
//# sourceMappingURL=ras.config.js.map