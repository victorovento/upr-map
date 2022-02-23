/*
 * Test script for Node.js
 */

var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../src/OLU");

QUnit.module("Model > Node");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with minimal parameters", function(assert) {
	var n1 = new OLU.model.Node(L.latLng(1, 1), 12);
	
	assert.ok(n1 instanceof OLU.model.Node);
	assert.ok(n1.coordinates.equals(L.latLng(1,1)));
	assert.equal(n1.level, 12);
	assert.equal(n1.name, null);
	assert.equal(n1.type, null);
	assert.equal(n1.neighbours.length, 0);
});
QUnit.test("Constructor with all parameters", function(assert) {
	var n1 = new OLU.model.Node(L.latLng(1, 1), 12, "Porte 12", "door");
	
	assert.ok(n1 instanceof OLU.model.Node);
	assert.ok(n1.coordinates.equals(L.latLng(1,1)));
	assert.equal(n1.level, 12);
	assert.equal(n1.name, "Porte 12");
	assert.equal(n1.type, "door");
	assert.equal(n1.neighbours.length, 0);
});


/*
 * ACCESSORS
 */

//getCost
QUnit.test("Get cost", function(assert) {
	var n1 = new OLU.model.Node(L.latLng(1, 2), 12);
	var n2 = new OLU.model.Node(L.latLng(3, 4), 10);
	var n3 = new OLU.model.Node(L.latLng(5, 6), 12);
	
	n1.addNeighbour(n2, 2);
	n1.addNeighbour(n3, 3);
	
	assert.equal(n1.getCost(n2), 2);
	assert.equal(n1.getCost(n3), 3);
});

//equals
QUnit.test("Equals", function(assert) {
	var n1 = new OLU.model.Node(L.latLng(1, 2), 12);
	var n1bis = new OLU.model.Node(L.latLng(1, 2), 12);
	var n1ter = new OLU.model.Node(L.latLng(1, 2), 12);
	var n1quater = new OLU.model.Node(L.latLng(1, 2), 12);
	var n2 = new OLU.model.Node(L.latLng(3, 4), 10);
	var n2bis = new OLU.model.Node(L.latLng(3, 4), 10);
	var n3 = new OLU.model.Node(L.latLng(5, 6), 12);
	
	n1.addNeighbour(n2, 1.3);
	n1bis.addNeighbour(n2, 1.3);
	n1ter.addNeighbour(n2, 2);
	n1quater.addNeighbour(n2bis, 2);
	
	assert.ok(n1.equals(n1));
	assert.ok(n1.equals(n1bis));
	//assert.notOk(n1.equals(n1ter));
	assert.ok(n1ter.equals(n1quater));
	assert.notOk(n1.equals(n2));
	assert.notOk(n2.equals(n3));
});


/*
 * MODIFIERS
 */

//addNeighbour
QUnit.test("Add neighbour", function(assert) {
	var n1 = new OLU.model.Node(L.latLng(1, 2), 12);
	var n2 = new OLU.model.Node(L.latLng(3, 4), 10);
	var n3 = new OLU.model.Node(L.latLng(5, 6), 12);
	
	assert.equal(n1.neighbours.length, 0);
	
	n1.addNeighbour(n2, 2);
	n1.addNeighbour(n3, 3);
	
	var neighbours = n1.neighbours;
	assert.equal(neighbours.length, 2);
	assert.ok(neighbours[0].equals(n2));
	assert.ok(neighbours[1].equals(n3));
});
