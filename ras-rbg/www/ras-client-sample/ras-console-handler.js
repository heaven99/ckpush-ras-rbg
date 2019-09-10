/**
 * ckpush-ras / RAS Visual Console WEB Application
 *
 * Copyright(C) 2015-2017 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ras-console-handler.js
 * @version : 4.0.0
 * @notes
 *   -Socket.io --> WebSockets
 *   -model index to key hash, 좀 큰일임.
 */
RasConsoleHandler = (function() {
	var module = {};

	// 
	//
	// PRIVATE DATAs	
	var mSIO = null;		// == RasSocketIO
	var mTick = 0;			// tick count (sec)
	var mTickHandler = null; 
	var	mSocketId = '';
	
	//
	//
	// DATA MODEL / VIEW
	var	connect_info = false;
	var login_info = false;
	
	var	mStatusMV = new RasDataMV();
	
	//
	//
	// UI TAG	
/*
	var mNotify = null;
	var mServiceMode = null;
	var mConnect = null;
*/
	
	// 특수 변수 
	var mShareKey = null;			// 공유용 Object 
	
	var mCommandAllow = true;		// 키 반복 금지

    var config_load_control;        // epoch (loadControl 그래프용 변수)
    ////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////
    module.init = function() {
        setupLayout();

        initSocketIO();
        //widgetConsoleSeckey('add', 'widget.console.seckey', null);

        $(document).on('show', function() {
            console.log('######The page gained visibility; the `show` event was triggered.');
            //$('#mix-container').mixItUp('changeLayout');
        });

        $(document).on('hide', function() {
            console.log('######The page lost visibility; the `hide` event was triggered.');
            //$('#mix-container').mixItUp('changeLayout');
        });

    };


    ////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////
    // http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	window.log = function() {
		// TODO : HISTORY가 필요없으면 제거하도록 한다. 
		log.history = log.history || [];  // store logs to an array for reference
		log.history.push(arguments);
		
		// INFO : 별도의 console assert는 하지 않는다. 
		console.log( "RAS:" + Array.prototype.slice.call(arguments) );
	};
	
	
	var getId = function (tag_id) {
		return '#' + tag_id.replace(/\./g, "\\.");
	};
	
	// INFO : kendo UI 로 할당되었는지 확인한다, HTML TAG로 선언해도 확인이 가능하다. 
	//  -$(getId(widget_window_id)).length : HTML TAG는 확인할 수 없다.
	var isKendoWidget = function (tag_id) {
		return $(getId(tag_id)).closest(".k-widget").length > 0;		
	};
	
	
	var object2Array = function (object) {
		var hash  = [];
		var i = 0;
		
		for (var key in object) {
			hash[i] = {};
			hash[i].keyName = key;
			hash[i].keyValue =object[key];
			i++;
			
			//log('convert -->' + object[key]);
		}
		
		return hash;
	};
	
	var setShareKey = function(object) {
		mShareKey = object;
	};
		
	var getShareKey = function() {
		return mShareKey;
	};
	
	
	// 
	// FUNCTIONs : Built-in types include "info", "success", "warning" and "error"
	var showNotify = function(text, type) {
		log('@SIO : ' + type + ':' + text);
		
		mNotify.show(text, type);
	};
	
	var UI_config = function (data, is_image) {
		
		var hash = object2Array(mStatusMV.cleanPacket(data));
		var chtml = '';
		if (is_image) return chtml;
		
		for (var i = 0; i < hash.length; i++) {
			chtml += '<li>' + hash[i].keyName + ' : ' + hash[i].keyValue + '</li>' ;
		}
		
		return chtml;		
	};
	
		
	var setupLayout = function () {
		log('@setupLayout()');
		
	};

	
	var initSocketIO = function(seckey) {
		mSIO = RasSocketIO.getInstance();
		
		// init code.
		mSIO.init('P2-DATA');
		log('@initSocket:seckey=' + seckey);
	
		////////////////////////////////////////////////////
		//
		// 최초 접속처리 
		mSIO.addHandler('ras-hello', function(data) {
//             showNotify('인증요청 : 인증처리 중입니다.', "info");

			mSocketId = data.user.soc_id;
			
			var	hello = {
				_t : 'ras-user-auth',
				user_name : 'chohs',
				member_srl : Math.floor((Math.random() * 1000) + 1),
				user_email : 'chohs@ckstack.com',
				sex : 'male',
				photo : '',
				ras_app_id : 'console',
				//sec_key : '_PUT_SECRET_CODE_',
				sec_key : seckey,
			};
			
			mSIO.emit(hello);
		});
		
		
		////////////////////////////////////////////////////
		//
		// 접속 거부 처리  
		mSIO.addHandler('ras-deny', function(data) {
			mSIO.setRetry(false);
// 			showNotify('DENY! : 서버에 의해 접속이 거부 되었습니다.', "error");
			
			connect_info = false;
			login_info = false;			
		});
		
		////////////////////////////////////////////////////
		//
		// 모니터 처리
		mSIO.addHandler('ras-monitor', function(data) {
			log('검토필요 : ' + JSON.stringify(data));
// 			showNotify('검토필요 - App ID : ' + data.ud.app_id + ', 설명 :' + data.ud.desc, "error");
		});
		
		

		////////////////////////////////////////////////////
		//
		// 접속후 데이터 처리 (add)
		mSIO.addHandler('ras-data-init', function(data) {
			login_info = true;

// 			showNotify('인증완료 : 서버에 로그인 되었습니다.', "success");

/*
			// set to data model			
			mStatusMV.set(data.status);

			// update UI
			mStatusMV.updateUI();			
*/
		});
		


		////////////////////////////////////////////////////
		//
		// update
		mSIO.addHandler('object-changed', function(data) {
			// 너무자주 발생해서 일단 막는다.
			//showNotify('object-changed:' + data._key, "info");		// 너무 자주 발생해서 없앤다.
			//log('@object-changed:' + JSON.stringify(data));

            // INFO : 인증만 통과한 상태에서 서버의 로그인 후의 결과 데이터를 받지 않은 상태에서 ui 업데이트들이 넘어오는 경우가 있다.
            //  -초기 서버 설정 및 예외 상태에서 발생한다.
            //  -ras-connected-console handler 가 먼저 처리되어야만 한다.
            if (login_info == false) {
//                 showNotify('IGNORE : object-changed:' + data._key, "warning");
                log('@IGNORE : object-changed:' + JSON.stringify(data));

                return;
            }
			
			// 해당 key를 add/update 한다. 
			if (mStatusMV.updateMV(data) == false) {
				// key INSERT
				log('##insert tag:' + data._key);
			}
			else {
				// key hash : UPDATE
				log('##update mv: ' + JSON.stringify(data));
			}
		});


		////////////////////////////////////////////////////
		//
		// delete
		mSIO.addHandler('object-deleted', function(data) {
			//showNotify('object-deleted:' + data._key, "info");        // 너무 잦은 삭제로 그냥 막는다.
            log('@object-deleted:' + JSON.stringify(data));

		});
		
		
		
		//
		// connect / disconnect
		// 
		mSIO.addHandler('connect', function(data) {
			connect_info = true;
			login_info = false;	
			
// 			mConnect.value('online');

// 			showNotify('접속 : 서버에 접속 되었습니다.', "info");
			
			// INFO : 재접속을 의미함. (그냥 깔끔하게 리플레쉬한다.) 
			if (data > 0) {
				// TODO : 가능하면 refresh 해서 재접속하는게 더 나을 수 있다. 
				location.reload(true);
				//$(".container .mix").css("display", "inline-block");
			}
		});

		
		mSIO.addHandler('disconnect', function(data) {
			connect_info = false;
			login_info = false;		
			
			mConnect.value('offline');

// 			showNotify('접속해제 : 서버와 접속이 끊어 졌습니다.', "error");
		});


        mSIO.addHandler('device-group-status', function(data) {
            log('디바이스 상태 :' + JSON.stringify(data));
            //showNotify('디바이스 상태 :' + JSON.stringify(data), "info");
        });

		//
		//
		//
		// Reply handler
		mSIO.addHandler('r-ras-console', function(data) {
			log('@r-ras-console');
			
// 			showNotify('명령어 결과 :' + JSON.stringify(data), "info");
		});
		
		mSIO.addHandler('r-ras-alive', function(data) {
			log('@r-ras-alive');

            mTick = 0;	// 서버로 부터 수신을 받으면 초기화 한다.
		});

		
		mSIO.addHandler('r-ras-user-auth', function(data) {
			log('@r-ras-user-auth');
			
			// alive check 를 하는데, 끊어지면 하지 말것. 
			mTick = 0;
			mTickHandler = setInterval(function() {
				mTick++;
               	if (mTick >= 30) {       // 기본 시간은 60초임.
					//log('@ras-alive:' + mTick);

					mSIO.emit({ 
						_t : 'ras-alive',
						tick : mTick,
					});
				}
			}, 1000);			
		});
	};
	
	////////////////////////////////////////////////////////////////////////////////////
	// 이하 내부 메뉴 전용 
	// (TODO) 별도 모듈들로 분리.
	////////////////////////////////////////////////////////////////////////////////////





	return module;
})();