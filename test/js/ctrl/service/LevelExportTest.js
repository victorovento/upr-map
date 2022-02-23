/*
 * Test script for LevelExport.js
 */

var QUnit = require("qunitjs");
var OLU = require("../../src/OLU");

QUnit.module("Ctrl > Service > LevelExport");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor by default", function(assert) {
	var le = new OLU.ctrl.service.LevelExport();
	
	assert.ok(le instanceof OLU.ctrl.service.LevelExport);
});


/*
 * OTHER FUNCTIONS
 */

//do
QUnit.test("do with features on level", function(assert) {
	var f1 = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	var f2 = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504058",
		"properties": { "type": "node", "id": "node/1250504058", "tags": { "amenity": "bicycle_parking", "level": "1" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704078,48.1210745] }
	});
	var f3 = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504059",
		"properties": { "type": "node", "id": "node/1250504059", "tags": { "amenity": "bicycle_parking", "level": "2" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704079,48.1210746] }
	});
	
	var features = { "node/1250504057": f1, "node/1250504058": f2, "node/1250504057": f3 };
	
	var le = new OLU.ctrl.service.LevelExport();
	
	//Test
	try {
		le.do(1, features, true);
		assert.ok(true);
	}
	catch(e) {
		assert.ok(false);
	}
});
QUnit.test("do without features on level", function(assert) {
	var f1 = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	var f2 = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504058",
		"properties": { "type": "node", "id": "node/1250504058", "tags": { "amenity": "bicycle_parking", "level": "1" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704078,48.1210745] }
	});
	var f3 = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504059",
		"properties": { "type": "node", "id": "node/1250504059", "tags": { "amenity": "bicycle_parking", "level": "2" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704079,48.1210746] }
	});
	
	var features = { "node/1250504057": f1, "node/1250504058": f2, "node/1250504057": f3 };
	
	var le = new OLU.ctrl.service.LevelExport();
	
	//Test
	assert.throws(function() { le.do(-1, features); }, new Error("ctrl.service.LevelExport.noFeaturesOnLevel"));
});
