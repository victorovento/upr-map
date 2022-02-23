/*
 * Test script for Translator.js
 */

var $ = require("jquery");
var QUnit = require("qunitjs");
var Translator = require("../../src/ctrl/service/Translator");
QUnit.module("Ctrl > Service > Translator");

/*
 * CONSTRUCTOR
 */
QUnit.test("Constructor", function(assert) {
	var tsl = new Translator();
	assert.equal(tsl.currentLocale, 'en');
	assert.ok($.isEmptyObject(tsl.translations));
});


/*
 * ACCESSORS
 */

//t
QUnit.test("t with valid parameters", function(assert) {
	var tsl2 = new Translator();
	tsl2.addTranslation('en', { "label1": "val1", "label2": "val2" });
	tsl2.addTranslation('fr', { "label1": "val1fr", "label2": "val2fr" });
	
	assert.equal(tsl2.t("label1"), "val1");
	assert.equal(tsl2.t("label2"), "val2");
	
	tsl2.setLocale('fr');
	assert.equal(tsl2.t("label1"), "val1fr");
	assert.equal(tsl2.t("label2"), "val2fr");
});

QUnit.test("t with subchains", function(assert) {
	var tsl2 = new Translator();
	tsl2.addTranslation('en', {
		"main": { "l1": "v1", "l2": "v2" },
		"second": { "l1": "v1s", "l2": "v2s" },
		"third": { "sub": { "l1": "l1t" } }
	});
	tsl2.addTranslation('fr', {
		"main": { "l1": "v1fr", "l2": "v2fr" },
		"second": { "l1": "v1sfr", "l2": "v2sfr" },
		"third": { "sub": { "l1": "l1tfr" } }
	});
	
	assert.equal(tsl2.t("main.l1"), "v1");
	assert.equal(tsl2.t("main.l2"), "v2");
	assert.equal(tsl2.t("second.l1"), "v1s");
	assert.equal(tsl2.t("second.l2"), "v2s");
	assert.equal(tsl2.t("third.sub.l1"), "l1t");
	
	tsl2.setLocale('fr');
	assert.equal(tsl2.t("main.l1"), "v1fr");
	assert.equal(tsl2.t("main.l2"), "v2fr");
	assert.equal(tsl2.t("second.l1"), "v1sfr");
	assert.equal(tsl2.t("second.l2"), "v2sfr");
	assert.equal(tsl2.t("third.sub.l1"), "l1tfr");
});

QUnit.test("t with options to replace", function(assert) {
	var tsl2 = new Translator();
	tsl2.addTranslation('en', {
		"main": "Say {nb} !"
	});
	tsl2.addTranslation('fr', {
		"main": "Dites {nb} !"
	});
	
	assert.equal(tsl2.t("main", { nb: 33 }), "Say 33 !");
	tsl2.setLocale('fr');
	assert.equal(tsl2.t("main", { nb: 42 }), "Dites 42 !");
});

QUnit.test("t with invalid parameters", function(assert) {
	var tsl2 = new Translator();
	tsl2.addTranslation('en', { "label1": "val1", "label2": "val2" });
	tsl2.addTranslation('fr', { "label1": "val1fr", "label2": "val2fr" });
	
	assert.equal(tsl2.t("unknown"), "Missing label");
});

/*
 * MODIFIERS
 */

//setLocale
QUnit.test("SetLocale with valid parameters", function(assert) {
	var tsl2 = new Translator();
	tsl2.addTranslation('en', { "label1": "val1", "label2": "val2" });
	tsl2.addTranslation('fr', { "label1": "val1fr", "label2": "val2fr" });
	
	assert.equal(tsl2.t("label1"), "val1");
	
	tsl2.setLocale('fr');
	assert.equal(tsl2.currentLocale, "fr");
	assert.equal(tsl2.t("label1"), "val1fr");
});

QUnit.test("SetLocale with language variant", function(assert) {
	var tsl2 = new Translator();
	tsl2.addTranslation('en', { "label1": "val1", "label2": "val2" });
	tsl2.addTranslation('fr', { "label1": "val1fr", "label2": "val2fr" });
	tsl2.addTranslation('fr-BE', { "label1": "val1frbe", "label2": "val2frbe" });
	
	assert.equal(tsl2.t("label1"), "val1");
	
	tsl2.setLocale('fr-BE');
	assert.equal(tsl2.currentLocale, "fr-BE");
	assert.equal(tsl2.t("label1"), "val1frbe");
});

QUnit.test("SetLocale with unknown language", function(assert) {
	var tsl3 = new Translator();
	tsl3.addTranslation('en', { "label1": "val1", "label2": "val2" });
	tsl3.addTranslation('fr', { "label1": "val1fr", "label2": "val2fr" });
	
	assert.equal(tsl3.t("label1"), "val1");
	
	tsl3.setLocale('ukn');
	assert.equal(tsl3.currentLocale, "en");
	assert.equal(tsl3.t("label1"), "val1");
});

QUnit.test("SetLocale with unknown language variant", function(assert) {
	var tsl3 = new Translator();
	tsl3.addTranslation('en', { "label1": "val1", "label2": "val2" });
	tsl3.addTranslation('fr', { "label1": "val1fr", "label2": "val2fr" });
	
	assert.equal(tsl3.t("label1"), "val1");
	
	tsl3.setLocale('fr-BE');
	assert.equal(tsl3.currentLocale, "fr");
	assert.equal(tsl3.t("label1"), "val1fr");
});
