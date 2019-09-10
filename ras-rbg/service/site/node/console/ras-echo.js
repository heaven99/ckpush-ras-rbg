// require from node.js
var os = require('os');
var util = require('util');
var http = require('http');
var fs = require('fs');

var redis = require('redis');
var _ = require('lodash');
var async = require("async");

var gv = require('../inc/ras.config.js');
var es = require('../inc/ras.event-script.js')();


//////////////////////////////////////////////
//////// START SCRIPT
//////////////////////////////////////////////

es.init(process.argv[2]);


// var redis_client = redis.createClient(gv.config.redis_server_port, gv.config.redis_server, {});

console.log(es.makeActionToUser(es.getAppId(), "r-echo", es.getUserData().user_tag.member_srl, { result : es.getUserData().data } ));
gv.exit(0);
