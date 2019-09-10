/**
 * ckpush-ras / RAS Visual Console WEB Application
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ras-data-model.js
 * @version : 3.0.0
 * @notes
 * -2015/06/18 - model.extra field 추가, 관련 처리함수들 추가.
 *               (개발자가 ui-object(공유) 외의 클라이언트 local data 보관을 위한 용도로 사용함)
 * -
 */
var RasDataMV = function() {
	this.model = {
		type : 'key', 
		data : {},
		hash : {},
		extra : {},			// append for animation 2015.06.18
		desc : 'desc',
	};
	
	this.ui_handler = null;
	this.add_handler = null;
};

//
// DOM key id = key
// DOM desh id = key + '-hash'
//
//
RasDataMV.prototype = {
	set : function(data) {
		this.model = data;
	},
	
	get : function() {
		return this.model;
	},
	
	getData : function() {
		return this.model.data;
	},

	getHash : function() {
		return this.model.hash;
	},

	getExtra : function() {
		return this.model.extra;
	},

	getType : function() {
		return this.model.type;
	},
	
	getDesc : function() {
		return this.model.desc;
	},
	
	
/* deprecated object["a.b.c"] = c 형식이 가능하다.
	getKey : function(key) {
		return key.replace(/\./g, "_");
	},
*/

	
	//////////////////////
	// 이하 UI binding
	//////////////////////
	
	//
	// 삭제하면 true
	// dom 도 삭제할려면 delete_dom = true
	// 
	deleteMV : function(data, delete_dom) {
		if (this.getData()[data._key]) {
			delete this.getData()[data._key];
			delete this.getHash()[data._key];
			delete this.getExtra()[data._key];

			if (delete_dom) $("#" + data._key.replace(/\./g, "\\.")).remove();
			
			return true;
		}
		
		return false;
	},
	
	//
	// 통신으로 들어온 데이터의 부가 필드를 삭제한다.
	//
	cleanPacket : function(data) {
		var updateData = _.clone(data);				// 주의!
		
		delete updateData._key;		
		delete updateData._t;
		delete updateData._i;
		delete updateData.app_id;
		
		return updateData;
	},
	
	//
	// update 면 true, insert면 false;
	//
	// LOG : {"_ras_label":"샘플 - 접속표현(앱1)","type":"android","current":"1","ctime":"1403581910","app_id":"p2y1","_key":"ui.p2y1.connect.3b7bea89f1551382","_t":"object-changed","_i":"s_1403581910528"}
	updateMV : function(data) {
		//console.log('@updateMV:' + JSON.stringify(data));
		if (this.getData()[data._key]) {
		// INFO : UPDATE - 개별 object update (hash 만 update 처리한다)
			this.getHash()[data._key] = this.cleanPacket(data);		// set hash data
			return true;
		}
		else {
		// INFO : INSERT - 최초 initial 부분이 아니라 개별 initialize 처리를 위한 구간임.
			this.getData()[data._key] = data._key;
			this.getHash()[data._key] = this.cleanPacket(data);
			this.getExtra()[data._key] = {};				        // set extra data

			// DOM 상에 추가 (이렇게 추가해야 하는지는 좀 더 고민 필요) 
			this.addUI(data._key);
			
			return false;
		}
	},

	writeExtra : function(data, member, value) {
		this.getExtra()[data._key][member] = value;
	},

	readExtra : function(data, member) {
		return this.getExtra()[data._key][member];
	},

	setAddUI : function(callback) {
		this.add_handler = callback;
	},

	addUI : function(param) {
		if (this.add_handler) this.add_handler(param);
	},
	
	setUIHandler : function(callback) {
		this.ui_handler = callback;
	},
	
	updateUI : function(param) {
		if (this.ui_handler) this.ui_handler(param);
	},

	
/*
	return {
		set : set,
		get : get,
		getData : getData,
		getType : getType,
		getDesc : getDesc,
		setUIHandler : setUIHandler,
		updateUI : updateUI, 	
	};
*/
};