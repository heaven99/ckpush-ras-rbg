/**
 * ckpush-ras
 *
 * Copyright(C) 2015 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 *
 * -----------------------------------------------------------
 * @file : ras-gv.js
 * @version : 3.0.0
 * @notes
 */

/* ///////////////////////////////////////////////////////////////////
 * require packages
 */
// require from node.js
var os = require('os');
var fs = require('fs');
var util = require('util');


// require from third-party ( use pakagename )
var moment  = require('moment');


// require for this project




//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

/* ///////////////////////////////////////////////////////////////////
 * exports objects
 */
var config = {
    sys : {},		// INFO : system 관련 초기 정보를 저장한다.
    crm : {},		// INFO : Current Run Mode, 실행에 필요한 각종 정보를 저장한다.
	log : {}		// INFO : log 처리에 필요한 정보를 저장한다.
};

// INFO : 아래와 같이 전체 object 로 참조하면 외부에서 참조 및 멤버수정이 가능하다.
//
exports.config = config;

// INFO : 아래와 같은 경우로 접근하면 외부에서 참조가 되지 않는다. 이유는 모르겠다.
//   ex : console.log(gv.crm); --> 없음.
exports.sys = config.sys;
exports.crm = config.crm;
exports.log = config.log;
///////////////////////////////////////////////


/* ///////////////////////////////////////////////////////////////////
 * global functions
 */
exports.print_config = function () {
	console.log('---- Configuration Parameters ----');
	console.log('---sys---');
	console.log(util.inspect(config.sys));
	console.log('---crm---');
	console.log(util.inspect(config.crm));
	// console.log('---log---');
	// console.log(util.inspect(config.log));
	console.log('----------------------------------');

	// console.log('---- Cache Parameters ----');
	// console.log(util.inspect(cache));
	// console.log('----------------------------------');
}


/*
 *  -options :
 *
 *  -user_configure_function :
 *     +error :
 *     +result :
 */
exports.configure = function (options, user_configure_function) {

	// TODO : configure load 모듈로 수정하고,
	// sys를 구하는 것은 configure 로 빼고,

	console.log('CONFIG:START main-gv.configure');

    // deprecated : 2015.05.28, hostname 에 dot(.) 등이 포함되는 경우가 자주있다. (문제는 hostname을 바꾸는게 쉽지않다.)
    // deprecate : config.sys.hostname = os.hostname();
    // deprecated : 2015.02.18 물리적 패스를 심볼릭 링크로 사용하는 경우가 있다 그래서 심볼릭 링크의 디렉토리를 구한다
    //              다음은 물리적 패스를 구한다.  config.sys.cwd = process.cwd();
    config.sys.cwd = process.env.PWD;
    console.log('CONFIG:current directory:' + config.sys.cwd);

    config.sys.config_path = config.sys.cwd + '/service/site/conf';
    config.sys.license_path = config.sys.cwd + '/service/site/license';
    config.sys.license_file = config.sys.license_path + '/' + 'license.cfg.json';
    try {
        config.sys.license = JSON.parse(fs.readFileSync(config.sys.license_file));
    }
    catch (e) {
        exports.exit(-1, { desc : "CONFIG : error open license_file : " + config.sys.license_file, error : e });
    }
    console.log('CONFIG:license file:' + JSON.stringify(config.sys.license));
    config.sys.hostname = config.sys.license.hostname;

    // TODO : ASSERT : check options.cfg
    config.sys.config_file = config.sys.config_path + '/' + options.cfg;

	fs.readFile(config.sys.config_file, function(error, data) {
		if (error) {
			// INFO : error 가 발생하면 error를 발생시킨다. (중단된다.)
			exports.exit(-1, { desc : "CONFIG : error open config_file : " + config.sys.config_file, error : error });
		}

		try {
			var run_modes = JSON.parse(data);
		}
		catch (e) {
			//exit(-1, "ERROR parse configure file : " + config.sys.config_file);
			exports.exit(-1, { desc : "CONFIG : error parse config_file : " + config.sys.config_file } );
		}

		var match = false;
		for (var i = 0; i < run_modes.length; i++) {
			if (config.sys.hostname == run_modes[i].hostname && config.sys.cwd == run_modes[i].cwd) {
				match = true;
				break;
			}
		}

		if (!match) {
			exports.exit(-1, { desc : "CONFIG : error matching config", hostname : config.sys.hostname, cwd : config.sys.cwd } );
		}

		// INFO : match 된 config 를 찾았으면 config.crm 에 할당한다.
		config.crm = run_modes[i];

		if (true) {
			user_configure_function(null, config);
		}
	});

}


exports.exit = function (exit_code, exit_reason) {
	// TODO : console log 와 file 로그를 구분해야한다.
	// 무조건 화일로 적으면 문제가 되는데, 보통 초기화시에 exit를 수행하기 때문에 file log 가 적용안된 상태가 많다.
	console.log('STOP -  PROCESS : exit(' + exit_code + ')');
	console.log(util.inspect(exit_reason));

	process.exit(exit_code);
}

///////////////////////////////////////////////////////////////
// UTILS. : 이거 주의 해야한다. (recursive 되는 것은 표현하지 못한다.)
exports.inspect = function (data) {
	return JSON.stringify(data);
//	return util.inspect(data);
}


/*
 * 성공하면 javascript object
 * 실패하면 null
 */
exports.parse_socket_io = function (data) {
	try {
		// INFO : Socket.io 에서 바로 Object 로도 전송함.
		if (typeof data == "object") return data;

		return JSON.parse(data);
	} catch (e) {
		//console.log('SOCKET:JSON parse error:', data);
		return null;
	}
}


/**
 * from : express@2.5.9 / connect / util.js
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse_cookie = function(str){
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim().toLowerCase()
      , val = pair.substr(++eqlIndex, pair.length).trim();

    // quoted values
    if ('"' == val[0]) val = val.slice(1, -1);

    // only assign once
    if (undefined == obj[key]) {
      val = val.replace(/\+/g, ' ');
      try {
        obj[key] = decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          obj[key] = val;
        } else {
          throw err;
        }
      }
    }
  }
  return obj;
};


///////////////////////////////////////////////////////////////
// time routines (base : moment)
exports.getTimeS = function() {
	return moment().valueOf();
//	return moment();
}

exports.getTimeE = function (time1) {
	//term.toPrecision(5)
	var term = moment().valueOf() - time1;

	if (term > 500) {
		return 'T(WARNING! TOO SLOW : ' + term + 'ms)';
	}
	else {
		return 'T(' + term + 'ms)';
	}
}

exports.getTimeString = function () {
	return moment().format("YYYY-MM-DD HH:mm:ss");
}

exports.getTimeString14 = function () {
	return moment().format("YYYYMMDDHHmmss");
}


exports.getDateString8 = function () {
	return moment().format("YYYYMMDD");
}


exports.getUnixTime = function () {
	return moment().unix();
}

exports.trim = function(str) {
	return str.replace(/^\s+|\s+$/g, '');
};


// TODO : 2017.10.22, websockets
exports.setTag = function (conInfo) {
    conInfo.tag = { "app_id" : conInfo.app_id, "ssid" : conInfo.ssid, "ip" : conInfo.ip, "soc_id" : conInfo.soc_id, "member_srl" : conInfo.member_srl };

    console.log('@setTag:', conInfo);
}

// TODO : 2017.10.22, websockets
exports.getLogTag = function (conInfo) {
	if (conInfo)
		return ' ' + exports.inspect(conInfo.tag) + ' ';

	return ' INVALID_SOCKET ';
}

exports.getTag = function (conInfo) {
	if (conInfo)
		return conInfo.tag;

	return ' INVALID_SOCKET ';
}

//
//
// exports.setTag = function (socket) {
// 	// TODO : null, undefined, 0, "" 이런걸 정확히 구분하는 유틸리티로 사용할 것.
// 	if (socket && socket.handshake && socket.handshake._user_) {
// 		if (socket.handshake._user_.member_srl === null || socket.handshake._user_.member_srl === undefined)
// 			socket.handshake._user_.tag = { "app_id" : socket.handshake._user_.app_id, "ssid" : socket.handshake._user_.ssid, "ip" : socket.handshake._user_.ip, "soc_id" : socket.handshake._user_.soc_id };
// 		else
// 			socket.handshake._user_.tag = { "app_id" : socket.handshake._user_.app_id, "ssid" : socket.handshake._user_.ssid, "ip" : socket.handshake._user_.ip, "soc_id" : socket.handshake._user_.soc_id, "member_srl" : socket.handshake._user_.member_srl };
// 	}
// 	else {
// 		;	// INFO : 이런 경우는.. 답이 없다. (발생하지 않을 것이다)
// 	}
// }

// exports.getLogTag = function (socket) {
// 	if (socket && socket.handshake && socket.handshake._user_)
// 		return ' ' + exports.inspect(socket.handshake._user_.tag) + ' ';
//
// 	return ' INVALID_SOCKET ';
// }

// exports.getTag = function (socket) {
// 	if (socket && socket.handshake && socket.handshake._user_)
// 		return socket.handshake._user_.tag;
//
// 	return ' INVALID_SOCKET ';
// }

/////////
/*
Array.prototype.remove = function(idx) {
    return (idx<0 || idx>this.length) ? this : this.slice(0, idx).concat(this.slice(idx+1, this.length));
};
*/




