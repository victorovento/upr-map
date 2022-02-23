/*
 * Test script for Notes.js
 */

var QUnit = require("qunitjs");
var L = require("leaflet");
var $ = require("jquery");
var OLU = require('../../../src/OLU');

QUnit.module("Ctrl > Provider > Data > Notes");

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
QUnit.test("Constructor with valid parameters", function(assert) {
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	
	assert.ok(n instanceof OLU.ctrl.provider.data.Notes);
});


/*
 * OTHER METHODS
 */

//download
QUnit.test("download with invalid BBox", function(assert) {
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	
	var done = assert.async();
	var success = function(notes) {
		assert.ok(false);
		done();
	};
	var fail = function() { throw new Error("custom"); };
	
	assert.throws(
		function() { n.download(null, success, fail) },
		new Error("ctrl.provider.data.Notes.invalidBbox")
	);
	done();
});
QUnit.test("download with invalid success function", function(assert) {
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	
	var fail = function() { throw new Error("custom"); };
	
	assert.throws(
		function() { n.download(L.latLngBounds(L.latLng(48.0761, -1.7196), L.latLng(48.1504, -1.5954)), null, fail) },
		new Error("ctrl.provider.data.Notes.invalidSuccessFunction")
	);
});
QUnit.test("download with valid parameters", function(assert) {
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	
	var done = assert.async();
	var success = function(notes) {
		assert.ok(notes.length > 0);
		assert.ok(notes[0] instanceof OLU.model.Note);
		done();
	};
	
	n.download(L.latLngBounds(L.latLng(48.0761, -1.7196), L.latLng(48.1504, -1.5954)), success, function() { done(); throw new Error("fail"); });
});
QUnit.test("download with valid parameters but no notes found", function(assert) {
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	var done = assert.async();
	
	try {
		n.download(
			L.latLngBounds(L.latLng(-28.3005, 58.3545), L.latLng(-28.3105, 58.3645)),
			function() { done(); throw new Error("shouldn't have worked"); },
			function() { assert.ok(true); done(); }
		);
	}
	catch(e) {
		assert.equal(e, new Error("custom"));
		done();
	}
});

//parse
QUnit.test("parse with valid XML", function(assert) {
	var xml = $.parseXML(
		'<osm version="0.6" generator="OpenStreetMap server">'+
			'<note lon="-0.125347" lat="51.568433">'+
				'<id>110052</id>'+
				'<url>http://api.openstreetmap.org/api/0.6/notes/110052</url>'+
				'<reopen_url>http://api.openstreetmap.org/api/0.6/notes/110052/reopen</reopen_url>'+
				'<date_created>2014-01-30 14:40:53 UTC</date_created>'+
				'<status>closed</status>'+
				'<date_closed>2016-04-30 22:09:49 UTC</date_closed>'+
				'<comments>'+
					'<comment>'+
						'<date>2014-01-30 14:40:53 UTC</date>'+
						'<action>opened</action>'+
						'<text>Some bug found !!</text>'+
						'<html><p>Some bug found !!</p></html>'+
					'</comment>'+
					'<comment>'+
						'<date>2016-04-30 22:09:49 UTC</date>'+
						'<uid>1611</uid>'+
						'<user>Harry Wood</user>'+
						'<user_url>http://www.openstreetmap.org/user/Harry%20Wood</user_url>'+
						'<action>closed</action>'+
						'<text>I finally went and took a look at this today. Took me six years! The solution to this bug is kind of an an anticlimax.Yes the footpath connects up in a straight line to the other footpath. </text>'+
						'<html><p>I finally went and took a look at this today. Took me six years! The solution to this bug is kind of an an anticlimax.Yes the footpath connects up in a straight line to the other footpath. </p></html>'+
					'</comment>'+
				'</comments>'+
			'</note>'+
			'<note lon="-0.1722407" lat="51.4731304">'+
				'<id>557299</id>'+
				'<url>http://api.openstreetmap.org/api/0.6/notes/557299</url>'+
				'<reopen_url>http://api.openstreetmap.org/api/0.6/notes/557299/reopen</reopen_url>'+
				'<date_created>2016-04-30 14:43:40 UTC</date_created>'+
				'<status>closed</status>'+
				'<date_closed>2016-04-30 18:00:53 UTC</date_closed>'+
				'<comments>'+
					'<comment>'+
						'<date>2016-04-30 14:43:40 UTC</date>'+
						'<action>opened</action>'+
						'<text>Ecole de Battersea</text>'+
						'<html><p>Ecole de Battersea</p></html>'+
					'</comment>'+
					'<comment>'+
						'<date>2016-04-30 18:00:53 UTC</date>'+
						'<uid>12992</uid>'+
						'<user>trigpoint</user>'+
						'<user_url>http://www.openstreetmap.org/user/trigpoint</user_url>'+
						'<action>closed</action>'+
						'<text>Already mapped, a bit to the north</text>'+
						'<html><p>Already mapped, a bit to the north</p></html>'+
					'</comment>'+
				'</comments>'+
			'</note>'+
		'</osm>'
	);
	
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	var done = assert.async();
	var success = function(notes) {
		assert.equal(notes.length, 2);
		
		assert.ok(notes[0] instanceof OLU.model.Note);
		assert.equal(notes[0].id, 110052);
		assert.ok(notes[0].coordinates.equals(L.latLng(51.568433, -0.125347)));
		assert.equal(notes[0].date, "2014-01-30 14:40:53 UTC");
		assert.equal(notes[0].status, "closed");
		assert.equal(notes[0].comments.length, 2);
		
		assert.equal(notes[0].comments[0].date, "2014-01-30 14:40:53 UTC");
		assert.equal(notes[0].comments[0].uid, null);
		assert.equal(notes[0].comments[0].user, null);
		assert.equal(notes[0].comments[0].action, "opened");
		assert.equal(notes[0].comments[0].text, "Some bug found !!");
		
		assert.equal(notes[0].comments[1].date, "2016-04-30 22:09:49 UTC");
		assert.equal(notes[0].comments[1].uid, 1611);
		assert.equal(notes[0].comments[1].user, "Harry Wood");
		assert.equal(notes[0].comments[1].action, "closed");
		assert.equal(notes[0].comments[1].text, "I finally went and took a look at this today. Took me six years! The solution to this bug is kind of an an anticlimax.Yes the footpath connects up in a straight line to the other footpath. ");
		
		assert.ok(notes[1] instanceof OLU.model.Note);
		assert.equal(notes[1].id, 557299);
		assert.ok(notes[1].coordinates.equals(L.latLng(51.4731304, -0.1722407)));
		assert.equal(notes[1].date, "2016-04-30 14:43:40 UTC");
		assert.equal(notes[1].status, "closed");
		assert.equal(notes[1].comments.length, 2);
		
		assert.equal(notes[1].comments[0].date, "2016-04-30 14:43:40 UTC");
		assert.equal(notes[1].comments[0].uid, null);
		assert.equal(notes[1].comments[0].user, null);
		assert.equal(notes[1].comments[0].action, "opened");
		assert.equal(notes[1].comments[0].text, "Ecole de Battersea");
		
		assert.equal(notes[1].comments[1].date, "2016-04-30 18:00:53 UTC");
		assert.equal(notes[1].comments[1].uid, 12992);
		assert.equal(notes[1].comments[1].user, "trigpoint");
		assert.equal(notes[1].comments[1].action, "closed");
		assert.equal(notes[1].comments[1].text, "Already mapped, a bit to the north");
		
		done();
	};
	
	n._parse(xml, success);
});
QUnit.test("parse with valid XML but no notes in it", function(assert) {
	var xml = $.parseXML('<osm version="0.6" generator="OpenStreetMap server"></osm>');
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	var fail = function() { throw new Error("custom"); };
	
	assert.throws(
		function() { n._parse(xml, function() {}, fail) },
		new Error("custom")
	);
});
QUnit.test("parse with valid XML but no notes in it and no fail function defined", function(assert) {
	var xml = $.parseXML('<osm version="0.6" generator="OpenStreetMap server"></osm>');
	var n = new OLU.ctrl.provider.data.Notes(config.api.osm);
	
	assert.throws(
		function() { n._parse(xml, function() {}) },
		new Error("ctrl.provider.data.Notes.noNotesFound")
	);
});
