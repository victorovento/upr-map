/*
 * Test script for FeatureGeometry.js
 */

var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../src/OLU");

QUnit.module("Model > FeatureGeometry");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with valid parameters", function(assert) {
	var g1 = {
		"type": "LineString",
		"coordinates": [
			[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
		]
	};
	
	var fg1 = new OLU.model.FeatureGeometry(g1);
	
	//Check object
	assert.ok(fg1 instanceof OLU.model.FeatureGeometry);
	assert.equal(fg1.type, "LineString");
	assert.equal(fg1.coordinates.length, 4);
	assert.equal(fg1.coordinates[0][0], 102.0);
	assert.equal(fg1.coordinates[0][1], 0.0);
});


/*
 * ACCESSORS
 */

//GetCentroid
QUnit.test("getBoundsCenter from valid geometry", function(assert) {
	var g2 = {
		"type": "Point",
		"coordinates": [48.2, -2.21]
	};
	
	var fg2 = new OLU.model.FeatureGeometry(g2);
	var centroid = fg2.getBoundsCenter();
	
	//Check centroid
	assert.ok(centroid instanceof L.LatLng);
	assert.ok(centroid.equals(L.latLng(-2.21, 48.2)));
});
QUnit.test("getBoundsCenter from invalid geometry", function(assert) {
	var g3 = {
		"type": "InvalidType",
		"coordinates": [
			[0, 0],
			[1, 1],
			[2, 0]
		]
	};
	
	var fg3 = new OLU.model.FeatureGeometry(g3);
	var centroid = fg3.getBoundsCenter();
	
	//Check centroid
	assert.ok(centroid === null);
});

//GetLabelPosition
QUnit.test("getLabelPosition from invalid geometry", function(assert) {
	var g = {
		"type": "InvalidType",
		"coordinates": []
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp === null);
});
QUnit.test("getLabelPosition from point geometry", function(assert) {
	var g = {
		"type": "Point",
		"coordinates": [ 1.0, 2.0 ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp instanceof L.LatLng);
	assert.ok(lp.equals(L.latLng(2.0, 1.0)));
});
QUnit.test("getLabelPosition from linestring geometry with uneven amount of nodes", function(assert) {
	var g = {
		"type": "LineString",
		"coordinates": [
			[ 0.0, 0.0 ],
			[ 1.0, 2.0 ],
			[ 3.0, 4.0 ]
		]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp instanceof L.LatLng);
	assert.ok(lp.equals(L.latLng(2.0, 1.0)));
});
QUnit.test("getLabelPosition from linestring geometry with even amount of nodes", function(assert) {
	var g = {
		"type": "LineString",
		"coordinates": [
			[ 0.0, 0.0 ],
			[ 1.0, 2.0 ],
			[ 3.0, 4.0 ],
			[ 5.0, 6.0 ]
		]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp instanceof L.LatLng);
	assert.ok(lp.equals(L.latLng(3.0, 2.0)));
});
QUnit.test("getLabelPosition from polygon geometry with simple shape", function(assert) {
	var g = {
		"type": "Polygon",
		"coordinates": [ [
			[ 0.0, 0.0 ],
			[ 1.0, 0.0 ],
			[ 1.0, 1.0 ],
			[ 0.0, 1.0 ],
			[ 0.0, 0.0 ]
		] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp instanceof L.LatLng);
	assert.ok(lp.equals(L.latLng(0.5, 0.5)));
});
QUnit.test("getLabelPosition from polygon geometry with complex shape", function(assert) {
	var g = {
		"type": "Polygon",
		"coordinates": [ [
			[ 0.0, 0.0 ],
			[ 1.0, 0.0 ],
			[ 0.0, 0.5 ],
			[ 1.0, 1.0 ],
			[ 0.0, 1.0 ],
			[ -0.5, 0.5 ],
			[ 0.0, 0.0 ]
		] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp instanceof L.LatLng);
	assert.ok(OLU.util.pointInPolygon([ lp.lng, lp.lat ], g.coordinates[0]));
});
QUnit.test("getLabelPosition from multipolygon geometry", function(assert) {
	var g = {
		"type": "MultiPolygon",
		"coordinates": [ [ [
			[ 0.0, 0.0 ],
			[ 1.0, 0.0 ],
			[ 0.0, 0.5 ],
			[ 1.0, 1.0 ],
			[ 0.0, 1.0 ],
			[ -0.5, 0.5 ],
			[ 0.0, 0.0 ]
		] ] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var lp = fg.getLabelPosition();
	
	assert.ok(lp instanceof L.LatLng);
	assert.ok(OLU.util.pointInPolygon([ lp.lng, lp.lat ], g.coordinates[0][0]));
});

//asLatLng
QUnit.test("asLatLng from invalid type", function(assert) {
	var g = {
		"type": "InvalidType",
		"coordinates": []
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.asLatLng();
	
	assert.ok(result === null);
});
QUnit.test("asLatLng from point", function(assert) {
	var g = {
		"type": "Point",
		"coordinates": [ 1.0, 2.0 ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.asLatLng();
	
	assert.ok(result instanceof L.LatLng);
	assert.ok(result.equals(L.latLng(2.0, 1.0)));
});
QUnit.test("asLatLng from linestring", function(assert) {
	var g = {
		"type": "LineString",
		"coordinates": [
		[ 0.0, 0.0 ],
		[ 1.0, 2.0 ],
		[ 3.0, 4.0 ],
		[ 5.0, 6.0 ]
		]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.asLatLng();
	
	assert.equal(result.length, 4);
	assert.ok(result[0] instanceof L.LatLng);
	assert.ok(result[0].equals(L.latLng(0.0, 0.0)));
	assert.ok(result[1] instanceof L.LatLng);
	assert.ok(result[1].equals(L.latLng(2.0, 1.0)));
	assert.ok(result[2] instanceof L.LatLng);
	assert.ok(result[2].equals(L.latLng(4.0, 3.0)));
	assert.ok(result[3] instanceof L.LatLng);
	assert.ok(result[3].equals(L.latLng(6.0, 5.0)));
});
QUnit.test("asLatLng from polygon", function(assert) {
	var g = {
		"type": "Polygon",
		"coordinates": [ [
		[ 0.0, 0.0 ],
		[ 1.0, 0.0 ],
		[ 1.0, 1.0 ],
		[ 0.0, 1.0 ],
		[ 0.0, 0.0 ]
		] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.asLatLng();
	
	assert.equal(result.length, 1);
	assert.equal(result[0].length, 5);
	assert.ok(result[0][0] instanceof L.LatLng);
	assert.ok(result[0][0].equals(L.latLng(0.0, 0.0)));
	assert.ok(result[0][1] instanceof L.LatLng);
	assert.ok(result[0][1].equals(L.latLng(0.0, 1.0)));
	assert.ok(result[0][2] instanceof L.LatLng);
	assert.ok(result[0][2].equals(L.latLng(1.0, 1.0)));
	assert.ok(result[0][3] instanceof L.LatLng);
	assert.ok(result[0][3].equals(L.latLng(1.0, 0.0)));
	assert.ok(result[0][4] instanceof L.LatLng);
	assert.ok(result[0][4].equals(L.latLng(0.0, 0.0)));
});
QUnit.test("asLatLng from multipolygon", function(assert) {
	var g = {
		"type": "MultiPolygon",
		"coordinates": [ [ [
		[ 0.0, 0.0 ],
		[ 1.0, 0.0 ],
		[ 1.0, 1.0 ],
		[ 0.0, 1.0 ],
		[ 0.0, 0.0 ]
		] ] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.asLatLng();
	
	assert.equal(result.length, 1);
	assert.equal(result[0].length, 1);
	assert.equal(result[0][0].length, 5);
	assert.ok(result[0][0][0] instanceof L.LatLng);
	assert.ok(result[0][0][0].equals(L.latLng(0.0, 0.0)));
	assert.ok(result[0][0][1] instanceof L.LatLng);
	assert.ok(result[0][0][1].equals(L.latLng(0.0, 1.0)));
	assert.ok(result[0][0][2] instanceof L.LatLng);
	assert.ok(result[0][0][2].equals(L.latLng(1.0, 1.0)));
	assert.ok(result[0][0][3] instanceof L.LatLng);
	assert.ok(result[0][0][3].equals(L.latLng(1.0, 0.0)));
	assert.ok(result[0][0][4] instanceof L.LatLng);
	assert.ok(result[0][0][4].equals(L.latLng(0.0, 0.0)));
});

//getBounds
QUnit.test("getBounds from invalid type", function(assert) {
	var g = {
		"type": "InvalidType",
		"coordinates": []
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.getBounds();
	
	assert.ok(result === null);
});
QUnit.test("getBounds from point", function(assert) {
	var g = {
		"type": "Point",
		"coordinates": [ 1.0, 2.0 ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.getBounds();
	
	assert.ok(result instanceof L.LatLngBounds);
	assert.ok(result.equals(L.latLngBounds(L.latLng(2.0, 1.0), L.latLng(2.0, 1.0))));
});
QUnit.test("getBounds from linestring", function(assert) {
	var g = {
		"type": "LineString",
		"coordinates": [
		[ 0.0, 0.0 ],
		[ 1.0, 2.0 ],
		[ 3.0, 4.0 ],
		[ 5.0, 6.0 ]
		]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.getBounds();
	
	assert.ok(result instanceof L.LatLngBounds);
	assert.ok(result.equals(L.latLngBounds(L.latLng(0.0, 0.0), L.latLng(6.0, 5.0))));
});
QUnit.test("getBounds from polygon", function(assert) {
	var g = {
		"type": "Polygon",
		"coordinates": [ [
		[ 0.0, 0.0 ],
		[ 1.0, 0.0 ],
		[ 1.0, 1.0 ],
		[ 0.0, 1.0 ],
		[ 0.0, 0.0 ]
		] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.getBounds();
	
	assert.ok(result instanceof L.LatLngBounds);
	assert.ok(result.equals(L.latLngBounds(L.latLng(0.0, 0.0), L.latLng(1.0, 1.0))));
});
QUnit.test("getBounds from multipolygon", function(assert) {
	var g = {
		"type": "MultiPolygon",
		"coordinates": [ [ [
		[ 0.0, 0.0 ],
		[ 1.0, 0.0 ],
		[ 1.0, 1.0 ],
		[ 0.0, 1.0 ],
		[ 0.0, 0.0 ]
		] ] ]
	};
	
	var fg = new OLU.model.FeatureGeometry(g);
	var result = fg.getBounds();
	
	assert.ok(result instanceof L.LatLngBounds);
	assert.ok(result.equals(L.latLngBounds(L.latLng(0.0, 0.0), L.latLng(1.0, 1.0))));
});
