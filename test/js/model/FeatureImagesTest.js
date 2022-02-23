/*
 * Test script for FeaturesImages.js
 */

var QUnit = require("qunitjs");
var OLU = require("../src/OLU");

QUnit.module("Model > FeatureImages");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor with no tags", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.count(), 0);
});
QUnit.test("Constructor with image tag and valid complete URL", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "http://myhost.fr/test/test.jpg" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.count(), 1);
	assert.equal(fi.get()[0].img, "http://myhost.fr/test/test.jpg");
	assert.equal(fi.get()[0].src, "Web (image tag)");
	assert.equal(fi.get()[0].page, "http://myhost.fr/test/test.jpg");
});
QUnit.test("Constructor with image tag and valid URL without protocol", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "myhost.fr/test/test.jpg" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.count(), 1);
	assert.equal(fi.get()[0].img, "http://myhost.fr/test/test.jpg");
	assert.equal(fi.get()[0].src, "Web (image tag)");
	assert.equal(fi.get()[0].page, "http://myhost.fr/test/test.jpg");
});
QUnit.test("Constructor with image tag as wiki file", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "File:Vue sur champ de blé.jpg" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.count(), 1);
	assert.equal(fi.get()[0].img, "https://upload.wikimedia.org/wikipedia/commons/8/82/Vue_sur_champ_de_bl%C3%A9.jpg");
	assert.equal(fi.get()[0].src, "Wikimedia Commons");
	assert.equal(fi.get()[0].page, "https://commons.wikimedia.org/wiki/File:Vue_sur_champ_de_bl%C3%A9.jpg");
});
QUnit.test("Constructor with image tag and invalid URL", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "http://myhost.fr/test/test.html" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.count(), 0);
});
QUnit.test("Constructor with wikimedia_commons tag", function(assert) {
	var fi = new OLU.model.FeatureImages({ wikimedia_commons: "File:Vue sur champ de blé.jpg" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.count(), 1);
	assert.equal(fi.get()[0].img, "https://upload.wikimedia.org/wikipedia/commons/8/82/Vue_sur_champ_de_bl%C3%A9.jpg");
	assert.equal(fi.get()[0].src, "Wikimedia Commons");
	assert.equal(fi.get()[0].page, "https://commons.wikimedia.org/wiki/File:Vue_sur_champ_de_bl%C3%A9.jpg");
});


/*
 * ACCESSORS
 */

//get
QUnit.test("get witouth defined pictures", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	assert.equal(fi.get().length, 0);
});
QUnit.test("get with one picture defined", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "myhost.fr/test/test.jpg" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.get().length, 1);
	assert.equal(fi.get()[0].img, "http://myhost.fr/test/test.jpg");
	assert.equal(fi.get()[0].src, "Web (image tag)");
	assert.equal(fi.get()[0].page, "http://myhost.fr/test/test.jpg");
});
QUnit.test("get with several pictures", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "myhost.fr/test/test.jpg", wikimedia_commons: "File:Vue sur champ de blé.jpg" });
	
	assert.ok(fi instanceof OLU.model.FeatureImages);
	assert.equal(fi.get().length, 2);
	assert.equal(fi.get()[0].img, "http://myhost.fr/test/test.jpg");
	assert.equal(fi.get()[0].src, "Web (image tag)");
	assert.equal(fi.get()[0].page, "http://myhost.fr/test/test.jpg");
	assert.equal(fi.get()[1].img, "https://upload.wikimedia.org/wikipedia/commons/8/82/Vue_sur_champ_de_bl%C3%A9.jpg");
	assert.equal(fi.get()[1].src, "Wikimedia Commons");
	assert.equal(fi.get()[1].page, "https://commons.wikimedia.org/wiki/File:Vue_sur_champ_de_bl%C3%A9.jpg");
});

//hasValidImages
QUnit.test("hasValidImages and no defined pictures", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	assert.notOk(fi.hasValidImages());
});
QUnit.test("hasValidImages and pictures defined", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "myhost.fr/test/test.jpg" });
	
	assert.ok(fi.hasValidImages());
});

//count
QUnit.test("count and no pictures defined", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	assert.equal(fi.count(), 0);
});
QUnit.test("count and pictures defined", function(assert) {
	var fi = new OLU.model.FeatureImages({ image: "myhost.fr/test/test.jpg", wikimedia_commons: "File:Vue sur champ de blé.jpg" });
	
	assert.equal(fi.count(), 2);
});


/*
 * MODIFIERS
 */

//addWebImage
QUnit.test("addWebImage", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	//Add image
	fi.addWebImage("http://myhost.fr/test/test.jpg", "Web");
	
	//Check
	assert.equal(fi.get().length, 1);
	var img1 = fi.get()[0];
	assert.equal(img1.img, "http://myhost.fr/test/test.jpg");
	assert.equal(img1.src, "Web");
	assert.equal(img1.page, "http://myhost.fr/test/test.jpg");
});

//addWikiImage
QUnit.test("addWikiImage", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	//Add image
	fi.addWikiImage("File:Vue sur champ de blé.jpg");
	
	//Check
	assert.equal(fi.get().length, 1);
	var img1 = fi.get()[0];
	assert.equal(fi.get()[0].img, "https://upload.wikimedia.org/wikipedia/commons/8/82/Vue_sur_champ_de_bl%C3%A9.jpg");
	assert.equal(fi.get()[0].src, "Wikimedia Commons");
	assert.equal(fi.get()[0].page, "https://commons.wikimedia.org/wiki/File:Vue_sur_champ_de_bl%C3%A9.jpg");
});

//addMapillaryImage
QUnit.test("addMapillaryImage with simple image", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	//Add image
	fi.addMapillaryImage("t8r4aTE7skN9b5Nxvd8J4Q", 123456789, "zimmy");
	
	//Check
	assert.equal(fi.get().length, 1);
	var img1 = fi.get()[0];
	assert.equal(fi.get()[0].img, "https://d1cuyjsrcm0gby.cloudfront.net/t8r4aTE7skN9b5Nxvd8J4Q/thumb-2048.jpg");
	assert.equal(fi.get()[0].src, "Mapillary (zimmy)");
	assert.equal(fi.get()[0].page, "http://www.mapillary.com/map/im/t8r4aTE7skN9b5Nxvd8J4Q");
	assert.equal(fi.get()[0].date, 123456789);
	assert.notOk(fi.get()[0].sphere);
});
QUnit.test("addMapillaryImage with spherical image", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	//Add image
	fi.addMapillaryImage("t8r4aTE7skN9b5Nxvd8J4Q", 123456789, "zimmy", true);
	
	//Check
	assert.equal(fi.get().length, 1);
	var img1 = fi.get()[0];
	assert.equal(fi.get()[0].img, "https://d1cuyjsrcm0gby.cloudfront.net/t8r4aTE7skN9b5Nxvd8J4Q/thumb-2048.jpg");
	assert.equal(fi.get()[0].src, "Mapillary (zimmy)");
	assert.equal(fi.get()[0].page, "http://www.mapillary.com/map/im/t8r4aTE7skN9b5Nxvd8J4Q");
	assert.equal(fi.get()[0].date, 123456789);
	assert.ok(fi.get()[0].sphere);
});

//addFlickrImage
QUnit.test("addFlickrImage", function(assert) {
	var fi = new OLU.model.FeatureImages({});
	
	//Add image
	fi.addFlickrImage("https://farm2.staticflickr.com/1589/26644825056_c47bec6c30_o_d.jpg", 123456789, "jean-louis Zimmermann", "jeanlouis_zimmermann", "26644825056");
	
	//Check
	assert.equal(fi.get().length, 1);
	var img1 = fi.get()[0];
	assert.equal(fi.get()[0].img, "https://farm2.staticflickr.com/1589/26644825056_c47bec6c30_o_d.jpg");
	assert.equal(fi.get()[0].src, "Flickr (jean-louis Zimmermann)");
	assert.equal(fi.get()[0].page, "https://www.flickr.com/photos/jeanlouis_zimmermann/26644825056");
	assert.equal(fi.get()[0].date, 123456789);
});
