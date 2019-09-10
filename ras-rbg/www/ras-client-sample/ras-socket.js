/**
 * ckpush-ras / RAS Visual Console WEB Application
 *
 * Copyright(C) 2015-2017 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ras-socket.js
 * @version : 4.0.0
 * @notes
 * 	-SocketIO --> WebSockets
 */
var RasSocketIO = (function() {
	var module = {};

	var mInsatance;
	var	mSocketId = '';

    var mClients = 0;		// 접속한 client의 수, 위젯당 관리해야 할듯.
    // var mSocket  = null;	// 실제 socket (io.connect 에서 리턴됨)
    var mSocket  = null;	// 실제 socket (WebSocket)
    var mEvents  = [];		// event handler
	var mLoaded  = false;
	var mIoName = null;
	var	mDoRetry = true;

	var mConnectTimer = 0;
	var mRetryCount = 0;

    // INFO : 2017.12.26, 기본 적으로 자신의 호스트에 접속한다.
    let wsUrl = 'ws://msa.ckpush.com:5001';
//     let wsUrl = 'ws://' + location.host;

    var createInstance = function() {

		var reconnect = function() {
			mRetryCount++;
			console.log('@try reconnect:' + mConnectTimer + ", retry=" + mRetryCount);


			mSocket.socket.connect();
		};


		var emit = function (object) {
			console.log('@RasSocketIO:emit:' + JSON.stringify(object));

            mSocket.send(JSON.stringify(object));
		};


		var sendPacket = function (et, data) {
			emit({
				_t : 'ras-protocol-v1',
				_cmd : et,
				data : data,
			});
		};



		var init = function(io_name) {
			console.log('@RasSocketIO : init');

			if (mLoaded) {
				console.log('@RasSocketIO : already mLoaded. (info)');
				return;
			}

			mIoName = io_name;

			console.log('@RasSocketIO : try connect. io=' + mIoName);

            mSocket = new WebSocket(wsUrl, ['ws-ras-v4']);

            mSocket.onopen = function() {
                console.log('Socket open.');

                console.log('connect : ' + mRetryCount);
                if (mEvents['connect']) mEvents['connect'](mRetryCount);

                mRetryCount = 0;

                if (mConnectTimer) {
                    console.log('@RasSocketIO:clear retry connect' + mConnectTimer);
                    clearTimeout(mConnectTimer);
                    mConnectTimer = 0;
                }
            };

            mSocket.onclose = function(event) {
                console.log('Socket closed');

                console.log('@!! disconnect');

                if (mEvents['disconnect']) mEvents['disconnect']();

                if (mDoRetry && mConnectTimer == 0) {
                    mConnectTimer = setInterval(reconnect, 3000);
                    console.log('retry timer start on disconnect_handler : ' + mConnectTimer);
                }
                else {
                    console.log('@stop connection.');

                }

            }

            mSocket.onerror = function(event) {
                console.log('Socket error');
            }


            mSocket.onmessage = function(message) {
                console.log('Socket server message', message.data);

                let pdata = JSON.parse(message.data);
                console.log(pdata);

                if (mEvents[pdata._t]) {
                    mEvents[pdata._t](pdata);
                }
                else {
                    console.log('@RasSocketIO:DATA : no event handler : _t =' + pdata._t);
                }

            };

			mLoaded = true;
		};


		var addHandler = function (event_id, object) {
			console.log('add_handler :' + event_id);

		    mEvents[event_id] =  object;
		};


		var setRetry = function(retry) {
			mDoRetry = retry;
		};

		return {
			reconnect : reconnect,
			emit : emit,
			init : init,
			sendPacket : sendPacket,
			addHandler : addHandler,
			setRetry : setRetry,
		}

	};

	return {
		getInstance : function() {
			if (!mInsatance) {
				mInsatance = createInstance();
			}

			return mInsatance;
		}
	};

})();


