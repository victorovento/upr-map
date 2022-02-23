/*
 * Test script for Search.js
 */

var $ = require("jquery");
var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../../src/OLU");

QUnit.module("Ctrl > Service > Search");

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
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	
	assert.ok(s instanceof OLU.ctrl.service.Search);
	assert.equal(s._nominatim, config.api.nominatim);
});


/*
 * OTHER METHODS
 */

//find
QUnit.test("find with simple string", function(assert) {
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	var done = assert.async();
	
	s.find(
		"bléruais",
		function(d) {
			assert.equal(d.length, 1);
			var sr = d[0];
			assert.ok(sr.coordinates.equals(L.latLng(48.110922, -2.1263481)));
			assert.ok(sr.bbox.equals(L.latLngBounds(L.latLng(48.1056318, -2.1361774), L.latLng(48.1266284, -2.100149))));
			assert.ok(sr.name.indexOf("Bléruais, Rennes, Ille-et-Vilaine") == 0);
			assert.equal(sr.objectType, "boundary: administrative");
			assert.equal(sr.level, 0);
			done();
		},
		function(e) {
			console.log(e);
			done();
			throw new Error("Unexpected fail");
		}
	);
});

QUnit.test("find with another string", function(assert) {
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	var done = assert.async();
	
	s.find(
		"grand quartier, saint-grégoire",
		function(d) {
			assert.ok(d.length >= 1);
			var sr = d[0];
			assert.ok(sr.coordinates.equals(L.latLng(48.1371526, -1.69464671484045)));
			assert.ok(sr.bbox.equals(L.latLngBounds(L.latLng(48.1370734, -1.6948), L.latLng(48.137266, -1.6944409))));
			assert.ok(sr.name.indexOf("Grand Quartier, D 137, Saint-Grégoire, Rennes") == 0);
			assert.equal(sr.objectType, "amenity: pharmacy");
			assert.equal(sr.level, 0);
			done();
		},
		function(e) {
			console.log(e);
			done();
			throw new Error("Unexpected fail");
		}
	);
});

QUnit.test("find with empty string", function(assert) {
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	
	assert.throws(
		function() {
			s.find(
				"    ",
				function() { throw new Error("unexpected success"); },
				function(e) { console.log(e); throw new Error("unexpected fail"); }
			);
		},
		new Error("ctrl.service.Search.invalidQuery")
	);
});

QUnit.test("find with housenumber", function(assert) {
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	var done = assert.async();
	
	s.find(
		"1 avenue sir winston churchill, rennes",
		function(d) {
			assert.equal(d.length, 1);
			var sr = d[0];
			assert.ok(sr.coordinates.equals(L.latLng(48.11683335, -1.70845736243675)));
			assert.ok(sr.bbox.equals(L.latLngBounds(L.latLng(48.1165413, -1.7085838), L.latLng(48.1169683, -1.7083347))));
			assert.ok(sr.name.indexOf("1, Avenue Sir Winston Churchill, Villejean - Beauregard, Quartiers Nord-Ouest, Rennes, Ille-et-Vilaine") == 0);
			assert.equal(sr.objectType, "building: yes");
			assert.equal(sr.level, 0);
			done();
		},
		function(e) {
			console.log(e);
			done();
			throw new Error("Unexpected fail");
		}
	);
});

QUnit.test("find with ambiguous name", function(assert) {
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	var done = assert.async();
	
	s.find(
		"rennes",
		function(d) {
			assert.ok(d.length > 1);
			var sr = d[0];
			assert.ok(sr.coordinates.equals(L.latLng(48.1113387, -1.6800197)));
			assert.ok(sr.bbox.equals(L.latLngBounds(L.latLng(48.076839, -1.7526301), L.latLng(48.1549329, -1.6244197))));
			assert.ok(sr.name.indexOf("Rennes, Ille-et-Vilaine") == 0);
			assert.equal(sr.objectType, "place: city");
			assert.equal(sr.level, 0);
			done();
		},
		function(e) {
			console.log(e);
			done();
			throw new Error("Unexpected fail");
		}
	);
});

QUnit.test("find with room name (will fail, as not available yet in Nominatim)", function(assert) {
	var s = new OLU.ctrl.service.Search(config.api.nominatim);
	var done = assert.async();
	
	s.find(
		"master sigat, université de rennes 2, rennes",
		function(d) {
			assert.ok(d.length >= 1);
			var sr = d[0];
// 			assert.ok(sr.coordinates.equals(L.latLng(48.1113387, -1.6800197)));
// 			assert.equal(sr.name, "Rennes, Ille-et-Vilaine, Brittany, Metropolitan France, 35000;35200;35700, France");
// 			assert.equal(sr.objectType, "place: city");
// 			assert.equal(sr.level, 0);
			done();
		},
		function(e) {
			console.log(e);
			done();
			throw new Error("Unexpected fail");
		}
	);
});
