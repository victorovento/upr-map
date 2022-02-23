/*
 * Test script for model/Note.js
 */

var QUnit = require("qunitjs");
var L = require("leaflet");
var OLU = require("../src/OLU");

QUnit.module("Model > Note");


/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with valid parameters", function(assert) {
	var n1 = new OLU.model.Note(123456, L.latLng(1,2), 123456789, "open");
	assert.ok(n1 instanceof OLU.model.Note);
	
	//Check attributes
	assert.equal(n1.id, 123456);
	assert.ok(n1.coordinates.equals(L.latLng(1,2)));
	assert.equal(n1.date, 123456789);
	assert.equal(n1.status, "open");
	assert.equal(n1.comments.length, 0);
});


/*
 * MODIFIERS
 */

//AddComment
QUnit.test("addComment with valid parameters", function(assert) {
	var n1 = new OLU.model.Note(123456, L.latLng(1,2), 123456789, "open");
	
	//Check comments before
	assert.equal(n1.comments.length, 0);
	
	//Insert comment
	n1.addComment(234567899, 1234, "Userla", "commented", "Some things about this note");
	
	//Check insertion
	assert.equal(n1.comments.length, 1);
	assert.equal(n1.comments[0].date, 234567899);
	assert.equal(n1.comments[0].uid, 1234);
	assert.equal(n1.comments[0].user, "Userla");
	assert.equal(n1.comments[0].action, "commented");
	assert.equal(n1.comments[0].text, "Some things about this note");
	
	//New comment
	n1.addComment(334567899, 1235, "Userla2", "closed", "Corrected on map");
	
	//Check insertion
	assert.equal(n1.comments.length, 2);
});
QUnit.test("addComment with anonymous user", function(assert) {
	var n1 = new OLU.model.Note(123456, L.latLng(1,2), 123456789, "open");
	
	//Check comments before
	assert.equal(n1.comments.length, 0);
	
	//Insert comment
	n1.addComment(234567899, "", "", "commented", "Some things about this note");
	
	//Check insertion
	assert.equal(n1.comments.length, 1);
	assert.equal(n1.comments[0].date, 234567899);
	assert.equal(n1.comments[0].uid, null);
	assert.equal(n1.comments[0].user, null);
	assert.equal(n1.comments[0].action, "commented");
	assert.equal(n1.comments[0].text, "Some things about this note");
	
	//Check insertion
	assert.equal(n1.comments.length, 1);
});
