/*
 * Expected result: show level selector with 3 levels, changes current level, then changes available levels, and changes current level
 */

var $ = require("jquery");
var L = require("leaflet");
var yaml = require("js-yaml");
var OLU = require("../src/OLU");

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
var lvl = OLU.view.level({ levels: [ -1, -0.5, 0, 0.25, 1 ], t: tsl.t.bind(tsl) });
lvl.addTo(map);
map.on("levelchanged", function(e) {
	console.log(e.level);
});

setTimeout(function() { lvl.setCurrent(1); }, 1000);

setTimeout(function() { lvl.setAvailable([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]); }, 2000);

setTimeout(function() { lvl.setCurrent(10); }, 3000);
setTimeout(function() { lvl.setCurrent(8); }, 3500);
setTimeout(function() { lvl.setCurrent(17); }, 4000);
setTimeout(function() { lvl.setCurrent(1); }, 4500);
