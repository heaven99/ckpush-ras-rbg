"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ras = require("./ras.config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RasEventScript = function () {
    function RasEventScript() {
        (0, _classCallCheck3.default)(this, RasEventScript);

        this.input = "";
        this.objectIn = null;
        this.rc = "0";
    }

    (0, _createClass3.default)(RasEventScript, [{
        key: "init",
        value: function init(param_in) {
            // $this->mInput = str_replace("@#1#@", "'", $input);		// shell script 에서 ' 를 처리하지 못하므로, encoding 한것을 decoding 한다.
            this.input = param_in.replace(/@#1#@/g, "'");
            //console.log('@@input=', input);
            /* script input object
                    {
                        "app_id": "admin",
                        "tid": "1394516074955_3237",
                        "ctime": 1394516074,
                        "et": "event-test",
                        "ud": {
                            "data": {
                                "_t": "MANAGE",
                                "_cmd": "user test"
                            },
                            "user_tag": {
                                "app_id": "admin",
                                "ssid": "authorized",
                                "ip": "112.216.155.226",
                                "soc_id": "qzOTdJsPfKTq0cngMNHJ",
                                "member_srl": 0
                            }
                        }
                    }
            */
            this.objectIn = JSON.parse(this.input);
            if (!this.objectIn) {
                this.rc = "-5100";
            }

            return this.rc;
        }
    }, {
        key: "getAppId",
        value: function getAppId() {
            return this.objectIn.app_id;
        }
    }, {
        key: "getTid",
        value: function getTid() {
            return this.objectIn.tid;
        }
    }, {
        key: "getCtime",
        value: function getCtime() {
            return this.objectIn.ctime;
        }
    }, {
        key: "getEventType",
        value: function getEventType() {
            return this.objectIn.et;
        }
    }, {
        key: "getUserData",
        value: function getUserData() {
            return this.objectIn.ud;
        }
    }, {
        key: "makeNoAction",
        value: function makeNoAction(debug) {
            if (debug) {
                return (0, _stringify2.default)({
                    "action": "ACTION_NONE",
                    "_ras_debug": debug
                });
            }

            return (0, _stringify2.default)({
                "action": "ACTION_NONE"
            });
        }
    }, {
        key: "makeErrorAction",
        value: function makeErrorAction(error) {
            return (0, _stringify2.default)({
                "action": "ACTION_ERROR",
                "_ras_error": error
            });
        }
    }, {
        key: "makeActionToUser",
        value: function makeActionToUser(app_id, event_type, to_uid, user_data) {
            // TODO : 2017.12.01, 아래부분 자신의 함수를 호출하는 방법에 대해서 알아볼 것.
            // var result = {
            //     "app_id": app_id,		// default 로 간다.
            //     "et": event_type,		//
            //     "ud": _.extend({
            //         "action": "ACTION_TO_USER",
            //         "to_uid": to_uid,
            //         "member_srl": _this.Module.getUserData().user_tag.member_srl
            //     }, user_data),
            //     "tid": getTid(),
            //     "ctime": getCtime(),
            // };

            var result = {
                "app_id": app_id, // default 로 간다.
                "et": event_type, //
                "ud": _underscore2.default.extend({
                    "action": "ACTION_TO_USER",
                    "to_uid": to_uid,
                    "member_srl": this.objectIn.ud.user_tag.member_srl
                }, user_data),
                "tid": this.objectIn.tid,
                "ctime": this.objectIn.ctime
            };

            return (0, _stringify2.default)(result);
        }
    }, {
        key: "makeActionToMQTT",
        value: function makeActionToMQTT(app_id, topic, event_type, user_data) {
            var result = {
                "app_id": app_id, // default 로 간다.
                "et": event_type, //
                "ud": _underscore2.default.extend({
                    "action": "ACTION_TO_MQTT",
                    "member_srl": this.objectIn.ud.user_tag.member_srl
                }, user_data),
                "tid": this.objectIn.tid,
                "ctime": this.objectIn.ctime
            };

            return (0, _stringify2.default)(result);
        }
    }, {
        key: "removeKey",
        value: function removeKey(credis, key_name) {
            credis.send_command('del', [key_name], function (error, result) {
                if (error) console.error('ERROR model.front-connection:change:(NOT defined,disconnect):del:' + key_name);
            });
        }
    }, {
        key: "removeKeyPro",
        value: function removeKeyPro(credis, key_name) {
            return new _bluebird2.default(function (resolve, reject) {
                credis.send_command('del', [key_name], function (error, result) {
                    if (error) {
                        console.error('ERROR model.front-connection:change:(NOT defined,disconnect):del:' + key_name);
                        return reject(error);
                    }

                    resolve(result);
                });
            });
        }
    }, {
        key: "pushEventQueue",
        value: function pushEventQueue(credis, app_id, event_type, user_data) {
            var qdata = {
                "app_id": app_id, // default 로 간다.
                "pid": "ES",
                "et": event_type, //
                "tid": this.objectIn.tid,
                "ctime": this.objectIn.ctime,
                "ud": user_data
            };

            // note 원본의 key_name 이 어디서 가져오는지 없다. 오류 발생 할듯
            credis.send_command('rpush', [key_name, (0, _stringify2.default)(qdata)], function (error, result) {
                // note 원본이 gv.inspect 인데....gv는 어디서 나왔나? 일단 config 의 inspect 를 사용 한다.
                if (error) console.error('ERROR RPUSH' + key_name + (0, _ras.inspect)(error));
            });
        }
    }, {
        key: "pushEventQueuePro",
        value: function pushEventQueuePro(credis, app_id, event_type, user_data) {
            var qdata = {
                "app_id": app_id, // default 로 간다.
                "pid": "ES",
                "et": event_type, //
                "tid": this.objectIn.tid,
                "ctime": this.objectIn.ctime,
                "ud": user_data
            };

            return new _bluebird2.default(function (resolve, reject) {
                // note 원본의 key_name 이 어디서 가져오는지 없다. 오류 발생 할듯
                credis.send_command('rpush', [key_name, (0, _stringify2.default)(qdata)], function (error, result) {
                    // note 원본이 gv.inspect 인데....gv는 어디서 나왔나? 일단 config 의 inspect 를 사용 한다.
                    if (error) {
                        console.error('ERROR RPUSH' + key_name + (0, _ras.inspect)(error));
                        return reject(error);
                    }

                    resolve(result);
                });
            });
        }

        // TODO : 2017.12.01, 포팅 작업 2순위
        // function pushDelayedEvent ($credis, $app_id, $event_type, $user_data, $delay_sec) {
        //     $key_name = 'post.' . $app_id . '.' . $event_type . '.' . $user_data;
        //
        //     // TODO : 이미 key 가 있다면, 다시 설정하지 않고, 별도의 알고리즘을 가져야한다.
        //     // 1. 그냥 스킵해서 최초부터 10초 형태
        //     // 2. 지속적인 업데이트로 최종부터 10초 형태
        //     // 3. 특정한 스킴으로 시간을 조금씩 늘려서 최종적으로는 더 이상 연기되지 않아서 호출이 되는 형태
        //
        //     $ret = $credis->redis->multi()
        // ->set($key_name, "10")
        // ->expire($key_name, $delay_sec)
        // ->exec();
        // },

    }, {
        key: "getUIObjectName",
        value: function getUIObjectName(app_id, object_name) {
            return "ui." + app_id + "." + object_name;
        }

        //
        // for redis functions
        //

    }, {
        key: "getUIObject",
        value: function getUIObject(credis, app_id, object_name, next_function) {
            // TODO : var key_name = $this->getUIObjectName($app_id, $object_name);
            var key_name = "ui." + app_id + "." + object_name;

            credis.send_command('hgetall', [key_name], function (error, result) {
                if (error) console.error('ERROR model.ui-object:hgetall', error);

                //log.debug('@@' + gv.inspect(result));
                next_function(error, result);
            });
        }
    }, {
        key: "getUIObjectField",
        value: function getUIObjectField(credis, app_id, object_name, field, next_function) {
            // TODO : var key_name = $this->getUIObjectName($app_id, $object_name);
            var key_name = "ui." + app_id + "." + object_name;

            credis.send_command('hget', [key_name, field], function (error, result) {
                if (error) console.error('ERROR model.ui-object:hget', error);

                //log.debug('@@' + gv.inspect(result));
                next_function(error, result);
            });
        }

        // INFO : UI object 를 직접 설정한다.
        // -ui object name = 'ui.' + app_id . object_name
        // -필드에 .ctime 이 추가된다.
        //

    }, {
        key: "setUIObject",
        value: function setUIObject(credis, app_id, object_name, user_object) {
            var key_name = "ui." + app_id + "." + object_name,
                data = _underscore2.default.extend(user_object, { _ctime: (0, _moment2.default)().unix() });

            credis.send_command('hmset', [key_name, data], function (error, result) {
                if (error) console.error('ERROR hmset:', result);

                // TODO : check next func
            });
        }
    }, {
        key: "setUIObjectPro",
        value: function setUIObjectPro(credis, app_id, object_name, user_object) {
            var key_name = "ui." + app_id + "." + object_name,
                data = _underscore2.default.extend(user_object, { _ctime: (0, _moment2.default)().unix() });

            return new _bluebird2.default(function (resolve, reject) {
                credis.send_command('hmset', [key_name, data], function (error, result) {
                    if (error) {
                        console.error('ERROR hmset:', result);
                        return reject(error);
                    }

                    resolve(result);

                    // TODO : check next func
                });
            });
        }
    }, {
        key: "setUIObjectField",
        value: function setUIObjectField(credis, app_id, object_name, field, value) {
            var key_name = "ui." + app_id + "." + object_name,
                data = [];

            data[field] = value;

            credis.send_command('hmset', [key_name, data], function (error, result) {
                if (error) console.error('ERROR hmset:', result);

                // TODO : check next func
            });
        }
    }, {
        key: "removeUIObject",
        value: function removeUIObject(credis, app_id, object_name) {
            var key_name = "ui." + app_id + "." + object_name;

            credis.send_command('del', [key_name], function (error, result) {
                if (error) console.error('ERROR del:', result);

                // TODO : check next func
            });
        }
    }, {
        key: "expireUIObject",
        value: function expireUIObject(credis, app_id, object_name, expire) {
            var key_name = "ui." + app_id + "." + object_name;

            credis.send_command('del', [key_name, expire], function (error, result) {
                if (error) console.error('ERROR expire:', result);

                // TODO : check next func
            });
        }
    }, {
        key: "getConfigObjectName",
        value: function getConfigObjectName(app_id, object_name) {
            return "config." + app_id + "." + object_name;
        }
    }, {
        key: "getConfigObject",
        value: function getConfigObject(credis, app_id, object_name, next_function) {
            var key_name = "config." + app_id + "." + object_name;

            credis.send_command('hgetall', [key_name], function (error, result) {
                if (error) console.error('ERROR model.ui-object:hgetall', error);

                //log.debug('@@' + gv.inspect(result));
                next_function(error, result);
            });
        }
    }]);
    return RasEventScript;
}();

exports.default = RasEventScript;
//# sourceMappingURL=ras.event-script.js.map