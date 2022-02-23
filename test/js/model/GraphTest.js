/*
 * Test script for Graph.js
 */

var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../src/OLU");

QUnit.module("Model > Graph");

/*
 * CONSTRUCTOR
 */
//From OSM data
QUnit.test("Create from OSM Data (oneway or not)", function(assert) {
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
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 1);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 1);
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1);
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	n1.addNeighbour(n2, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n1, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n3, n2.coordinates.distanceTo(n3.coordinates));
	n2.addNeighbour(n4, n2.coordinates.distanceTo(n4.coordinates));
	n4.addNeighbour(n2, n2.coordinates.distanceTo(n4.coordinates));
	
	
	//Check
	assert.equal(g1._graph.length, 3);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	assert.ok(g1._graph[2].equals(n4));
	//assert.ok(g1._graph[3].equals(n4));
});
QUnit.test("Create from OSM Data (ways on one level)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 2,"nodes": [2,3],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 3,"nodes": [2,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 4,"nodes": [2,4],"tags": {"trash": "yes","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 1);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 1);
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1);
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	n1.addNeighbour(n2, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n1, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n3, n2.coordinates.distanceTo(n3.coordinates));
	n3.addNeighbour(n2, n2.coordinates.distanceTo(n3.coordinates));
	n2.addNeighbour(n4, n2.coordinates.distanceTo(n4.coordinates));
	n4.addNeighbour(n2, n2.coordinates.distanceTo(n4.coordinates));
	
	
	//Check
	assert.equal(g1._graph.length, 4);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	assert.ok(g1._graph[2].equals(n3));
	assert.ok(g1._graph[3].equals(n4));
});
QUnit.test("Create from OSM Data (stairs)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "0"}},
		{"type": "way","id": 2,"nodes": [2,3],"tags": {"highway": "steps","level": "0;1"}},
		{"type": "way","id": 3,"nodes": [3,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123,"tags":{"door":"no","level":"0"}},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246,"tags":{"door":"no","level":"1"}},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 0);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 0, null, "door");
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1, null, "door");
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	n1.addNeighbour(n2, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n1, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n3, OLU.util.distanceLevels(n2.coordinates, 0, n3.coordinates, 1));
	n3.addNeighbour(n2, OLU.util.distanceLevels(n2.coordinates, 0, n3.coordinates, 1));
	n3.addNeighbour(n4, OLU.util.distanceLevels(n3.coordinates, 1, n4.coordinates, 1));
	n4.addNeighbour(n3, OLU.util.distanceLevels(n3.coordinates, 1, n4.coordinates, 1));
	
	
	//Check
	assert.equal(g1._graph.length, 4);
	//console.log(g1._graph);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	assert.ok(g1._graph[2].equals(n3));
	assert.ok(g1._graph[3].equals(n4));
});
QUnit.test("Create from OSM Data (invalid stairs)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "0"}},
		{"type": "way","id": 2,"nodes": [2,3],"tags": {"highway": "steps","level": "0;1"}},
		{"type": "way","id": 3,"nodes": [3,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 0);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 0);
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1);
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	n1.addNeighbour(n2, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n1, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n3.addNeighbour(n4, OLU.util.distanceLevels(n3.coordinates, 1, n4.coordinates, 1));
	n4.addNeighbour(n3, OLU.util.distanceLevels(n3.coordinates, 1, n4.coordinates, 1));
	
	
	//Check
	assert.equal(g1._graph.length, 4);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	assert.ok(g1._graph[2].equals(n3));
	assert.ok(g1._graph[3].equals(n4));
});
QUnit.test("Create from OSM Data (way starting at middle of another)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2,3],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 2,"nodes": [2,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 1);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 1);
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1);
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	n1.addNeighbour(n2, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n1, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n3, n2.coordinates.distanceTo(n3.coordinates));
	n3.addNeighbour(n2, n2.coordinates.distanceTo(n3.coordinates));
	n2.addNeighbour(n4, n2.coordinates.distanceTo(n4.coordinates));
	n4.addNeighbour(n2, n2.coordinates.distanceTo(n4.coordinates));
	
	
	//Check
	assert.equal(g1._graph.length, 4);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	assert.ok(g1._graph[2].equals(n3));
	assert.ok(g1._graph[3].equals(n4));
});
QUnit.test("Create from OSM Data (two disconnected levels)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2,3],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 2,"nodes": [3,4],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 3,"nodes": [1,4],"tags": {"highway": "footway","level": "2"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 1);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 1);
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1);
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	var n1_2 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 2);
	var n4_2 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 2);
	n1.addNeighbour(n2, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n1, n1.coordinates.distanceTo(n2.coordinates));
	n2.addNeighbour(n3, n2.coordinates.distanceTo(n3.coordinates));
	n3.addNeighbour(n2, n2.coordinates.distanceTo(n3.coordinates));
	n3.addNeighbour(n4, n4.coordinates.distanceTo(n3.coordinates));
	n4.addNeighbour(n3, n4.coordinates.distanceTo(n3.coordinates));
	n1_2.addNeighbour(n4_2, n1_2.coordinates.distanceTo(n4_2.coordinates));
	n4_2.addNeighbour(n1_2, n1_2.coordinates.distanceTo(n4_2.coordinates));
	
	
	//Check
	assert.equal(g1._graph.length, 6);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n1_2));
	assert.ok(g1._graph[2].equals(n2));
	assert.ok(g1._graph[3].equals(n3));
	assert.ok(g1._graph[4].equals(n4));
	assert.ok(g1._graph[5].equals(n4_2));
});
QUnit.test("Create from OSM Data (stairs with intermediate nodes)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "0"}},
		{"type": "way","id": 2,"nodes": [2,3,4,5],"tags": {"highway": "steps","level": "0;1"}},
		{"type": "way","id": 3,"nodes": [5,6],"tags": {"highway": "footway","level": "1"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123,"tags":{"door":"no","level":"0"}},
		{"type": "node","id": 3,"lat": 48.84518,"lon": 2.37427},
		{"type": "node","id": 4,"lat": 48.84519,"lon": 2.37428},
		{"type": "node","id": 5,"lat": 48.8452128,"lon": 2.3743246,"tags":{"door":"no","level":"1"}},
		{"type": "node","id": 6,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 0);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 0, null, "door");
	var n3 = new OLU.model.Node(L.latLng(48.84518, 2.37427), 0.5);
	var n4 = new OLU.model.Node(L.latLng(48.84519, 2.37428), 0.5);
	var n5 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1, null, "door");
	var n6 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 1);
	n1.addNeighbour(n2, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n1, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n3, OLU.util.distanceLevels(n2.coordinates, 0, n3.coordinates, 0.5));
	n3.addNeighbour(n2, OLU.util.distanceLevels(n2.coordinates, 0, n3.coordinates, 0.5));
	n3.addNeighbour(n4, OLU.util.distanceLevels(n4.coordinates, 0.5, n3.coordinates, 0.5));
	n4.addNeighbour(n3, OLU.util.distanceLevels(n4.coordinates, 0.5, n3.coordinates, 0.5));
	n4.addNeighbour(n5, OLU.util.distanceLevels(n4.coordinates, 0.5, n5.coordinates, 1));
	n5.addNeighbour(n4, OLU.util.distanceLevels(n4.coordinates, 0.5, n5.coordinates, 1));
	n5.addNeighbour(n6, OLU.util.distanceLevels(n5.coordinates, 1, n6.coordinates, 1));
	n6.addNeighbour(n5, OLU.util.distanceLevels(n5.coordinates, 1, n6.coordinates, 1));
	
	
	//Check
	assert.equal(g1._graph.length, 6);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	assert.ok(g1._graph[2].equals(n3));
	assert.ok(g1._graph[3].equals(n4));
	assert.ok(g1._graph[4].equals(n5));
	assert.ok(g1._graph[5].equals(n6));
});
QUnit.test("Create from OSM Data (elevator as node)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2],"tags": {"highway": "footway","level": "0"}},
		{"type": "way","id": 2,"nodes": [1,3],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 3,"nodes": [1,4],"tags": {"highway": "footway","level": "2"}},
		{"type": "node","id": 1,"lat": 48.8450691,"lon": 2.3740886,"tags":{"highway":"elevator","level":"0-2"}},
		{"type": "node","id": 2,"lat": 48.8451673,"lon": 2.3742123},
		{"type": "node","id": 3,"lat": 48.8452128,"lon": 2.3743246},
		{"type": "node","id": 4,"lat": 48.8452412,"lon": 2.3742728}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1_0 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 0);
	var n1_1 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 1);
	var n1_2 = new OLU.model.Node(L.latLng(48.8450691, 2.3740886), 2);
	var n2 = new OLU.model.Node(L.latLng(48.8451673, 2.3742123), 0);
	var n3 = new OLU.model.Node(L.latLng(48.8452128, 2.3743246), 1);
	var n4 = new OLU.model.Node(L.latLng(48.8452412, 2.3742728), 2);
	n1_0.addNeighbour(n2, OLU.util.distanceLevels(n1_0.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n1_0, OLU.util.distanceLevels(n1_0.coordinates, 0, n2.coordinates, 0));
	n1_1.addNeighbour(n3, OLU.util.distanceLevels(n1_1.coordinates, 1, n3.coordinates, 1));
	n3.addNeighbour(n1_1, OLU.util.distanceLevels(n1_1.coordinates, 1, n3.coordinates, 1));
	n1_2.addNeighbour(n4, OLU.util.distanceLevels(n1_2.coordinates, 2, n4.coordinates, 2));
	n4.addNeighbour(n1_2, OLU.util.distanceLevels(n1_2.coordinates, 2, n4.coordinates, 2));
	n1_0.addNeighbour(n1_1, OLU.util.distanceLevels(n1_0.coordinates, 0, n1_1.coordinates, 1));
	n1_1.addNeighbour(n1_0, OLU.util.distanceLevels(n1_0.coordinates, 0, n1_1.coordinates, 1));
	n1_1.addNeighbour(n1_2, OLU.util.distanceLevels(n1_1.coordinates, 1, n1_2.coordinates, 2));
	n1_2.addNeighbour(n1_1, OLU.util.distanceLevels(n1_1.coordinates, 1, n1_2.coordinates, 2));
	
	//Check
	assert.equal(g1._graph.length, 6);
	//console.log(g1._graph);
	assert.ok(g1._graph[0].equals(n1_0));
	assert.ok(g1._graph[1].equals(n1_1));
	assert.ok(g1._graph[2].equals(n1_2));
	assert.ok(g1._graph[3].equals(n2));
	assert.ok(g1._graph[4].equals(n3));
	assert.ok(g1._graph[5].equals(n4));
	
	//Test shortest path
	var path = g1._process(n2, n4);
	assert.equal(path.length, 5);
	assert.ok(path[0].equals(n2));
	assert.ok(path[1].equals(n1_0));
	assert.ok(path[2].equals(n1_1));
	assert.ok(path[3].equals(n1_2));
	assert.ok(path[4].equals(n4));
});
QUnit.test("Create from OSM Data (simple elevator as area)", function(assert) {
	var data = [
		{"type": "way","id": 1,"nodes": [1,2,3,4],"tags": {"highway": "elevator","level": "0-2"}},
		{"type": "way","id": 1,"nodes": [1,11],"tags": {"highway": "footway","level": "0"}},
		{"type": "way","id": 2,"nodes": [3,31],"tags": {"highway": "footway","level": "1"}},
		{"type": "way","id": 3,"nodes": [1,12],"tags": {"highway": "footway","level": "2"}},
		{"type": "node","id": 1,"lat": 0,"lon": 0,"tags":{"door":"sliding","repeat_on":"0;2"}},
		{"type": "node","id": 2,"lat": 0,"lon": 0.1,"tags":{"information":"board","level":"0"}},
		{"type": "node","id": 3,"lat": 0.1,"lon": 0.1,"tags":{"door":"sliding","level":"1"}},
		{"type": "node","id": 4,"lat": 0.1,"lon": 0},
		{"type": "node","id": 11,"lat": -0.1,"lon": -0.1},
		{"type": "node","id": 12,"lat": -0.1,"lon": -0.2},
		{"type": "node","id": 31,"lat": 0.2,"lon": 0.2}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Create result graph
	var n1_0 = new OLU.model.Node(L.latLng(0, 0), 0, null, "door");
	var n1_2 = new OLU.model.Node(L.latLng(0, 0), 2, null, "door");
	var n3 = new OLU.model.Node(L.latLng(0.1, 0.1), 1, null, "door");
	var n11 = new OLU.model.Node(L.latLng(-0.1, -0.1), 0);
	var n12 = new OLU.model.Node(L.latLng(-0.1, -0.2), 2);
	var n31 = new OLU.model.Node(L.latLng(0.2, 0.2), 1);
	
	n1_0.addNeighbour(n11, OLU.util.distanceLevels(n1_0.coordinates, 0, n11.coordinates, 0));
	n11.addNeighbour(n1_0, OLU.util.distanceLevels(n1_0.coordinates, 0, n11.coordinates, 0));
	n1_2.addNeighbour(n12, OLU.util.distanceLevels(n1_2.coordinates, 2, n12.coordinates, 2));
	n12.addNeighbour(n1_2, OLU.util.distanceLevels(n1_2.coordinates, 2, n12.coordinates, 2));
	n3.addNeighbour(n31, OLU.util.distanceLevels(n3.coordinates, 1, n31.coordinates, 1));
	n31.addNeighbour(n3, OLU.util.distanceLevels(n3.coordinates, 1, n31.coordinates, 1));
	n1_0.addNeighbour(n3, OLU.util.distanceLevels(n1_0.coordinates, 0, n3.coordinates, 1), "elevator");
	n3.addNeighbour(n1_0, OLU.util.distanceLevels(n1_0.coordinates, 0, n3.coordinates, 1), "elevator");
	n3.addNeighbour(n1_2, OLU.util.distanceLevels(n1_2.coordinates, 2, n3.coordinates, 1), "elevator");
	n1_2.addNeighbour(n3, OLU.util.distanceLevels(n1_2.coordinates, 2, n3.coordinates, 1), "elevator");
	
	//Check
	assert.equal(g1._graph.length, 6);
	//console.log(g1._graph);
	assert.ok(g1._graph[0].equals(n1_0));
	assert.ok(g1._graph[1].equals(n1_2));
	assert.ok(g1._graph[2].equals(n3));
	assert.ok(g1._graph[3].equals(n11));
	assert.ok(g1._graph[4].equals(n12));
	assert.ok(g1._graph[5].equals(n31));
	
	//Test shortest path
	var path = g1._process(n11, n12);
	//console.log(path);
	assert.equal(path.length, 5);
	assert.ok(path[0].equals(n11));
	assert.ok(path[1].equals(n1_0));
	assert.ok(path[2].equals(n3));
	assert.ok(path[3].equals(n1_2));
	assert.ok(path[4].equals(n12));
});
QUnit.test("Create from OSM Data (avoid transitions)", function(assert) {
	var data = [
		{"type": "way","id": 0,"nodes": [1,2],"tags":{"highway": "footway","level": "0"}},
		{"type": "way","id": 1,"nodes": [3,4],"tags":{"highway": "elevator","level": "0-2"}},
		{"type": "way","id": 2,"nodes": [5,6],"tags":{"highway": "steps","level": "0;1"}},
		{"type": "way","id": 3,"nodes": [7,8],"tags":{"highway": "steps","conveying":"yes","level": "0;1"}},
		{"type": "node","id": 1,"lat": 0,"lon": 0},
		{"type": "node","id": 2,"lat": 0,"lon": 0.1},
		{"type": "node","id": 3,"lat": 1,"lon": 1,"tags":{"door":"sliding","level":"0"}},
		{"type": "node","id": 4,"lat": 1,"lon": 1.1,"tags":{"door":"sliding","level":"2"}},
		{"type": "node","id": 5,"lat": 2,"lon": 2,"tags":{"door":"no","level":"0"}},
		{"type": "node","id": 6,"lat": 2,"lon": 2.1,"tags":{"door":"no","level":"1"}},
		{"type": "node","id": 7,"lat": 3,"lon": 3,"tags":{"door":"no","level":"0"}},
		{"type": "node","id": 8,"lat": 3,"lon": 3.1,"tags":{"door":"no","level":"1"}}
		
	];
	
	//Create result graph
	var n1 = new OLU.model.Node(L.latLng(0, 0), 0);
	var n2 = new OLU.model.Node(L.latLng(0, 0.1), 0);
	var n3 = new OLU.model.Node(L.latLng(1, 1), 0, null, "door");
	var n4 = new OLU.model.Node(L.latLng(1, 1.1), 2, null, "door");
	var n5 = new OLU.model.Node(L.latLng(2, 2), 0, null, "door");
	var n6 = new OLU.model.Node(L.latLng(2, 2.1), 1, null, "door");
	var n7 = new OLU.model.Node(L.latLng(3, 3), 0, null, "door");
	var n8 = new OLU.model.Node(L.latLng(3, 3.1), 1, null, "door");
	
	n1.addNeighbour(n2, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n2.addNeighbour(n1, OLU.util.distanceLevels(n1.coordinates, 0, n2.coordinates, 0));
	n3.addNeighbour(n4, OLU.util.distanceLevels(n3.coordinates, 0, n4.coordinates, 2));
	n4.addNeighbour(n3, OLU.util.distanceLevels(n3.coordinates, 0, n4.coordinates, 2));
	n5.addNeighbour(n6, OLU.util.distanceLevels(n5.coordinates, 0, n6.coordinates, 1));
	n6.addNeighbour(n5, OLU.util.distanceLevels(n5.coordinates, 0, n6.coordinates, 1));
	n7.addNeighbour(n8, OLU.util.distanceLevels(n7.coordinates, 0, n8.coordinates, 1));
	n8.addNeighbour(n7, OLU.util.distanceLevels(n7.coordinates, 0, n8.coordinates, 1));
	
	/*
		* First graph, avoid all transitions
		*/
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data, ["stairs", "escalator", "elevator" ]);
	
	//Check
	assert.equal(g1._graph.length, 2);
	assert.ok(g1._graph[0].equals(n1));
	assert.ok(g1._graph[1].equals(n2));
	
	/*
		* Avoid only stairs
		*/
	var g2 = new OLU.model.Graph();
	g2.createFromOSMData(data, ["stairs"]);
	
	//Check
	assert.equal(g2._graph.length, 6);
	assert.ok(g2._graph[0].equals(n1));
	assert.ok(g2._graph[1].equals(n2));
	assert.ok(g2._graph[2].equals(n3));
	assert.ok(g2._graph[3].equals(n4));
	assert.ok(g2._graph[4].equals(n7));
	assert.ok(g2._graph[5].equals(n8));
	
	/*
		* Avoid only elevators
		*/
	var g3 = new OLU.model.Graph();
	g3.createFromOSMData(data, ["elevator"]);
	
	//Check
	assert.equal(g3._graph.length, 6);
	assert.ok(g3._graph[0].equals(n1));
	assert.ok(g3._graph[1].equals(n2));
	assert.ok(g3._graph[2].equals(n5));
	assert.ok(g3._graph[3].equals(n6));
	assert.ok(g3._graph[4].equals(n7));
	assert.ok(g3._graph[5].equals(n8));
});

//From nodes
QUnit.test("Create from nodes", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(0, 0), 0);
	var n2 = new OLU.model.Node(L.latLng(1, 0), 0);
	var n3 = new OLU.model.Node(L.latLng(1, 1), 0);
	var n4 = new OLU.model.Node(L.latLng(0, 1), 0);
	
	//Build graph
	n1.addNeighbour(n2, 1);
	n1.addNeighbour(n3, 2);
	n1.addNeighbour(n4, 3);
	n2.addNeighbour(n3, 1);
	n4.addNeighbour(n3, 1);
	
	var graph = [ n1, n2, n3, n4 ];
	
	//Create A*
	var as1 = new OLU.model.Graph();
	as1.createFromNodes(graph);
	assert.ok(true);
});


/*
 * OTHER METHODS
 */

//_findNearestNode
QUnit.test("Find nearest node valid", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(48.1211157104915, -1.7040754297291494), 0);
	var n2 = new OLU.model.Node(L.latLng(48.12111533622601, -1.7039823620829195), 0);
	var n3 = new OLU.model.Node(L.latLng(48.12111084503996, -1.7040703838929083), 1);
	var n4 = new OLU.model.Node(L.latLng(48.121101488401074, -1.7040883246439886), 0);
	
	//Create graph
	var graph = [ n1, n2, n3, n4 ];
	var g1 = new OLU.model.Graph();
	g1.createFromNodes(graph);
	
	assert.ok(g1._findNearestNode(L.latLng(48.12110597958796, -1.7040759903776208), 0).equals(n4));
	assert.ok(g1._findNearestNode(L.latLng(48.12110597958796, -1.7040759903776208), 1).equals(n3));
});
QUnit.test("Find nearest node no valid", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(48.1211157104915, -1.7040754297291494), 0);
	var n2 = new OLU.model.Node(L.latLng(48.12111533622601, -1.7039823620829195), 0);
	var n3 = new OLU.model.Node(L.latLng(48.12111084503996, -1.7040703838929083), 0);
	var n4 = new OLU.model.Node(L.latLng(48.121101488401074, -1.7040883246439886), 0);
	
	//Create graph
	var graph = [ n1, n2, n3, n4 ];
	var g1 = new OLU.model.Graph();
	g1.createFromNodes(graph);
	
	assert.equal(g1._findNearestNode(L.latLng(48.12110597958796, -1.7040759903776208), 1), null);
});

QUnit.test("Find nearest node null level", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(48.0837174, -1.6812299), null);
	var n2 = new OLU.model.Node(L.latLng(48.083981, -1.6803103), 0);
	
	//Create graph
	var graph = [ n1, n2 ];
	var g1 = new OLU.model.Graph();
	g1.createFromNodes(graph);
	
	assert.ok(g1._findNearestNode(L.latLng(48.083982, -1.680309), 0).equals(n2));
});

//findShortestPath
QUnit.test("Find shortest path valid", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(48.119663567472834, -1.7349844588305359), 0);
	var n2 = new OLU.model.Node(L.latLng(48.11964742045143, -1.7349211835803848), 0);
	var n3 = new OLU.model.Node(L.latLng(48.119640132120516, -1.734812752131052), 0);
	var n4 = new OLU.model.Node(L.latLng(48.119586960402366, -1.7349030703176818), 0);
	
	//Set neighbours
	n1.addNeighbour(n2, 1);
	n2.addNeighbour(n3, 1);
	n2.addNeighbour(n4, 1);
	
	//Create graph
	var graph = [ n1, n2, n3, n4 ];
	var g1 = new OLU.model.Graph();
	g1.createFromNodes(graph);
	
	//Find shortest path
	var result = g1.findShortestPath(
		L.latLng(48.11965934680886, -1.7350119980207874),
		0,
		L.latLng(48.11963880696933, -1.7348020826749389),
		0
	);
	
	//Check result
	assert.ok(result[0].equals(n1));
	assert.ok(result[1].equals(n2));
	assert.ok(result[2].equals(n3));
});
QUnit.test("Find shortest path no valid start or end", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(48.119663567472834, -1.7349844588305359), 0);
	var n2 = new OLU.model.Node(L.latLng(48.11964742045143, -1.7349211835803848), 0);
	var n3 = new OLU.model.Node(L.latLng(48.119640132120516, -1.734812752131052), 0);
	var n4 = new OLU.model.Node(L.latLng(48.119586960402366, -1.7349030703176818), 0);
	
	//Set neighbours
	n1.addNeighbour(n2, 1);
	n2.addNeighbour(n3, 1);
	n2.addNeighbour(n4, 1);
	
	//Create graph
	var graph = [ n1, n2, n3, n4 ];
	var g1 = new OLU.model.Graph();
	g1.createFromNodes(graph);
	
	//Test start
	try {
		var result = g1.findShortestPath(
			L.latLng(48.11965934680886, -1.7350119980207874),
			1,
			L.latLng(48.11963880696933, -1.7348020826749389),
			0
		);
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
	
	//Test end
	try {
		var result = g1.findShortestPath(
			L.latLng(48.11965934680886, -1.7350119980207874),
			0,
			L.latLng(48.11963880696933, -1.7348020826749389),
			1
		);
		assert.ok(false);
	}
	catch(e) {
		assert.ok(true);
	}
});
QUnit.test("Find shortest path (through levels, with oneways)", function(assert) {
	var data = [
		{"type":"way","id":379435685,"nodes":[3827342804,3827342815],"tags":{"conveying":"forward","highway":"footway","incline":"down","level":"0;1"}},
		{"type":"way","id":379435690,"nodes":[3827342800,3827342790],"tags":{"conveying":"forward","highway":"footway","incline":"up","level":"0;1"}},
		{"type":"way","id":379435697,"nodes":[3827342242,3827342547],"tags":{"highway":"service","level":"2","oneway":"yes"}},
		{"type":"way","id":379435699,"nodes":[3827342552,3827342549],"tags":{"highway":"service","level":"1;2","oneway":"yes"}},
		{"type":"way","id":379435702,"nodes":[3827342548,3827342243],"tags":{"highway":"service","level":"2","oneway":"yes"}},
		{"type":"way","id":379435707,"nodes":[3827342797,3827342782],"tags":{"highway":"footway","level":"2"}},
		{"type":"way","id":379435710,"nodes":[3827342546,3827342540],"tags":{"highway":"service","level":"1;2","oneway":"yes"}},
		{"type":"way","id":379435719,"nodes":[3827342803,3827342806],"tags":{"conveying":"forward","highway":"footway","incline":"down","level":"1;2"}},
		{"type":"way","id":379435727,"nodes":[3827342804,3827342805,3827342806],"tags":{"highway":"footway","level":"1"}},
		{"type":"way","id":379435728,"nodes":[3827342786,3827342784,3827342782],"tags":{"conveying":"forward","highway":"footway","incline":"up","level":"1;2"}},
		{"type":"way","id":379435736,"nodes":[3827342790,3827342787,3827342786],"tags":{"highway":"footway","level":"1"}},
		{"type":"way","id":379435754,"nodes":[3827342241,3827342514,3827342787,3827342805],"tags":{"highway":"footway","level":"1"}},
		{"type":"way","id":379435760,"nodes":[3827342549,3827342548,3827342547,3827342546],"tags":{"highway":"service","level":"2","oneway":"yes"}},
		{"type":"way","id":379435770,"nodes":[3827342233,3827342507,3827342796,3827342797,3827342803],"tags":{"highway":"footway","level":"2"}},
		{"type":"node","id":3827342233,"lat":48.0838245,"lon":-1.6794517},
		{"type":"node","id":3827342241,"lat":48.0838306,"lon":-1.6798351},
		{"type":"node","id":3827342242,"lat":48.0838310,"lon":-1.6798550},
		{"type":"node","id":3827342243,"lat":48.0838324,"lon":-1.6799481},
		{"type":"node","id":3827342507,"lat":48.0839007,"lon":-1.6794511},
		{"type":"node","id":3827342514,"lat":48.0839052,"lon":-1.6798319},
		{"type":"node","id":3827342540,"lat":48.0839253,"lon":-1.6793787,"tags":{"door":"no","level":"2"}},
		{"type":"node","id":3827342546,"lat":48.0839326,"lon":-1.6797570,"tags":{"door":"no","level":"1"}},
		{"type":"node","id":3827342547,"lat":48.0839338,"lon":-1.6798522},
		{"type":"node","id":3827342548,"lat":48.0839350,"lon":-1.6799453},
		{"type":"node","id":3827342549,"lat":48.0839359,"lon":-1.6800143,"tags":{"door":"no","level":"2"}},
		{"type":"node","id":3827342552,"lat":48.0839403,"lon":-1.6803664,"tags":{"door":"no","level":"1"}},
		{"type":"node","id":3827342782,"lat":48.0839709,"lon":-1.6795712,"tags":{"door":"no","level":"2"}},
		{"type":"node","id":3827342784,"lat":48.0839717,"lon":-1.6796324},
		{"type":"node","id":3827342786,"lat":48.0839737,"lon":-1.6797956,"tags":{"door":"no","level":"1"}},
		{"type":"node","id":3827342787,"lat":48.0839740,"lon":-1.6798295},
		{"type":"node","id":3827342790,"lat":48.0839743,"lon":-1.6798637},
		{"type":"node","id":3827342796,"lat":48.0839765,"lon":-1.6794500},
		{"type":"node","id":3827342797,"lat":48.0839773,"lon":-1.6795433},
		{"type":"node","id":3827342800,"lat":48.0839810,"lon":-1.6803103},
		{"type":"node","id":3827342803,"lat":48.0839835,"lon":-1.6795709,"tags":{"door":"no","level":"2"}},
		{"type":"node","id":3827342804,"lat":48.0839871,"lon":-1.6798633},
		{"type":"node","id":3827342805,"lat":48.0839874,"lon":-1.6798290},
		{"type":"node","id":3827342806,"lat":48.0839877,"lon":-1.6797951,"tags":{"door":"no","level":"1"}},
		{"type":"node","id":3827342815,"lat":48.0839954,"lon":-1.6803100}
	];
	
	var g1 = new OLU.model.Graph();
	g1.createFromOSMData(data);
	
	//Nodes succession
	//3827342241,3827342514,3827342787,3827342786,3827342784,3827342782,3827342797,3827342796,3827342507,3827342233

	//Path
	var path = g1.findShortestPath(L.latLng(48.0838306,-1.6798351), 1, L.latLng(48.0838245,-1.6794517), 2);
	
	//Check result
	//console.log(path);
	assert.equal(path.length, 10);
	assert.equal(path[0].name, "3827342241");
	assert.equal(path[1].name, "3827342514");
	assert.equal(path[2].name, "3827342787");
	assert.equal(path[3].name, "3827342786");
	assert.equal(path[4].name, "3827342784");
	assert.equal(path[5].name, "3827342782");
	assert.equal(path[6].name, "3827342797");
	assert.equal(path[7].name, "3827342796");
	assert.equal(path[8].name, "3827342507");
	assert.equal(path[9].name, "3827342233");
});

//process
QUnit.test("Process", function(assert) {
	//Create nodes
	var n1 = new OLU.model.Node(L.latLng(0, 0), 0);
	var n2 = new OLU.model.Node(L.latLng(1, 0), 0);
	var n3 = new OLU.model.Node(L.latLng(1, 1), 0);
	var n4 = new OLU.model.Node(L.latLng(0, 1), 0);
	var n5 = new OLU.model.Node(L.latLng(-1, -1), 0);
	
	//Build graph
	n1.addNeighbour(n2, 1);
	n1.addNeighbour(n5, 2);
	n1.addNeighbour(n4, 1);
	n2.addNeighbour(n3, 1);
	n4.addNeighbour(n3, 1);
	n5.addNeighbour(n3, 2);
	
	var graph = [ n1, n2, n3, n4, n5 ];
	
	//Create A*
	var as1 = new OLU.model.Graph();
	as1.createFromNodes(graph);
	
	//Process
	var path = as1._process(n1, n3);
	
	//Check
	//console.log(path);
	assert.equal(path.length, 3);
	assert.ok(path[0].equals(n1));
	assert.ok(path[1].equals(n2));
	assert.ok(path[2].equals(n3));
});
