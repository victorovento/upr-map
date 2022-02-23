/*
 * Test script for NewNote.js
 */

var $ = require("jquery");
var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../../src/OLU");

QUnit.module("Ctrl > Service > NewNote");

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
QUnit.test("Constructor", function(assert) {
	var nn = new OLU.ctrl.service.NewNote(config.api.osm_dev);
	
	assert.ok(nn instanceof OLU.ctrl.service.NewNote);
	assert.equal(nn._url, config.api.osm_dev+"notes");
});


/*
 * OTHER METHODS
 */

//do
QUnit.test("do with invalid coordinates", function(assert) {
	var nn = new OLU.ctrl.service.NewNote(config.api.osm_dev);
	
	assert.throws(
		function() { nn.do(null, "OpenLevelUp test suite", null, function(e) { console.log(e); throw new Error("unexpected fail"); }) },
		new Error("ctrl.service.NewNote.invalidCoordinates")
	);
});
QUnit.test("do with coordinates having longitude > 180", function(assert) {
	var nn = new OLU.ctrl.service.NewNote(config.api.osm_dev);
	
	var done = assert.async();
	nn.do(L.latLng(48.7, 185.12), "OpenLevelUp test suite", function() { assert.ok(true); done(); }, function(e) { console.log(e); done(); throw new Error("unexpected fail"); });
});
QUnit.test("do with invalid text", function(assert) {
	var nn = new OLU.ctrl.service.NewNote(config.api.osm_dev);
	
	assert.throws(
		function() { nn.do(L.latLng(48.7, -2.0), null, null, function(e) { console.log(e); throw new Error("unexpected fail"); }) },
		new Error("ctrl.service.NewNote.invalidText")
	);
});
QUnit.test("do with empty text", function(assert) {
	var nn = new OLU.ctrl.service.NewNote(config.api.osm_dev);
	
	assert.throws(
		function() { nn.do(L.latLng(48.7, -2.0), "", null, function(e) { console.log(e); throw new Error("unexpected fail"); }) },
		new Error("ctrl.service.NewNote.invalidText")
	);
});
QUnit.test("do with valid parameters", function(assert) {
	var nn = new OLU.ctrl.service.NewNote(config.api.osm_dev);
	
	var done = assert.async();
	nn.do(L.latLng(48.7, -2.1), "OpenLevelUp test suite", function() { assert.ok(true); done(); }, function(e) { console.log(e); done(); throw new Error("unexpected fail"); });
});
