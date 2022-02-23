/*
 * Test script for Feature.js
 */

var QUnit = require("qunitjs");
var OLU = require("../src/OLU");

QUnit.module("Model > Feature");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with simple OSM feature", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": {
			"type": "node",
			"id": "node/1250504057",
			"tags": {
				"amenity": "bicycle_parking",
				"capacity": "12",
				"name": "Parking à vélos de Rennes 2",
				"level": "0"
			},
			"meta": {},
			"relations": []
		},
		"geometry": {
			"type": "Point",
			"coordinates": [
				-1.704077,
				48.1210744
			]
		}
	});
	
	assert.ok(f instanceof OLU.model.Feature);
	assert.equal(f.name, "Parking à vélos de Rennes 2");
	assert.equal(f.id, "node/1250504057");
	assert.equal(f.onLevels.length, 1);
	assert.equal(f.onLevels[0], 0);
	assert.ok(f.geometry instanceof OLU.model.FeatureGeometry);
	assert.equal(f.geometry.coordinates[0], -1.704077);
	assert.equal(f.geometry.coordinates[1], 48.1210744);
});
QUnit.test("Constructor with simple OSM feature and no name but with ref", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": {
			"type": "node",
			"id": "node/1250504057",
			"tags": {
				"amenity": "bicycle_parking",
				"capacity": "12",
				"ref": "P2048",
				"level": "0"
			},
			"meta": {},
			"relations": []
		},
		"geometry": {
			"type": "Point",
			"coordinates": [
			-1.704077,
			48.1210744
			]
		}
	});
	
	assert.ok(f instanceof OLU.model.Feature);
	assert.equal(f.name, "P2048");
});
QUnit.test("Constructor with simple OSM feature and no name or ref", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": {
			"type": "node",
			"id": "node/1250504057",
			"tags": {
				"amenity": "bicycle_parking",
				"capacity": "12",
				"level": "0"
			},
			"meta": {},
			"relations": []
		},
		"geometry": {
			"type": "Point",
			"coordinates": [
			-1.704077,
			48.1210744
			]
		}
	});
	
	assert.ok(f instanceof OLU.model.Feature);
	assert.equal(f.name, "Bicycle parking");
});


/*
 * ACCESSORS
 */

//idForEditor
QUnit.test("idForEditor", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.equal(f.idForEditor(), "n1250504057");
});

//hasImages
QUnit.test("hasImages and no image defined", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.notOk(f.hasImages());
});
QUnit.test("hasImages and image defined", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0", "image": "http://lol.net/img.png" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.ok(f.hasImages());
});

//isOnLevel
QUnit.test("isOnLevel and valid level given", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.ok(f.isOnLevel(0));
});
QUnit.test("isOnLevel and not existing level given", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.notOk(f.isOnLevel(-1));
});

//getTag
QUnit.test("getTag and existing key given", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.equal(f.getTag("amenity"), "bicycle_parking");
});
QUnit.test("getTag and not existing key given", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.equal(f.getTag("public_transport"), undefined);
});

//hasTag
QUnit.test("hasTag and existing key given", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.ok(f.hasTag("amenity"));
});
QUnit.test("hasTag and not existing key given", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.notOk(f.hasTag("public_transport"));
});

//getImages
QUnit.test("getImages", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0", "image": "http://lol.net/img.png" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	assert.ok(f.getImages() instanceof OLU.model.FeatureImages);
});

//getStyle
// QUnit.test("getStyle", function(assert) {
// 	var f = new OLU.model.Feature({
// 		"type": "Feature",
// 		"id": "node/1250504057",
// 		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0", "image": "http://lol.net/img.png" }, "meta": {}, "relations": [] },
// 		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
// 	});
// 	
// 	assert.ok(f.getStyle() instanceof OLU.model.FeatureStyle);
// });

//asGeoJSON
QUnit.test("asGeoJSON", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	var result = f.asGeoJSON();
	assert.equal(result.type, "Feature");
	assert.equal(result.geometry.type, "Point");
	assert.equal(result.geometry.coordinates.length, 2);
	assert.equal(result.geometry.coordinates[0], -1.704077);
	assert.equal(result.geometry.coordinates[1], 48.1210744);
	assert.equal(result.properties.amenity, "bicycle_parking");
	assert.equal(result.properties.level, "0");
});


/*
 * MODIFIERS
 */

//computeStyle
QUnit.test("computeStyle", function(assert) {
	var f = new OLU.model.Feature({
		"type": "Feature",
		"id": "node/1250504057",
		"properties": { "type": "node", "id": "node/1250504057", "tags": { "amenity": "bicycle_parking", "level": "0" }, "meta": {}, "relations": [] },
		"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
	});
	
	var css =
		'node[amenity=bicycle_parking] {'+
			'color: #fff;'+
			'width: 12;'+
		'}';
	
	var ruleset = new OLU.model.mapcss.RuleSet();
	ruleset.parseCSS(css);
	f.computeStyle(ruleset);
	
	var style = f.style;
	
	assert.ok(style != null);
	assert.equal(style.shapeStyles.default.color, "#fff");
	assert.equal(style.shapeStyles.default.width, 12);
});
