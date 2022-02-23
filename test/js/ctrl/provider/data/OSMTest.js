/*
 * Test script for OSM.js
 */

var $ = require("jquery");
var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require('../../../src/OLU');

QUnit.module("Ctrl > Provider > Data > OSM");

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
QUnit.test("Constructor with default parameters", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	assert.ok(o instanceof OLU.ctrl.provider.data.OSM);
});


/*
 * OTHER METHODS
 */

//parse
QUnit.test("parse with valid OSM data", function(assert) {
	var raw = {"version": 0.6,"generator": "Overpass API","osm3s": {"timestamp_osm_base": "2016-05-01T14:35:02Z","copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."},"elements": [
		{
			"type": "way",
			"id": 173627690,
			"nodes": [ 4041449622, 4041449624 ],
			"tags": { "highway": "footway", "level": "1", "surface": "wood" }
		},
		{ "type": "node", "id": 4041449622, "lat": 48.1187404, "lon": -1.702769 },
		{ "type": "node", "id": 4041449624, "lat": 48.1187488, "lon": -1.7026847 }
		]
	};
	
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	var result = o._parse(raw);
	
	assert.equal(result.type, "FeatureCollection");
	assert.equal(result.features.length, 1);
	assert.equal(result.features[0].type, "Feature");
	assert.equal(result.features[0].id, "way/173627690");
});
QUnit.test("parse with invalid OSM data", function(assert) {
	assert.throws(
		function() { 
			var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
			o._parse(null)
		},
		new Error("ctrl.provider.data.OSM.invalidData")
	);
});

//process
QUnit.test("process with valid OSM data", function(assert) {
	var raw = {"version": 0.6,"generator": "Overpass API","osm3s": {"timestamp_osm_base": "2016-05-01T14:35:02Z","copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."},"elements": [
	{
		"type": "way",
		"id": 173627690,
		"nodes": [ 4041449622, 4041449624 ],
		"tags": { "highway": "footway", "level": "1", "surface": "wood" }
	},
	{
		"type": "way",
		"id": 173627691,
		"nodes": [ 4041449624, 4041449622 ],
		"tags": { "highway": "footway", "level": "2", "name": "Chemin formidable" }
	},
	{ "type": "node", "id": 4041449622, "lat": 48.1187404, "lon": -1.702769 },
	{ "type": "node", "id": 4041449624, "lat": 48.1187488, "lon": -1.7026847 }
	]
	};
	
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	var result = o._process(raw);
	
	assert.ok(result.features != null);
	assert.ok(result.levels != null);
	assert.ok(result.names != null);
	
	assert.ok(result.features["way/173627690"] != undefined);
	assert.ok(result.features["way/173627690"] instanceof OLU.model.Feature);
	assert.equal(result.features["way/173627690"].id, "way/173627690");
	
	assert.ok(result.features["way/173627691"] != undefined);
	assert.ok(result.features["way/173627691"] instanceof OLU.model.Feature);
	assert.equal(result.features["way/173627691"].id, "way/173627691");
});

//requestOverpass
QUnit.test("requestOverpass with valid request", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.equal(data.elements.length, 1);
		assert.equal(data.elements[0].type, "node");
		assert.equal(data.elements[0].tags.power, "pole");
		done();
	};
	
	o._requestOverpass(
		L.latLngBounds(L.latLng(48.11193806137843, -2.1263788640499115), L.latLng(48.111992682282846, -2.1263051033020024)),
		'(node["power"="pole"];);out body;>;out skel qt;',
		success,
		function() { done(); throw new Error("fail"); }
	);
});

//download
QUnit.test("download with valid request", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.ok(data.features != undefined);
		assert.ok(data.levels != undefined);
		assert.ok(data.names != undefined);
		
		assert.ok(data.features["way/382931858"] instanceof OLU.model.Feature);
		assert.equal(data.levels.length, 1);
		assert.equal(data.levels[0], 0);
		assert.ok(data.names.length > 0);
		done();
	};
	
	o.download(
		L.latLngBounds(L.latLng(48.123742887044635, -1.8021655082702637), L.latLng(48.12409202147402, -1.8009987473487852)),
		success,
		function() { done(); throw new Error("fail"); }
	);
});
QUnit.test("download with valid request on empty area", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.ok(data.features != undefined);
		assert.ok(data.levels != undefined);
		assert.ok(data.names != undefined);
		
		assert.equal(data.levels.length, 0);
		assert.equal(data.names.length, 0);
		done();
	};
	
	o.download(
		L.latLngBounds(L.latLng(48.12533525248926, -1.798560619354248), L.latLng(48.125796479589226, -1.7973107099533083)),
		success,
		function() { done(); throw new Error("fail"); }
	);
});

//downloadLight
QUnit.test("downloadLight with valid request", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.ok(data.features != undefined);
		assert.ok(data.levels != undefined);
		assert.ok(data.names != undefined);
		
		assert.ok(data.features["way/382931858"] instanceof OLU.model.Feature);
		assert.equal(data.levels.length, 1);
		assert.equal(data.levels[0], 0);
		assert.ok(data.names.length > 0);
		
		assert.ok(data.features["node/3861379435"] == undefined);
		done();
	};
	
	o.downloadLight(
		L.latLngBounds(L.latLng(48.123742887044635, -1.8021655082702637), L.latLng(48.12409202147402, -1.8009987473487852)),
		success,
		function() { done(); throw new Error("fail"); }
	);
});
QUnit.test("downloadLight with valid request on empty area", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.ok(data.features != undefined);
		assert.ok(data.levels != undefined);
		assert.ok(data.names != undefined);
		
		assert.equal(data.levels.length, 0);
		assert.equal(data.names.length, 0);
		done();
	};
	
	o.downloadLight(
		L.latLngBounds(L.latLng(48.12533525248926, -1.798560619354248), L.latLng(48.125796479589226, -1.7973107099533083)),
		success,
		function() { done(); throw new Error("fail"); }
	);
});

//downloadCluster
QUnit.test("downloadCluster with valid request", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.equal(data.type, "FeatureCollection");
		assert.ok(data.features.length > 0);
		assert.equal(data.features[0].type, "Feature");
		assert.equal(data.features[0].geometry.type, "Point");
		done();
	};
	
	o.downloadCluster(
		L.latLngBounds(L.latLng(48.12377690537545,-1.801920086145401), L.latLng(48.123908502390336,-1.8016491830348969)),
		success,
		function() { done(); throw new Error("fail"); }
	);
});
QUnit.test("downloadCluster with valid request on empty area", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var success = function(data) {
		assert.equal(data.type, "FeatureCollection");
		assert.equal(data.features.length, 0);
		done();
	};
	
	o.downloadCluster(
		L.latLngBounds(L.latLng(48.12533525248926, -1.798560619354248), L.latLng(48.125796479589226, -1.7973107099533083)),
		success,
		function() { done(); throw new Error("fail"); }
	);
});

//Other tests
QUnit.test("start several requests and don't get blocked", function(assert) {
	var o = new OLU.ctrl.provider.data.OSM(config.api.overpass);
	
	var done = assert.async();
	var requestsResponses = 0;
	
	var success = function(data) {
		assert.ok(data.features != undefined);
		assert.ok(data.levels != undefined);
		assert.ok(data.names != undefined);
		
		assert.ok(data.features["way/382931858"] instanceof OLU.model.Feature);
		assert.equal(data.levels.length, 1);
		assert.equal(data.levels[0], 0);
		assert.ok(data.names.length > 0);
		
		assert.ok(data.features["node/3861379435"] == undefined);
		requestsResponses++;
		if(requestsResponses == 2) {
			done();
		}
	};
	
	var fail = function() {
		requestsResponses++;
		if(requestsResponses == 2) {
			done();
		}
		throw new Error("fail");
	}
	
	o.downloadLight(
		L.latLngBounds(L.latLng(48.123742887044635, -1.8021655082702637), L.latLng(48.12409202147402, -1.8009987473487852)),
		success,
		fail
	);
	
	o.downloadLight(
		L.latLngBounds(L.latLng(48.123742887044635, -1.8021655082702637), L.latLng(48.12409202147402, -1.8009987473487852)),
		success,
		fail
	);
});
