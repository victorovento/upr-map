/*
 * Test script for URL.js
 */

var QUnit = require("qunitjs");
var OLU = require("../../src/OLU");

QUnit.module("Ctrl > Service > URL");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with valid parameters", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?t=1&l=1.5&o=tun#13/48.1126/-1.6613"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.ok(u instanceof OLU.ctrl.service.URL);
});


/*
 * ACCESSORS
 */

//getParameter
QUnit.test("getParameter with valid value", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?t=1&l=1.5&o=tun#13/48.1126/-1.6613"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.equal(u.getParameter("tile"), "1");
	assert.equal(u.getParameter("level"), "1.5");
	assert.equal(u.getParameter("transcend"), true);
	assert.equal(u.getParameter("buildings"), false);
	assert.equal(u.getParameter("pictures"), false);
	assert.equal(u.getParameter("unrendered"), true);
	assert.equal(u.getParameter("notes"), true);
});
QUnit.test("getParameter with invalid value", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?t=1&l=1.5&o=tun#13/48.1126/-1.6613"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.throws(
		function() { u.getParameter("missing") },
		new Error("ctrl.service.URL.invalidParameter")
	);
});
QUnit.test("getParameter with valid value but missing in URL", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?t=1&o=tun#13/48.1126/-1.6613"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.equal(u.getParameter("tile"), "1");
	assert.equal(u.getParameter("level"), null);
	assert.equal(u.getParameter("transcend"), true);
	assert.equal(u.getParameter("buildings"), false);
	assert.equal(u.getParameter("pictures"), false);
	assert.equal(u.getParameter("unrendered"), true);
	assert.equal(u.getParameter("notes"), true);
});
QUnit.test("getParameter with old URL from readURL", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?lat=48.121335&lon=-1.711303&z=21&t=0&lvl=-2&tcd=1&urd=0&bdg=0&pic=0&nte=0&ilv=0"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.equal(u.getParameter("tile"), "0");
	assert.equal(u.getParameter("level"), "-2");
	assert.equal(u.getParameter("transcend"), true);
	assert.equal(u.getParameter("buildings"), false);
	assert.equal(u.getParameter("pictures"), false);
	assert.equal(u.getParameter("unrendered"), false);
	assert.equal(u.getParameter("notes"), false);
	assert.equal(u.getParameter("deprecated_lat"), "48.121335");
	assert.equal(u.getParameter("deprecated_lon"), "-1.711303");
	assert.equal(u.getParameter("deprecated_zoom"), "21");
});
QUnit.test("getParameter with old short URL from readURL", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?s=m.39h+-1.IVG+U6+-2.0+0"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.equal(u.getParameter("tile"), "0");
	assert.equal(u.getParameter("level"), "-2");
	assert.equal(u.getParameter("transcend"), true);
	assert.equal(u.getParameter("buildings"), false);
	assert.equal(u.getParameter("pictures"), false);
	assert.equal(u.getParameter("unrendered"), false);
	assert.equal(u.getParameter("notes"), false);
	assert.equal(u.getParameter("deprecated_lat"), "48.12133");
	assert.equal(u.getParameter("deprecated_lon"), "-1.7113");
	assert.equal(u.getParameter("deprecated_zoom"), "21");
});
QUnit.test("getParameter with no query part from readURL", function(assert) {
	var geturl = function() { return "http://openlevelup.net/"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.equal(u.getParameter("tile"), null);
	assert.equal(u.getParameter("level"), null);
	assert.equal(u.getParameter("transcend"), null);
	assert.equal(u.getParameter("buildings"), null);
	assert.equal(u.getParameter("pictures"), null);
	assert.equal(u.getParameter("unrendered"), null);
	assert.equal(u.getParameter("notes"), null);
	assert.equal(u.getParameter("deprecated_lat"), null);
	assert.equal(u.getParameter("deprecated_lon"), null);
	assert.equal(u.getParameter("deprecated_zoom"), null);
});
QUnit.test("getParameter with a hash part and no query part from readURL", function(assert) {
	var geturl = function() { return "http://openlevelup.net/map.html#13/48.1126/-1.6613"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.equal(u.getParameter("tile"), null);
	assert.equal(u.getParameter("level"), null);
	assert.equal(u.getParameter("transcend"), null);
	assert.equal(u.getParameter("buildings"), null);
	assert.equal(u.getParameter("pictures"), null);
	assert.equal(u.getParameter("unrendered"), null);
	assert.equal(u.getParameter("notes"), null);
	assert.equal(u.getParameter("deprecated_lat"), null);
	assert.equal(u.getParameter("deprecated_lon"), null);
	assert.equal(u.getParameter("deprecated_zoom"), null);
});


/*
 * MODIFIERS
 */

//setParameter
QUnit.test("setParameter with valid value", function(assert) {
	var done = assert.async();
	var geturl = function() { return "http://openlevelup.net/?l=1.5&o=tun#13/48.1126/-1.6613"; };
	var seturl = function(url) { assert.equal(url, "http://openlevelup.net/?l=0.5&o=bp#13/48.1126/-1.6613"); done(); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	u.setParameter("level", "0.5");
	u.setParameter("transcend", false);
	u.setParameter("buildings", true);
	u.setParameter("pictures", true);
	u.setParameter("unrendered", false);
	u.setParameter("notes", false);
	u.write();
});
QUnit.test("setParameter with invalid value", function(assert) {
	var geturl = function() { return "http://openlevelup.net/?t=1&l=1.5&o=tun#13/48.1126/-1.6613"; };
	var seturl = function(url) { console.log("URL set to: "+url); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	
	assert.throws(
		function() { u.setParameter("missing", "nope") },
		new Error("ctrl.service.URL.invalidParameter")
	);
});

//write
QUnit.test("write with old URL from readURL and no hash part", function(assert) {
	var done = assert.async();
	var geturl = function() { return "http://openlevelup.net/?lat=48.121335&lon=-1.711303&z=21&t=0&lvl=-2&tcd=1&urd=0&bdg=0&pic=0&nte=0&ilv=0"; };
	var seturl = function(url) { assert.equal(url, "http://openlevelup.net/?t=0&l=-2&o=t#21/48.121335/-1.711303"); done(); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	u.write();
});
QUnit.test("write with old URL from readURL and valid hash part", function(assert) {
	var done = assert.async();
	var geturl = function() { return "http://openlevelup.net/?t=0&lvl=-2&tcd=1&urd=0&bdg=0&pic=0&nte=0&ilv=0#21/48.121335/-1.711303"; };
	var seturl = function(url) { assert.equal(url, "http://openlevelup.net/?t=0&l=-2&o=t#21/48.121335/-1.711303"); done(); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	u.write();
});
QUnit.test("write with no defined options", function(assert) {
	var done = assert.async();
	var geturl = function() { return "http://openlevelup.net/?t=1&l=1.5&o=#13/48.1126/-1.6613"; };
	var seturl = function(url) { assert.equal(url, "http://openlevelup.net/?t=1&l=1.5#13/48.1126/-1.6613"); done(); };
	var u = new OLU.ctrl.service.URL(geturl, seturl);
	u.write();
});
