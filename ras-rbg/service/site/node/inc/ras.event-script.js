/**
 * ckpush-ras
 * 
 * Copyright(C) 2017 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 * 
 * -----------------------------------------------------------
 * @file : ras.event-script.js
 * @version : 4.0.0
 * @notes
 *
 */
/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function () {
	var moment  = require('moment');
	var os = require('os');
    var _ = require('lodash');

	var input = "";
	var objectIn = null;
	var rc = "0";

	var parse_schedule = function (data) {

	};


    var Module = {
		// {"app_id":"console","tid":"1511438292833_9526","ctime":1511438292,"et":"node-connect","ud":{"data":{"_t":"ras-command","_cmd":"event console node-connect"},"user_tag":{"app_id":"console","ssid":"_ssid_","ip":"_ip_","soc_id":"EVHxVjwo1xo4BLSj3kfjBA==","member_srl":"_user_uuid_"}}}
        init : function (param_in) {
            // $this->mInput = str_replace("@#1#@", "'", $input);		// shell script 에서 ' 를 처리하지 못하므로, encoding 한것을 decoding 한다.
            input = param_in.replace(/@#1#@/g, "'");
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
            objectIn = JSON.parse(input);
			if (!objectIn) {
                rc = "-5100";
			}

            return rc;
        },


        getAppId : function() {
        	return objectIn.app_id;
    	},

    	getTid : function() {
        	return objectIn.tid;
    	},

    	getCtime : function() {
	        return objectIn.ctime;
    	},

		getEventType : function() {
        	return objectIn.et;
    	},

    	getUserData : function() {
        	return objectIn.ud;
    	},

        getMqttData: function() {
            return objectIn.ud.data;
        },

        getRequest : function() {
            return objectIn;
        },


        makeNoAction : function  (debug) {
        	if (debug) {
                return JSON.stringify({
                    "action" :"ACTION_NONE",
                    "_ras_debug" : debug
                });

			}
			else {
        		return JSON.stringify({
                    "action" :"ACTION_NONE"
				});
			}
        },


        makeErrorAction : function  (error) {
            return JSON.stringify({
                "action" :"ACTION_ERROR",
                "_ras_error" : error
            });
        },


        makeActionToUser : function (app_id, event_type, to_uid, user_data) {
            // TODO : 2017.12.01, 아래부분 자신의 함수를 호출하는 방법에 대해서 알아볼 것.
            // var result = {
            //     "app_id": app_id,		// default 로 간다.
            //     "et": event_type,		//
            //     "ud": _.merge({
            //         "action": "ACTION_TO_USER",
            //         "to_uid": to_uid,
            //         "member_srl": _this.Module.getUserData().user_tag.member_srl
            //     }, user_data),
            //     "tid": getTid(),
            //     "ctime": getCtime(),
            // };

            var result = {
                "app_id": app_id,		// default 로 간다.
                "et": event_type,		//
                "ud": _.merge({
                    "action": "ACTION_TO_USER",
                    "to_uid": to_uid,
                    "member_srl": objectIn.ud.user_tag.member_srl,
                }, user_data),
                "tid": objectIn.tid,
                "ctime": objectIn.ctime,
            };

            return JSON.stringify(result);
        },



        makeActionToBroadcast : function (app_id, event_type, user_data) {
            var result = {
                "app_id": app_id,		// default 로 간다.
                "et": event_type,		//
                "ud": _.merge({
                    "action": "ACTION_TO_BROADCAST",
                    "member_srl": objectIn.ud.user_tag.member_srl,
                }, user_data),
                "tid": objectIn.tid,
                "ctime": objectIn.ctime,
            };

            return JSON.stringify(result);
        },




        makeActionToMQTT : function (app_id, topic, event_type, user_data) {
            var result = {
                "app_id": app_id,		// default 로 간다.
                "topic" : topic,        // 발송할 topic 정보를 준다.
                "et": event_type,		//
                "ud": _.merge({
                    "action": "ACTION_TO_MQTT",
                    "member_srl": (objectIn.ud && objectIn.ud.tag) ? objectIn.ud.user_tag.member_srl : null,
                }, user_data),
                "tid": objectIn.tid,
                "ctime": objectIn.ctime,
            };

            return JSON.stringify(result);
        },


        removeKey : function (credis, key_name) {
            credis.send_command('del', [key_name], function (error, result) {
                if (error) console.error('ERROR model.front-connection:change:(NOT defined,disconnect):del:' + key_name);
            });
        },


        pushEventQueue : function (credis, app_id, event_type, user_data) {
            var qdata = {
                "app_id": app_id,		// default 로 간다.
                "pid" : "ES",
                "et": event_type,		//
                "tid": objectIn.tid,
                "ctime": objectIn.ctime,
                "ud": user_data,
            };


            credis.send_command('rpush', ['queue.event', JSON.stringify(qdata)], function (error, result) {
                if (error) console.error('ERROR RPUSH' + key_name + gv.inspect(error));
            });
        },


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



        getUIObjectName : function (app_id, object_name) {
            var key_name = 'ui.' + app_id + '.' + object_name;

            return key_name;
        },


        //
        // for redis functions
        //
        getUIObject : function (credis, app_id, object_name, next_function) {
            // TODO : var key_name = $this->getUIObjectName($app_id, $object_name);
            var key_name = 'ui.' + app_id + '.' + object_name;

            credis.send_command('hgetall', [key_name], function (error, result) {
                if (error) console.error('ERROR model.ui-object:hgetall', error);

                //log.debug('@@' + gv.inspect(result));
                next_function(error, result);
            });
        },

        getUIObjectField : function (credis, app_id, object_name, field, next_function) {
            // TODO : var key_name = $this->getUIObjectName($app_id, $object_name);
            var key_name = 'ui.' + app_id + '.' + object_name;

            credis.send_command('hget', [key_name, field], function (error, result) {
                if (error) console.error('ERROR model.ui-object:hget', error);

                //log.debug('@@' + gv.inspect(result));
                next_function(error, result);
            });
        },


        // INFO : UI object 를 직접 설정한다.
        // -ui object name = 'ui.' + app_id . object_name
        // -필드에 .ctime 이 추가된다.
        //
        setUIObject : function (credis, app_id, object_name, user_object) {
            var key_name = 'ui.' + app_id + '.' + object_name;

            var data = _.merge(user_object, { _ctime : moment().unix() });

            credis.send_command('hmset', [key_name, data], function (error, result) {
                if (error) console.error('ERROR hmset:', result);

                // TODO : check next func
            });
        },


        setUIObjectField : function  (credis, app_id, object_name, field, value) {
            var key_name = 'ui.' + app_id + '.' + object_name;

            var data = [];
            data[field] = value;

            credis.send_command('hmset', [key_name, data], function (error, result) {
                if (error) console.error('ERROR hmset:', result);

                // TODO : check next func
            });
        },


        removeUIObject : function (credis, app_id, object_name) {
            var key_name = 'ui.' + app_id + '.' + object_name;

            credis.send_command('del', [key_name], function (error, result) {
                if (error) console.error('ERROR del:', result);

                // TODO : check next func
            });
        },

        expireUIObject : function (credis, app_id, object_name, expire) {
            var key_name = 'ui.' + app_id + '.' + object_name;

            credis.send_command('del', [key_name, expire], function (error, result) {
                if (error) console.error('ERROR expire:', result);

                // TODO : check next func
            });
        },


        getConfigObjectName : function (app_id, object_name) {
            var key_name = 'config.' + app_id + '.' + object_name;

            return key_name;
        },


        getConfigObject : function (credis, app_id, object_name, next_function) {
            var key_name = 'config.' + app_id + '.' + object_name;

            credis.send_command('hgetall', [key_name], function (error, result) {
                if (error) console.error('ERROR model.ui-object:hgetall', error);

                //log.debug('@@' + gv.inspect(result));
                next_function(error, result);
            });
        },


        publishTopicData : function (credis, app_id, topic, mqtt_data) {
            var ud = {
                ack_topic : topic,
                mqtt_data : mqtt_data
            };

            var data = {
                app_id : app_id,
                tid : 'tid',
                ctime : 1,
                "topic" : topic,        // 발송할 topic 정보를 준다.
                "et": "event-type",
                ud : ud
            }

            credis.publish('ckpush-action-to-mqtt', JSON.stringify(data));
        },



        pushFCMQueue : function (credis, app_id, registrationTokens, user_data) {
            var qdata = {
                "app_id": app_id,		// default 로 간다.
                "rids" : registrationTokens,
                "ud": user_data,
            };
            //console.log('FCM : pushFCMQueue:', qdata);
            credis.send_command('rpush', ['queue.fcm', JSON.stringify(qdata)], function (error, result) {
                if (error) {
                    console.error('ERROR RPUSH:', error);
                }
                else {
                    ;//console.log('FCM : SUCCESS RPUSH:', qdata);
                }
            });
        },
    };
	
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return Module;
};