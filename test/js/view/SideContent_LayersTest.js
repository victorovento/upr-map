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

//Load style file
var style = [];
$.ajax({
	url: 'styles/default.mapcss',
	async: false,
	dataType: 'text',
	success: function(data) {
		style.push(new OLU.model.mapcss.RuleSet());
		style[0].parseCSS(data);
	}
}).fail(function() { throw new Error("[Controller] Error while retrieving STYLE"); });
$.ajax({
	url: 'styles/details.mapcss',
	async: false,
	dataType: 'text',
	success: function(data) {
		style.push(new OLU.model.mapcss.RuleSet());
		style[1].parseCSS(data);
	}
}).fail(function() { throw new Error("[Controller] Error while retrieving STYLE"); });

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

var map = L.map('map').setView([48.11, -1.67], 13);
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Prepare tiles
var tiles = {};
for(var i=0; i < config.tiles.length; i++) {
	tiles[config.tiles[i].name] = L.tileLayer(config.tiles[i].URL, config.tiles[i]);
}

//Tests
var side = OLU.view.side("side", { t: tsl.t.bind(tsl) }).addTo(map);
side.contents.layers.set(map, tiles, style, "OpenStreetMap FR", 1);

map.on("load zoomend moveend", function() {
	side.contents.layers.setCoordinates(map.getCenter().lat, map.getCenter().lng, map.getZoom());
});

map.on("stylechanged", function(o) { console.log("STYLE SET TO: "+o.style); });
map.on("basechanged", function(o) { console.log("BASE SET TO: "+o.base); });

setTimeout(function() { side.show("layers"); }, 1000);
