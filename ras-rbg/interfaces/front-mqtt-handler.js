/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : front-mqtt-handler.js
 * @version : 3.0.0
 * @notes
 */


/////////////////////////////////////////////////////////////////////
// Module exports
//
module.exports = function (gv, fv) {
    var _ = require('lodash');

    // global variable for this file (scope : in file)
	var log = gv.config.log;

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	//log.debug("loaded MQTT handler.: fv.mqtt_client=" + gv.inspect(fv.mqtt_client));

	// INFO : 2017.02.18 - 정확하지는 않지만 여기서 on('connect') 부분이 작동하지 않는다.
	//  아마도 아직 connect 가 되지 않은 시점과 관련이 있는것 같은데, 정확한 원인은 모르겠다.
    //  -2017.04.05 - connect 명령의 결과와 'connect' 가 선언되는 시점 사이의 타임차가 아닌지 의심스럽다
    //   즉, connect 는 했지만, 선언이 아직 수행되지 않아 호출이 안되는 것으로 추정한다.
    // fv.mqtt_client.on('connect', function () {
    //     log.debug("[MQTT] connected");
    //
    //     // TODO : subscribe channel
    //     fv.mqtt_client.subscribe('/test');
    //     fv.mqtt_client.publish('/test', 'Hello node mqtt');
    // });


    //
    //
    fv.mqtt_client.on('message', function (topic, message) {
        // LOG DEPRECATED : message is Buffer
        // log.debug('[MQTT]:EVENT:topic=' + topic + ':message=' + message.toString());

        // INFO: 2018.12.25, subscribe 한 것 중에서 실제 필요한 부분만 필터한다. (이게 전용으로 사용되면 필요한지 모르겠다.)
        if (check_topic_filter(topic)) {
            // LOG DEPRECATED
            // log.debug('[MQTT]:try topic=' + topic);

            var searchTopic = _.split(topic, '/');
            // INFO: 2018.12.25, /pub/smartmat/user/#/ctl/mode 이러한 구조를 여기서 나누는 이유는 Event script 를 나누기 위해서이다.
            // INFO: 2018.12.25, 따라서, /pub/smartmat/user/# 형태로 중단하기를 원하면 license parseStop == true 로 지정한다.
            var topicKey = '';
            for (var i = 0; i < searchTopic.length; i++) {
                //log.debug('[MQTT]:split' + i + ':' + searchTopic[i]);

                // TODO : 이 부분의 경우 subs 가 여러개가 되고, 파싱을 여러것에 걸려서해야하니깐 수정의 대상이됨.
                if (i == gv.config.sys.license.mqtt.parseIndex) { // user id 자리임.
                    topicKey += '/#';
                    // log.debug('[MQTT]:parseStop=' + gv.config.sys.license.mqtt.parseStop);
                    if (gv.config.sys.license.mqtt.parseStop) break;
                }
                else {
                    if (i == 0) {
                        // 최초 index 에 '/ 를 붙일지 않붙일지 확인한다.
                        // INFO: 2018.12.24, '/' 로 시작하는 Topic 은 확인되지 않았다. 버그가 있을 수 있긴한데, 이런 형태를 사용하지 말것.
                        if (topic.charAt(0) == '/') {
                            topicKey = '/' + searchTopic[i];
                        }
                        else {
                            topicKey = searchTopic[i];
                        }
                    }
                    else {
                        topicKey += '/' + searchTopic[i];
                    }
                }
            }

            //439|front- | 11:15:00.889 - debug: [MQTT]:search topicKey=/000/dysystem/pub/pump/cp/#
            // LOG DEPRECATED
            // log.debug('[MQTT]:search topicKey=' + topicKey);

            fv.redis_client.send_command('hget', ['config.global.mqtt-map', topicKey], function (error, result) {
                if (error || result == null) {
                    log.error('[MQTT] ERROR config.global.mqtt-map, mqtt-map(' + topicKey + ':' + result + ')');

                    var event_monitor = new fv.models.message_channel({qname: 'ckpush-event-monitor'});
                    event_monitor.sendData('console', 'event-monitor', {
                        app_id: 'console',
                        desc: 'MQTT-MAP "' + topicKey + '" 에 등록된 EVENT 가 없습니다.'
                    });
                }
                else {
                    // INFO: 2018.12.25, 일단 String 으로 대체한다.
                    var mqttData =  message.toString();
                    //INFO : mqtt topic / event 매핑 로그
                    // LOG DEPRECATED
                    // log.debug('[MQTT] config.global.mqtt-map, mqtt-map(' + topicKey + ':' + result + ')');

                    try {
                        mqttData = JSON.parse(message.toString());
                        // LOG DEPRECATED : define user data
                        // log.debug('[MQTT]:CHECK DATA:' + topic + ':JSON:' + message.toString());      // JSON String
                    }
                    catch (e) {
                        // LOG DEPRECATED : define user data
                        // log.debug('[MQTT]:CHECK DATA:' + topic + ':String:' + mqttData);
                    }

                    try {
                        var res_object = JSON.parse(result);
                        if (typeof res_object != 'object') res_object = {};		// "{}" 이런 case string 이 나온다, 그래서 empty object 로 바꾼다.

                        // INFO: 2018.12.25, user data 처리
                        var ud = {
                            topic : topic,
                            message : mqttData      // mqttData type is JSON Object or String
                        };

                        // app_id, event 필드를 확인한다.
                        if (res_object.app_id && res_object.event) {
                            send_mqtt_event(res_object.app_id, res_object.event, ud);
                        }
                        else {
                            log.error('[MQTT] ' + topicKey + ', result has not app_id or event:' + result.trim());
                        }
                    }
                    catch (err) {
                        log.error('[MQTT] ' + topicKey + ', result is not json:' + result.trim());
                    }
                }
            });
        }
    });


    //
    //
    var send_mqtt_event = function (app_id, event_id, user_data) {
        var event_fire = new fv.models.message_queue({ qname : 'queue.event' });
        var user_tag = { "app_id" : app_id, "ssid" : 'MQTT', "ip" : 'localhost', "soc_id" : 'MQTT', "member_srl" : '_member_srl_' };

        log.debug('[MQTT]:' + user_data.topic + ':send_mqtt_event --> ckpush-event:' + gv.inspect(user_data));
        // INFO : pdata.data 만 전송한다. _cmd, _i, _t는 제거된다.
        event_fire.pushData(app_id, event_id, { data : user_data, user_tag : user_tag } );
    };


    var check_topic_filter = function (topic) {
        for (var i = 0; i < gv.config.sys.license.mqtt.eventFilter.length; i++) {
            if (_.startsWith(topic, gv.config.sys.license.mqtt.eventFilter[i])) return true;
        }

        return false;
    };


    //////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	return;
}

