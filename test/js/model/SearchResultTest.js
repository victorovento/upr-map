/*
 * Test script for model/SearchResult.js
 */

var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../src/OLU");

QUnit.module("Model > SearchResult");


/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with valid parameters", function(assert) {
	var sr1 = new OLU.model.SearchResult(L.latLng(1,2), L.latLngBounds(L.latLng(0,1), L.latLngBounds(2,4)), "A007, University of Rennes 2, Rennes, France", "Room", 1);
    
    assert.ok(sr1.coordinates.equals(L.latLng(1,2)));
	assert.ok(sr1.bbox.equals(L.latLngBounds(L.latLng(0,1), L.latLngBounds(2,4))));
    assert.equal(sr1.name, "A007, University of Rennes 2, Rennes, France");
    assert.equal(sr1.objectType, "Room");
    assert.equal(sr1.level, 1);
});

QUnit.test("Constructor with implicit level value", function(assert) {
	var sr1 = new OLU.model.SearchResult(L.latLng(1,2), L.latLngBounds(L.latLng(0,1), L.latLngBounds(2,4)), "A007, University of Rennes 2, Rennes, France", "Room");
    
    assert.ok(sr1.coordinates.equals(L.latLng(1,2)));
	assert.ok(sr1.bbox.equals(L.latLngBounds(L.latLng(0,1), L.latLngBounds(2,4))));
    assert.equal(sr1.name, "A007, University of Rennes 2, Rennes, France");
    assert.equal(sr1.objectType, "Room");
    assert.equal(sr1.level, 0);
});
