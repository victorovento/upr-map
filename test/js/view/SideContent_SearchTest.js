/*
 * Expected result: show side search view with appropriate content
 */

var $ = require("jquery");
var L = require("leaflet");
var yaml = require("js-yaml");
var OLU = require("../src/OLU");

//Load config file
var config = null;
$.ajax({
	url: 'config.json',
	async: false,
	dataType: 'json',
	success: function(data) { config = data; }
}).fail(function() { throw new Error("[Controller] Error while retrieving CONFIG"); });

var map = L.map('map').setView([48.11, -1.67], 13);
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Locales
var tsl = new OLU.ctrl.service.Translator();
$.ajax({
	url: "locales/en.yaml",
	async: false,
	dataType: 'text',
	success: function(data) {
		var locale = yaml.safeLoad(data);
		var localeName = Object.keys(locale)[0];
		tsl.addTranslation("en", locale.en);
	}
}).fail(function() { throw new Error("Error while retrieving locales file"); });

//Tests
var side = OLU.view.side("side", { t: tsl.t.bind(tsl) }).addTo(map);
side.show("search");

var searchService = new OLU.ctrl.service.Search(config.api.nominatim);
side.contents.search.set(searchService, map);
