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
	var mNotify = null;
	var mServiceMode = null;
	var mConnect = null;
	
	// 특수 변수 
	var mShareKey = null;			// 공유용 Object 
	
	var mCommandAllow = true;		// 키 반복 금지

    var config_load_control;        // epoch (loadControl 그래프용 변수)
    ////////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////////
    module.init = function() {
        setupLayout();

        //initSocketIO();
        widgetConsoleSeckey('add', 'widget.console.seckey', null);

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
		
		// 알림 메시지 
		mNotify = $("#popup-container").kendoNotification({
                //appendTo: "#notification",
				position : {
					left : 10,
				},
                autoHideAfter: 3000,
                //width : "10em",
                animation: {
                    open: {
                        effects: "slideIn:right"
                    },
                    close: {
                        effects: "slideIn:right",
                        reverse: true
                    }
                }
			}).data("kendoNotification");


		// INFO : + (데이터 추가, mServiceMode 내에서 이 버튼을 사용하므로 먼저 생성해 둔다.
		$(getId("edit-mode-add")).kendoButton( {
			click : function(e) {
				log('edit mode click');
				
				windowAddHash('open');	// 창을 연다..
/*
				mSIO.sendPacket('ras-gcm-send-all', { 
					target_app_id : $(getId("widget.console.gcm-all.window.app-selector")).val(),
					text : $(getId(widget_window_id + ".textarea" )).val(),
					time_send : 'now',	// 전송시간	
				});
*/
			}
		}).data("kendoButton");
			
		// INFO : console 서비스 모드 (서비스 모드, 설정모드 (수정, +추가별도생성)		                    
		mServiceMode = $("#service-mode").kendoDropDownList({
			dataTextField: "text",
			dataValueField: "value",
			dataSource: [
				{ text : 'RUN', value : 'service' },
				{ text : 'EDIT', value : 'edit' },
			],		

			index: 0,
			
			cascade: function() {
				log('@service-mode cascade:' + $("#service-mode").val());
				
				if ($("#service-mode").val() == 'service') {
					//$("#view-model").css("border", "");
					$(".card-delete").css("display", "none");

					$(getId("edit-mode-add")).kendoButton().data("kendoButton").enable(false);
				}
				else if ($("#service-mode").val() == 'edit') {
					//$("#view-model").css("border", "5px solid orange");
					$(".card-delete").css("display", "inline-block");
					
					$(getId("edit-mode-add")).kendoButton().data("kendoButton").enable(true);
				}
			},
		}).data("kendoDropDownList");
		
		

		// 연결 상태 선택자			                    
		mConnect = $("#status-connect").kendoDropDownList({
			dataTextField: "text",
			dataValueField: "value",
			dataSource: [
				{ text : 'Offline', value : 'offline' },
				{ text : 'Online', value : 'online' },
				//{ text : 'Online(Auth)', value : 2 },
			],		

			index: 0,
			cascade: function() {
				log('@status-connect cascade:' + $("#status-connect").val());

/*
				if ($("#status-connect").val() == 'offline') {
					$(".container .mix").css("display", "none");
				}
				else {
					$(".container .mix").css("display", "inline-block");
				}
*/
			},
		}).data("kendoDropDownList");
		
		
		//
		// index == key
		mStatusMV.setAddUI(function(index) {
			//log('-setAddUI(' + index + ')');
		
			var widget_id = mStatusMV.getData()[index];					// 기본적으로 사용될 widget id, 
			var widget_window_id = widget_id + '.window';				// 기본적으로 사용될 오픈될 윈도우의 tag id

			/////////////////////////////////////////////////////// 
			// INFO : 공용 UI 처리 구간 
			/////////////////////////////////////////////////////// 
			var category = 'category-normal';
			var sort = 'normal';
			
			if (mStatusMV.getData()[index].indexOf('widget.') == 0) {
				category = 'category-widget';
				sort = 'sort-a';
			}
			else if (mStatusMV.getData()[index].indexOf('config.') == 0) {
				category = 'category-config';
				sort = 'sort-b';
			}
			else if (mStatusMV.getData()[index].indexOf('ui.') == 0) {
				category = 'category-status';
				sort = 'sort-c';
			}
            // 없을 경우 화면에 그리지 않는다. (for performance, 2015/10/03)
            else {
                return;
            }

			
			// INFO :
			//   +widget.console.terminal
			//      +card-image
			//         +h2
			//         +widget.console.terminal-card
			//           +widget.console.terminal-title
			//           +widget.console.terminal-hash  (default : ul, li)
			$("#mix-container").append(
				  '<div id="' + mStatusMV.getData()[index] + '" class="mix ' + category + '" data-myorder="' + sort + '-' + index + '">'
				+ '	  <div id="' + mStatusMV.getData()[index] + '-back" class="card-image">'
				+ '		<h1 id="' + mStatusMV.getData()[index] + '-title" class="card-title">' + mStatusMV.getData()[index] + '</h1>'
				+ '		<h2 id="' + mStatusMV.getData()[index] + '-label">' + mStatusMV.getHash()[index]['_ras_label'] + '</h2>'
				+ '		<div id="' + mStatusMV.getData()[index] + '-card" class="card">'
				+ '			<ul id="' + mStatusMV.getData()[index] + '-hash">' + UI_config(mStatusMV.getHash()[index], mStatusMV.getHash()[index]['_ras_image'])  + '</ul>'
				+ '		</div>'
				+ '		<img id="' + mStatusMV.getData()[index] + '-delete" src="images/icon-delete.png" class="card-delete"></img>'
				+ '	  	<div id="' + mStatusMV.getData()[index] + '-tag" class="card-tag ' + category + '"></div>'
				+ '	  </div>'
				+ '</div>'
			);
			
			// INFO : 배경 이미지를 그린다. (init)
			//  -가장 바깥 div 의 background(#color) 가 정의된 css 에 url 을 적용하면 이미지가 나타나지 않는다.
			//  -바로 안쪽 div 를 -back 으로 정의해서 이미지를 적용하면 나오지만 또 background color 가 적용되지 않는다.
			//  -그래서 background 에는 image 를 주고, background-color 를 별도로 또 적용한다.
			//  -background-image 를 사용하거나 위와 같은 방법을 사용하면 이미지가 실시간으로 바뀌지 않는다.
			//  -정확한 이유는 모르겠다. (2015.06.17)
			if (mStatusMV.getHash()[index]['_ras_image']) {
                $(getId(widget_id)+ '-back').css('background', 'url(' + mStatusMV.getHash()[index]['_ras_image'] + ') no-repeat');
                $(getId(widget_id)+ '-back').css('background-color', '#f2f2f2');
				$(getId(widget_id)+ '-back').css('background-size', '100% 100%');
				//$(getId(widget_id)).css('background-position', 'center');
			}

			// INFO : 위젯의 delete button을 처리한다.. 
			//  return false 로 click propagation 시키지 않도록 한다.
			//
			$(getId(widget_id + '-delete')).click(function(e) {
				if (mStatusMV.getHash()[index]._ras_lock) {
					showNotify('Locked key 로 삭제 시도할 수 없습니다.', "error");
					return false;
				}
			
				// INFO : 한번 생성한 메시지 박스는 재활용하기 때문에, widget_id 가 바뀌지 않는다. 
				//  -매번 생성하면 문제가 없는데, 이 경우, click event가 계속 추가된다.
				//  -로컬변수를 이벤트로 전달할 수 있으면 좋은데, 방법을 잘 모르므로 get/setSahreKey() 방식을 사용한다. 
				//log('@before click delete key : ' + widget_id);
				//log(e.target);
				
				setShareKey(widget_id);
		        if (!isKendoWidget("dialog-delete-confirm.ok")) {
			        $(getId("dialog-delete-confirm.ok")).kendoButton({
						click : function(kevent) {
							//log('@after click delete key : ' + getShareKey());
							//log(kevent.event.target);

			             	mSIO.emit({ 
			             		_t : 'ras-command',
			             		_cmd : 'event console hash-remove-key',
							 	key : getShareKey(),
							});

							window.data("kendoWindow").close();
						}
					});
					
			        $(getId("dialog-delete-confirm.cancel")).kendoButton({
						click : function(e) {
							window.data("kendoWindow").close();
						}
					});
				}
	
				//
				var window = $("#dialog-delete-confirm");
				window.kendoWindow({
					width: "300px",
					title: "삭제 확인",
		            modal: true,
					actions: [
						"Close",
					],
				});
		        window.data("kendoWindow").open().center();
		        
				
				return false;	// layer 상의 자기만 선택되도록 한다. 
			});
			
			// INFO : hover 처리. 
			$(getId(widget_id)).on({
				mouseenter: function () {
					//log('@1:' + widget_id);
					$(getId(widget_id)).tween({
						transform:{
							//stop: 'scale( 1.015 )',
							stop: 'scale( 1.07 )',
							start: 'scale( 1 )',
							time: 0,
							duration: 0.2,
							effect:'easeInOut'
						},
						onStop: function( elem ) {
							//log('@1-stop:' + widget_id);
						}
					});

					$.play();
				},
				mouseleave: function () {
					$(getId(widget_id)).tween({
						transform:{
							stop: 'scale( 1 )',
							start: 'scale( 1.07 )',
							time: 0,
							duration: 0.3,
							effect:'easeInOut'
						},
						onStop: function( elem ) {
						}
					});

					$.play();
				}
			});
			
			
			
			/////////////////////////////////////////////////////// 
			// INFO : 공용 UI runtime configuration 에 따른 동적 적용구간.
			/////////////////////////////////////////////////////// 
					
			// INFO : service mode 에 따른 초기화 처리 
			if ($("#service-mode").val() == 'service') {
				$(".card-delete").css("display", "none");
			}
			else if ($("#service-mode").val() == 'edit') {	
				$(".card-delete").css("display", "inline-block");
			}
			
			// 

			
			/////////////////////////////////////////////////////// 
			// INFO : 개별 UI 처리 구간 
			/////////////////////////////////////////////////////// 

			// 
			// ui-object 들을 처리한다. 
			//
			uiConsoleUsage('add' ,widget_id, mStatusMV.getHash()[index]);
            configLoadControl('add' ,widget_id, mStatusMV.getHash()[index]);

			//
			// 자체 메뉴/위젯들의 행동을 처리한다. 
			//
			$(getId(widget_id)).click(function(e) {
				log('@click service-mode=' + mServiceMode.value());
				
				if (mServiceMode.value() == 'edit') {
					widgetEditHash('add', widget_id, mStatusMV.getHash()[index], index);
				}
				else {
					widgetConsoleTerminal('add', widget_id, mStatusMV.getHash()[index]);
					widgetConsoleGcmAll('add', widget_id, mStatusMV.getHash()[index]);
					widgetConsoleTech1('add', widget_id, mStatusMV.getHash()[index]);

                    // config, ui 의 경우 선택하면 그냥 에디팅을 할 수 있도록 한다.
                    if (widget_id.indexOf("config.") >= 0 || widget_id.indexOf("ui.") >= 0) {
                        widgetEditHash('add', widget_id, mStatusMV.getHash()[index], index);
                    }
				}
			});
			

		});
		
		
		
		mStatusMV.setUIHandler(function(param) {
			//log('###mStatusMV.setUIHandler:' + JSON.stringify(mStatusMV.getData()));
			
			for (var key in mStatusMV.getData()) {
				///log('###_key=' + key + ', data=' + mStatusMV.getData()[key]);
				mStatusMV.addUI(key);
			}			
						
			// 이게 없으면 갯수가 안 맞으면 벌어진다, 실제는 sort 때문에 생기는 문제인 듯..
/*
			$("#mix-container").append('<div class="gap"></div>');
			$("#mix-container").append('<div class="gap"></div>');
			$("#mix-container").append('<div class="gap"></div>');
*/
		});

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
            showNotify('인증요청 : 인증처리 중입니다.', "info");

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
			showNotify('DENY! : 서버에 의해 접속이 거부 되었습니다.', "error");
			
			connect_info = false;
			login_info = false;			
		});
		
		////////////////////////////////////////////////////
		//
		// 모니터 처리
		mSIO.addHandler('ras-monitor', function(data) {
			log('검토필요 : ' + JSON.stringify(data));
			showNotify('검토필요 - App ID : ' + data.ud.app_id + ', 설명 :' + data.ud.desc, "error");
		});
		
		

		////////////////////////////////////////////////////
		//
		// 접속후 데이터 처리 (add)
		mSIO.addHandler('ras-data-init', function(data) {
			login_info = true;

			showNotify('인증완료 : 서버에 로그인 되었습니다.', "success");

			// TODO : 일단은 removeall로 대처한다.
			$('#mix-container > *').remove();

			// set to data model			
			mStatusMV.set(data.status);

			// update UI
			mStatusMV.updateUI();
			
			// 
			windowAddHash("add");
			
			// INFO : 재접속시 보이지 않는 경우를 처리한다. 
			$(".container .mix").css("display", "inline-block");

			$('#mix-container').mixItUp({
                animation: {
                    enable: false,      //TODO: 이게 작동하면 좋기는한데, 문제는 슬립모드에서 복구하면 한방에 가버린다.
                    queue: false,
                    duration: 300,
                    animateChangeLayout: true,
                },
                load : {
                    page : 1
                },
                pagination: {
                    limit: 28,
                    loop: false,
                    generatePagers: true,
                    maxPagers: 10,
                    pagerClass: '',
                    prevButtonHTML: '«',
                    nextButtonHTML: '»'
                },
                selectors: {
                    pagersWrapper: '.pager-list',
                    pager: '.pager'
                }
            });

			// update layout			
			//$('#mix-container').mixItUp('changeLayout');
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
                showNotify('IGNORE : object-changed:' + data._key, "warning");
                log('@IGNORE : object-changed:' + JSON.stringify(data));

                return;
            }
			
			// 해당 key를 add/update 한다. 
			if (mStatusMV.updateMV(data) == false) {
				// key INSERT
				//log('--------> insert tag:' + data._key);
				$('#mix-container').mixItUp('changeLayout');
			}
			else {
				// key hash : UPDATE
				//log('##### update mv: ' + JSON.stringify(data));

                // INFO : 본문 내용 출력
                $(getId(data._key + '-hash')).html(UI_config(data, data['_ras_image']));

                //INFO : 애니메이션이 이미 작동하고 있다면 애니메이션을 처리하지 말고 그냥 레이블만 바꾼다.
                if (mStatusMV.readExtra(data, '_ani') == true) {
                    //INFO: 애니메이션 중인데 해당 돔을 손대면 Uncaught Cannot tween a null target. 이런게 발생한다.
                    //$(getId(data._key + '-label')).text(data['_ras_label']);
                    //INFO: 그렇다고 update 도 안먹힌다... 그냥 업데이트 포기한다.
                    //$(getId(data._key + '-label')).cooltext({
                    //    sequence: [
                    //        {
                    //            action:"update",
                    //            text: data['_ras_label'] + '#####',
                    //        }
                    //    ]
                    //});
                }
                else
                {
                    $(getId(data._key + '-label')).text(data['_ras_label']);

                    // 2015.07.15 - 슬립모드 복구에서 문제가 좀 많다. (target null 이 발생하고 더 이상 애니메이션이 안된다.)
                    //TODO: 애니메이션의 경우 문제가 많으므로 가능하면 사용안하는게 좋을 듯 하다.
                    $(getId(data._key + '-label')).cooltext({
                        sequence: [
                            {
                                action: "animation",
                                animation: "cool79",        // 79
                                //elements: "words",
                                elements: "letters",
                                speed: 200,
                                onStart: function () {
                                    mStatusMV.writeExtra(data, '_ani', true);
                                    //log('#start animation:' + data._key + ", " + mStatusMV.readExtra(data, '_ani'));
                                },
                                onComplete: function () {
                                    // INFO : 한번만 플레이 되기 때문에 지웠다가 다시 만든다.
                                    // -일정 시간이 지나고 난 다음 발생하기 때문에 그냥 두면 신규데이터를 여기서 업데이트 하게된다.
                                    // -따라서, 클로져 데이터를 사용하지 않고, 전역데이터를 다시 읽어서 최신으로 처리한다.
                                    var _data = mStatusMV.getHash()[data._key];

                                    $(getId(data._key + '-label')).remove();
                                    $(getId(data._key + '-back')).append('<h2 id="' + data._key + '-label">' + _data._ras_label + '</h2>');

                                    mStatusMV.writeExtra(data, '_ani', false);
                                    //log('##end animation:' + data._key + ", " + mStatusMV.readExtra(data, '_ani'));
                                }
                            },
                        ],
                    });
				}


                // INFO : 배경이미지를 업데이트 한다.
                //  -deprecated : 매번 그릴 필요는 없다. : if (data['_ras_image']) {
                if (data['_ras_image'] && mStatusMV.readExtra(data, '_ras_image') != data['_ras_image']) {
					//log('--------> update image:' + data['_ras_image']);
                    $(getId(data._key) + '-back').css('background', 'url(' + data['_ras_image'] + ') no-repeat');
                    $(getId(data._key) + '-back').css('background-color', '#f2f2f2');
					$(getId(data._key) + '-back').css('background-size', '100% 100%');

                    mStatusMV.writeExtra(data, '_ras_image', data['_ras_image']);
                }


				//
                uiConsoleUsage('update', data._key, data);
                configLoadControl('update', data._key, data);
			}
		});


		////////////////////////////////////////////////////
		//
		// delete
		mSIO.addHandler('object-deleted', function(data) {
			//showNotify('object-deleted:' + data._key, "info");        // 너무 잦은 삭제로 그냥 막는다.
            log('@object-deleted:' + JSON.stringify(data));

			var widget_id = data._key;					// 기본적으로 사용될 widget id, 
			
			var ret = mStatusMV.deleteMV(data, false);			// 메모리에서만 삭제 (DOM은 남아 있음, 애니메이션 중에 add, delete가 반복될 가능성으로 기능을 나눈다.)

			var ani_window_id = widget_id;
			log('object delete:id=' + ani_window_id + ', ret=' + ret);
			log($(getId(ani_window_id)));

            //no animation version
            $(getId(widget_id)).remove();			// DOM 삭제
            $('#mix-container').mixItUp('changeLayout');
            // animation version
            //$(getId(ani_window_id)).tween({
				//opacity:{
				//	start: 100,
				//	stop: 0,
				//	time: 0,
				//	duration: 0.4,
				//	effect:'easeInOut'
				//},
				//transform:{
				//	stop: 'scale( 0.3 )',
				//	start: 'scale( 1.0 )',
				//	time: 0,
				//	duration: 0.4,
				//	effect:'easeInOut'
				//},
				//onStop: function( elem ) {
				//	$(getId(widget_id)).remove();			// DOM 삭제
            //        $('#mix-container').mixItUp('changeLayout');
				//}
            //});
            //$.play();

		});
		
		
		
		//
		// connect / disconnect
		// 
		mSIO.addHandler('connect', function(data) {
			connect_info = true;
			login_info = false;	
			
			mConnect.value('online');

			showNotify('접속 : 서버에 접속 되었습니다.', "info");
			
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

			showNotify('접속해제 : 서버와 접속이 끊어 졌습니다.', "error");
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
			
			showNotify('명령어 결과 :' + JSON.stringify(data), "info");
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

	////////////////////////////////////////////////
	// 범용 key 추가 (+)
	// 'widget.console.hash-add'
	var windowAddHash = function(type) {
		log('@windowAddHash:' + type);
		
		var widget_id = 'widget.console.hash-add';

		var widget_window_id = widget_id + '.window';		// 기본적으로 사용될 오픈될 윈도우의 tag id

		if ($(getId(widget_window_id)).length) {
			log('@@@@@ already exist:' + widget_window_id);
		}
		else {
			$("#editor-container").append(
				'<div id="widget.console.hash-add.window" hidden="true">'
			  + '	<label style="width:90px">데이터 종류</label>'
			  + '	<input id="widget.console.hash-add.window.data-selector" style="width: 450px" />'
			  + '	<p></p>'
			  + '	<label style="width:90px">App 종류</label>'
			  + '	<input id="widget.console.hash-add.window.app-selector" style="width: 450px" />'
			  + '	<p></p>'
			  + '	<label style="width:90px">데이터 KEY</label>'
			  + '	<input id="widget.console.hash-add.window.app-key" value="" class="k-textbox" style="width: 450px;" />'	
			  + '	<p></p>'
			  + '	<label style="width:90px">데이터 설명</label>'
			  + '	<input id="widget.console.hash-add.window.app-label" value="" class="k-textbox" style="width: 450px;" />'	
			  + '	<p></p>'
			  + '	<div align="right">'
			  + '		<button id="widget.console.hash-add.window.ok" class="k-button">확인</button>'
			//  + '		<button id="widget.console.hash-add.window.canel" class="k-button">취소</button>'
			  + '	</div>'
			  + '</div>'
			);
			
			$(getId("widget.console.hash-add.window.ok")).kendoButton( {
				click : function(e) {
					log('@hash-add.window.ok');					

					mSIO.sendPacket('hash-add-key', {
						key : $(getId("widget.console.hash-add.window.data-selector")).val()
							+ $(getId("widget.console.hash-add.window.app-selector")).val()
							+ "." + $(getId("widget.console.hash-add.window.app-key")).val(),
						text :  $(getId("widget.console.hash-add.window.app-label")).val()
					});
					
					//$(getId("widget.console.hash-add.window")).kendoWindow().data("kendoWindow").close();
					$(getId("widget.console.hash-add.window")).data("kendoWindow").close();
				}
			});
		}
		
			
		// 데이터 종류 선택자 (두번 호출되어도 상관없다.)
		$(getId("widget.console.hash-add.window.data-selector")).kendoDropDownList({
			dataTextField: "text",
			dataValueField: "value",
			dataSource : [
				{ text : 'UI (ui.)', value : 'ui.' },
				{ text : '구성 (config.)', value : 'config.' },
				{ text : '위젯 (widget.)', value : 'widget.' },
			],		// 자기 자신의 실시간 데이터를 바라본다.
			index: 0,
			cascade: function() {
				var data_type = $(getId("widget.console.hash-add.window.data-selector")).val();
				log('@select data_type=' + data_type);
			},
		}).data("kendoDropDownList");
		

		// INFO : hash data를 data source 로 변환한다. (저기 GCM-ALL 에서도 같이 사용된다.)
		// TODO : 공용 로직으로 가져갈 수 있다.  (field name 이 가변이다.)
		var getDataSource = function(apps) {
			var data_source = [];
            console.log('@getDataSource:apps.length=' + apps.length);
			for (var i = 0; i < apps.length; i++) {
				data_source[i] = {};
				data_source[i].text = data['_ras_app_' + apps[i] + '_title'];
				data_source[i].value = apps[i];
			}
			
			return data_source;
		}
		
		// 앱 선택자
		var data = mStatusMV.getHash()["config.global.datas"];
		log('@data=' + JSON.stringify(data));
		$(getId("widget.console.hash-add.window.app-selector")).kendoDropDownList({
			dataTextField: "text",
			dataValueField: "value",
			dataSource : getDataSource(JSON.parse(data._ras_apps)),		// 자기 자신의 실시간 데이터를 바라본다.
			index: 0,
			cascade: function() {
				var app_id = $(getId("widget.console.hash-add.window.app-selector")).val();
				log('@select=' + app_id);
				$(getId("widget.console.gcm-all.window.app-info")).text("발송유저수 : " + data['_ras_app_' + app_id + '_users']);

			},
		}).data("kendoDropDownList");
	
	
		if (type == "open") {
			var window = $(getId(widget_window_id));
			window.kendoWindow({
				width: "610px",
				title: "신규 KEY 생성",
				modal: true,
				actions: [
					"Close",
				],
			});
	
			window.data("kendoWindow").open().center();
		}
	};
	
	////////////////////////////////////////////////////////////////////////////////////
	// 이하 위젯들 
	// (TODO) 별도 모듈들로 분리.
	////////////////////////////////////////////////////////////////////////////////////

	
	////////////////////////////////////////////////
	// 범용 hash edit 
	// 
	var widgetEditHash = function(type, widget_id, data, index) {
		var widget_window_id = widget_id + '.hash-editor';		// 기본적으로 사용될 오픈될 윈도우의 tag id (.window를 사용하지 않는다. 클릭이 분기되므로 꼬인다.)
		var widget_grid_id = widget_window_id + '.grid';		// 오픈될 윈도우의 tag id
		
		log('@widgetEditHash:widget_window_id=' + widget_window_id + ', index=' + index);
		
		
		var hash = object2Array(data);		//
		log(hash);
		var dataSource = new kendo.data.DataSource({
		    data: hash,
            schema: {
                model: {
                    fields: {
                        keyName: { type: "string" },
                        keyValue: { type: "string" },
                    }
                }
            },
            pageSize: 10
		});
		
			
		// INFO : 태그가 있으면 지운다. (그리드는 아이패드에서 값을 추가해버리는 문제가 있더라)
		//  이미 있다면 애니메이션 중이다.
		if (isKendoWidget(widget_window_id)) {
			//$("#editor-container").empty();
			log('@@@@@ already exist or animation for destroy, click again!');
			return;
		}
		else {
			log('@create new window & grid :' + widget_window_id + ', index=' + index);

			// INFO : 팝업 및 내부 그리드 태그를 생성한다. 
			$("#editor-container").append(
				  '<div id="' + widget_window_id + '" hidden="true">'
				+ '	<div id="' + widget_grid_id + '" />'
				+ '</div>'
			);
			
			//
			// TODO : ipad 에서는 윈도우를 닫았다가 열면 그리드가 두개 그려지는 버그가 있다.
			//  그래서, 다시 못그리도록 하는데, 이렇게 하면 데이터가 뒤에서 바뀌더라도 모르게 된다.
			$(getId(widget_grid_id)).kendoGrid({
				dataSource: dataSource,
	            //height: 500,
	            scrollable: true,
	            sortable: true,
	            filterable: true,
	            pageable: {
	                input: true,
	                numeric: false
	            },
				toolbar: [ 
					{ name : "create", text : "데이터 추가"}, 
				],
	            columns: [
	                { field : "keyName", title : "KEY", width : "250px" },
	                { field : "keyValue", title : "VALUE" },
	                { command : [ { name : "destroy", text : "삭제"} ], width: "100px" },
	            ],
	            editable: { confirmation : "선택한 데이터를 삭제 하겠습니까 ?" },
	            save: function(e) {
	             	log('new = ' + JSON.stringify(e.values));
	             	log('model=' + JSON.stringify(e.model));
	             	
	             	// event command 를 발생시킨다. 
	             	mSIO.emit({ 
	             		_t : 'ras-command',
	             		_cmd : 'event console hash-edit',
					 	key : widget_id,
					 	model : e.model,
					 	edit : e.values,
					});
	            },
	            remove: function(e) {
	             	log('remove model=' + JSON.stringify(e.model));
	             	
	             	// event command 를 발생시킨다. 
	             	mSIO.emit({ 
	             		_t : 'ras-command',
	             		_cmd : 'event console hash-remove',
					 	key : widget_id,
					 	model : e.model,
					});
	            },
	        });
			
		}
		
	    
		var window = $(getId(widget_window_id));
		window.kendoWindow({
			width: "950px",
			title: "Config",
            modal: true,
			actions: [
				"Close",
			],
            close: function(e) {
				log('@close widgetEditHash:widget_window_id=' + widget_window_id);
				
				setTimeout(function() {
					// INFO : destroy 시 kendo 데이터는 날리나 div 는 날리지 않는다. (문서)
					// 다만, 같은 id의 경우 div 를 재활용하는 듯 한 반응을 보이므로, 당장은 신경쓰지 않아도 될듯하다.
					// 여기가 다시 초기화 할 경우 아주 중요한 코드가 된다. 
		            $(getId(widget_grid_id)).kendoGrid().data("kendoGrid").destroy();
		            $(getId(widget_window_id)).kendoGrid().data("kendoWindow").destroy();
				}, 500);
	            
            }
		});
        window.data("kendoWindow").open().center();

	};
	
		
	////////////////////////////////////////////////
	//
	//
	// mCommandAllow 전역변수 사용중.
	var widgetConsoleTerminal = function(type, widget_id, data) {
		if (widget_id != 'widget.console.terminal') return;

		var widget_window_id = widget_id + '.window';		// 기본적으로 사용될 오픈될 윈도우의 tag id

		var window = $(getId(widget_window_id));
		window.kendoWindow({
			width: "600px",
			title: "Terminal",
            modal: true,
			actions: [
				"Close",
			],
		});

		window.data("kendoWindow").open().center();
				
		// TODO : 재등록 검토할 것. 	
			
		// INFO : window enter 처리부 
		$(getId(widget_window_id + '.textbox')).bind('keydown', function(event) {
			if (event.keyCode == 13) {
				if (mCommandAllow == false) return;
				mCommandAllow = false;

				//log('text=' + $('#window-console-textbox').val());	
				mSIO.emit({ 
					_t : 'ras-command',
					_cmd : $(getId(widget_window_id + '.textbox')).val(),
				});
			}
		});
				
		$(getId(widget_window_id + '.textbox')).bind('keyup', function(event) {
			mCommandAllow = true;
		});
		
		$(getId(widget_window_id + '.textbox')).bind('focus', function(event) {
			mCommandAllow = true;
		});
	};
	
	
	////////////////////////////////////////////////
	//
	//
	var widgetConsoleGcmAll = function(type, widget_id, data) {
		if (widget_id != 'widget.console.gcm-all') return;

		var widget_window_id = widget_id + '.window';		// 기본적으로 사용될 오픈될 윈도우의 tag id

		if ($(getId(widget_window_id)).length) {
			log('@@@@@ already exist:' + widget_window_id);
		}
		else {
			$("#editor-container").append(
				'<div id="widget.console.gcm-all.window" hidden="true">'
			  + '	<label>App 종류</label>'
			  + '	<input id="widget.console.gcm-all.window.app-selector" style="width: 400px" />'
			  + '	<p></p>'
			  + '	<label>App 정보</label>'
			  + '	<label id="widget.console.gcm-all.window.app-info"></label>'
			  + '	<p><label>발송시간</label> <label>(즉시 / 예약) </label></p>'
			  + '	<label>발송 메시지 입력</label>'
			  + '	<p></p>'
			  + '	<textarea id="widget.console.gcm-all.window.textarea" class="k-textbox" rows="3" cols="40" style="width:100%; height:60px; display:inline-block"></textarea>'
			  + '	<p></p>'
			  + '	<button id="widget.console.gcm-all.window.send-button">알림 전송</button>'
			  + '</div>'
			);
			
			
			$(getId(widget_window_id + ".send-button")).kendoButton( {
				click : function(e) {
					log({ 
						target_app_id : $(getId("widget.console.gcm-all.window.app-selector")).val(),
						text : $(getId(widget_window_id + ".textarea" )).val(),
						time_send : 'now',	// 전송시간	
					});
					
					mSIO.sendPacket('ras-gcm-send-all', { 
						target_app_id : $(getId("widget.console.gcm-all.window.app-selector")).val(),
						text : $(getId(widget_window_id + ".textarea" )).val(),
						time_send : 'now',	// 전송시간	
					});
				}
			});
		}
		
		
		// INFO : hash data를 data source 로 변환한다.
		var app_data = mStatusMV.getHash()["config.global.datas"];		// global 에서 가져온다.
        console.log('@@_ras_app')
		var getDataSource = function(apps) {
			var data_source = [];
			for (var i = 0; i < apps.length; i++) {
				data_source[i] = {};
				data_source[i].text = app_data['_ras_app_' + apps[i] + '_title'];
				data_source[i].value = apps[i];
			}
			
			return data_source;
		}
		
		// GCM 앱 선택자 (두번 호출되어도 상관없다.)
		$(getId("widget.console.gcm-all.window.app-selector")).kendoDropDownList({
			dataTextField: "text",
			dataValueField: "value",
			dataSource : getDataSource(JSON.parse(data._ras_gcm_apps)),		// 자기 자신의 실시간 데이터를 바라본다.
			index: 0,
/* deprecated
			change: function() {
				log('onChange:' + $(getId("widget.console.gcm-all.window.app-selector")).val());
			},
*/
			cascade: function() {
				var app_id = $(getId("widget.console.gcm-all.window.app-selector")).val();
				log('@select=' + app_id);
				$(getId("widget.console.gcm-all.window.app-info")).text("발송유저수 : " + app_data['_ras_app_' + app_id + '_users']);

			},
		}).data("kendoDropDownList");
		
		var window = $(getId(widget_window_id));
		window.kendoWindow({
			width: "600px",
			title: "Push notification (안드로이드 GCM 발송)",
            modal: true,
			actions: [
				"Close",
			],
		});

		window.data("kendoWindow").open().center();
	};


    ////////////////////////////////////////////////
    //
    //
    var widgetConsoleTech1 = function(type, widget_id, data) {
        if (widget_id != 'widget.console.tech1') return;

        window.open("http://ckpush.com/ckpush-ras-desc.html");
    };


    ////////////////////////////////////////////////
	//
	//
	var widgetConsoleSeckey = function(type, widget_id, data) {
		if (widget_id != 'widget.console.seckey') return;
		var widget_window_id = widget_id + '.window';		// 기본적으로 사용될 오픈될 윈도우의 tag id
		
		var seckey = getCookie("seckey");
		$(getId(widget_window_id + ".textbox")).kendoMaskedTextBox({  value : seckey });
		
		$(getId(widget_window_id + ".ok")).kendoButton( {
			click : function(e) {
				var textbox = $(getId(widget_window_id + ".textbox")).data("kendoMaskedTextBox");
				//log('@click:' + textbox.value());
				
				var insec = textbox.value();
				setCookie("seckey", insec, 3);
				
				// INFO : 접속을 시도한다. 
				initSocketIO(insec);

				$(getId(widget_window_id)).kendoGrid().data("kendoWindow").destroy();
			}
		});
		

		var window = $(getId(widget_window_id));
		window.kendoWindow({
            modal: true,
			draggable: false,            
			resizable: false,
			width: "600px",
			title: "CKPush RAS Check Security key",
			actions: [
			],
		});

		window.data("kendoWindow").open().center();
	};
		
	
	////////////////////////////////////////////////
	//
	//
	var uiConsoleUsage = function(type, widget_id, data) {
		if (widget_id.indexOf('ui.console.usage') != 0) return;

		var widget_window_id1 = widget_id + '.window1';		// 기본적으로 사용될 오픈될 윈도우의 tag id
        var widget_window_id2 = widget_id + '.window2';		// 기본적으로 사용될 오픈될 윈도우의 tag id

		if (type == 'add') {
			//log('@create new usage :' + widget_window_id1);

			$(getId(widget_id + "-card")).html(
				  '<div id="' + widget_window_id1 + '" class="cpu-gauge">'
				+ '</div>'
				+ '<div id="' + widget_window_id2 + '" class="load-gauge">'
				+ '</div>'
			);
			
			
			$(getId(widget_window_id1)).kendoLinearGauge({
                pointer: {
                	size : 7, 
                    value: 0
                },
				gaugeArea: {
					margin: {
						left: 5,
						right: 20
					}
				},
                scale: {
                	labels : {
	                	//padding : 2,
						font : "7px Arial,Helvetica,sans-serif",
						format: "CPU"
                	},
                    majorUnit: 25,
                    minorUnit: 5,
                    min: 0,
                    max: 100,
                    vertical: false,
                    ranges: [
                        {
                            from: 0,
                            to: 50,
                            color: "#2798df"
                        }, {
                            from: 50,
                            to: 80,
                            color: "#ffc700"
                        }, {
                            from: 80,
                            to: 100,
                            color: "#c20000"
                        }
                    ]
                }
            });		
            
			$(getId(widget_window_id2)).kendoLinearGauge({
                pointer: {
                	size : 7, 
                    value: 0
                },
				gaugeArea: {
					margin: {
						left: 5,
						right: 20
					}
				},
                scale: {
                	labels : {
	                	//padding : 2,
	                	//margin: { top: 1, left: 1 },
						margin: 0,
						font : "7px Arial,Helvetica,sans-serif",
						format: "Load"
                	},
                    majorUnit: 2,
                    minorUnit: 0.4,
                    min: 0,
                    max: 10,
                    vertical: false,
                    ranges: [
                        {
                            from: 0,
                            to: 3,
                            color: "#2798df"
                        }, {
                            from: 3,
                            to: 5,
                            color: "#ffc700"
                        }, {
                            from: 5,
                            to: 10,
                            color: "#c20000"
                        }
                    ]
                }
            });		
		}
		else if (type == 'update') {
			//log(data);
			$(getId(widget_window_id1)).data("kendoLinearGauge").value(data.cpu);
			//var loadavg = JSON.parse(data.loadavg);
			var loadavg = data.loadavg;
			$(getId(widget_window_id2)).data("kendoLinearGauge").value(loadavg);

		}
	};


    ////////////////////////////////////////////////
    //
    // https://fastly.github.io/epoch/getting-started/
    // https://fastly.github.io/epoch/real-time/
    var configLoadControl = function(type, widget_id, data) {
        if (widget_id.indexOf('config.global.load-controls') != 0) return;

        var widget_window_id1 = widget_id + '.window1';		// 기본적으로 사용될 오픈될 윈도우의 tag id
        if (type == 'add') {
            //log('@create new usage :' + widget_window_id1);

            $(getId(widget_id + "-card")).html(
                //INFO : 여러가지 경험적으로 margin 을 이용해서 그래프의 위치를 맞추었다.
                '<div id="' + widget_window_id1 + '" class="epoch category20" style="width: 180px; height: 100px; margin-top: 27px; margin-left: -10px;">'
                + '</div>'
            );

            //INFO : Area Charat 특성은 A, B 데이터가 누적되는 형태로 표현된다.
            // -y 의 값이 float 60.0 일 경우 600 Integer 로 인식되어 float, Integer 구분이 상당히 중요하다.
            // axes 의 경우 여러군데 표현하려면 공간이 많이 필요하므로, Console 에서는 적당하지 않아 y 만 표시한다.
            config_load_control = $(getId(widget_window_id1)).epoch({
                type: 'time.area',
                axes: ['left'],
                tickFormats: { time: function(d) { return new Date(time*1000).toString(); } },
                data: [
                    //{
                    //    label: "LC-MAX",
                    //    values: [{ time : Math.floor(Date.now() / 1000), y : 60 }]
                    //},
                    {
                        label: "LC-NOW",
                        values: [{ time : Math.floor(Date.now() / 1000), y : 0}]
                    },
                ]
            });
        }
        else if (type == 'update') {
            //console.log('##data=' + data['load-out']);
            //"load-in":"30.8","load-in-series":"[30.8,53.3,100,55,51.8]","load-out":"17.954","_ras_label":"RAS 실시간 로드 제어","lc-a":"0.3","lc-b":"0.5","lc-min":"1","lc-max":"60","app_id":"global","_key":"config.global.load-controls","_t":"object-changed","_i":"s_1438097482098"}
            var ts = [
                //{ time : Math.floor(Date.now() / 1000), y : 60},
                { time : Math.floor(Date.now() / 1000), y : Math.floor(data['load-out'])}
            ];
            config_load_control.push(ts);
        }
    };





	return module;
})();