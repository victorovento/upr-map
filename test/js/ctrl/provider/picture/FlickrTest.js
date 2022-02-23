/*
 * Test script for Flickr.js
 */

var QUnit = require("qunitjs");
var $ = require("jquery");
var OLU = require('../../../src/OLU');

QUnit.module("Ctrl > Provider > Picture > Flickr");

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
	var f = new OLU.ctrl.provider.picture.Flickr(config.api.flickr.url, config.api.flickr.key);
	
	assert.ok(f instanceof OLU.ctrl.provider.picture.Flickr);
});


/*
 * OTHER METHODS
 */

//simpleResult
QUnit.test("simpleResult with valid data", function(assert) {
	var data = {
		"photos": {
			"page":1,"pages":1,"perpage":250,"total":"66","photo": [
			{"id":"19741154336","owner":"133024294@N05","secret":"68fa13b3ce","server":"557","farm":1,"title":"Gare de Lyon (PARIS,FR75)","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2015-07-16 14:06:08","datetakengranularity":"0","datetakenunknown":"0","ownername":"co_r_pro","machine_tags":"osm:node=3600933061 osm:node=3159296013","url_c":"https://farm1.staticflickr.com/557/19741154336_68fa13b3ce_c.jpg","height_c":600,"width_c":"800"},
				{"id":"19144721174","owner":"133024294@N05","secret":"16601be6e0","server":"405","farm":1,"title":"voie E, Hall 1; Gare de Lyon (PARIS,FR75)","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2015-07-16 14:07:24","datetakengranularity":"0","datetakenunknown":"0","ownername":"co_r_pro","machine_tags":"osm:node=3159296013","url_c":"https://farm1.staticflickr.com/405/19144721174_16601be6e0_c.jpg","height_c":600,"width_c":"800"}
			]
		},
		"stat":"ok"
	};
	
	var result = OLU.ctrl.provider.picture.Flickr._simpleResult(data);
	
	assert.equal(result["node/3600933061"].length, 1);
	assert.equal(result["node/3600933061"][0].url, "https://farm1.staticflickr.com/557/19741154336_68fa13b3ce_c.jpg");
	assert.equal(result["node/3600933061"][0].date, 1437048368);
	assert.equal(result["node/3600933061"][0].author, "co_r_pro");
	assert.equal(result["node/3600933061"][0].authorId, "133024294@N05");
	assert.equal(result["node/3600933061"][0].imgId, "19741154336");
	
	assert.equal(result["node/3159296013"].length, 2);
	assert.equal(result["node/3159296013"][0].url, "https://farm1.staticflickr.com/557/19741154336_68fa13b3ce_c.jpg");
	assert.equal(result["node/3159296013"][0].date, 1437048368);
	assert.equal(result["node/3159296013"][0].author, "co_r_pro");
	assert.equal(result["node/3159296013"][0].authorId, "133024294@N05");
	assert.equal(result["node/3159296013"][0].imgId, "19741154336");
	
	assert.equal(result["node/3159296013"][1].url, "https://farm1.staticflickr.com/405/19144721174_16601be6e0_c.jpg");
	assert.equal(result["node/3159296013"][1].date, 1437048444);
	assert.equal(result["node/3159296013"][1].author, "co_r_pro");
	assert.equal(result["node/3159296013"][1].authorId, "133024294@N05");
	assert.equal(result["node/3159296013"][1].imgId, "19144721174");
});
QUnit.test("simpleResult with invalid data", function(assert) {
	assert.throws(
		function() { OLU.ctrl.provider.picture.Flickr._simpleResult({}) },
		new Error("ctrl.provider.picture.Flickr.invalidData")
	);
});
QUnit.test("simpleResult with valid but empty data", function(assert) {
	var data = {
		"photos": {
			"page":1,"pages":0,"perpage":250,"total":"0","photo":[]
		},
		"stat":"ok"
	};
	var result = OLU.ctrl.provider.picture.Flickr._simpleResult(data);
	
	assert.ok($.isEmptyObject(result));
});

//get
QUnit.test("get with valid parameters", function(assert) {
	var f = new OLU.ctrl.provider.picture.Flickr(config.api.flickr.url, config.api.flickr.key);
	
	var done = assert.async();
	var success = function(photos) {
		assert.ok(photos != undefined);
		
		assert.ok(photos["node/3159296013"].length > 0);
		done();
	};
	
	f.get(L.latLngBounds(L.latLng(48.84067645134199, 2.358691692352295), L.latLng(48.848607006452895, 2.38753080368042)), success, function() { done(); throw new Error("fail"); });
});
