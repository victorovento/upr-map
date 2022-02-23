/*
 * Test script for Routing.js
 */

var $ = require("jquery");
var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../../src/OLU");

QUnit.module("Ctrl > Service > Routing");

//Load config file
var config = null;
$.ajax({
	url: 'config.json',
	async: false,
	dataType: 'json',
	success: function(data) { config = data; }
}).fail(function() { throw new Error("[Controller] Error while retrieving CONFIG"); });

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with valid parameters", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 2,"nodes": [2,3],"tags": {"highway": "footway","level": "1","oneway":"yes"}},
		{"type": "way","id": 3,"nodes": [2,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 4,"nodes": [2,4],"tags": {"trash": "yes","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var r = new OLU.ctrl.service.Routing(config.routing, data);
	
	assert.ok(r instanceof OLU.ctrl.service.Routing);
});


/*
 * OTHER METHODS
 */

//do
QUnit.test("do with valid parameters", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 2,"nodes": [2,3],"tags": {"highway": "footway","level": "1","oneway":"yes"}},
		{"type": "way","id": 3,"nodes": [2,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 4,"nodes": [2,4],"tags": {"trash": "yes","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var r = new OLU.ctrl.service.Routing(config.routing, data);
	var done = assert.async();
	var success = function(route) {
		assert.equal(route.length, 3);
		assert.ok(route[0] instanceof OLU.model.Node);
		done();
	};
	
	r.do("foot", L.latLng(48.845069, 2.374088), 1, L.latLng(48.845212, 2.374324), 1, success, function() { throw new Error("fail"); });
});
