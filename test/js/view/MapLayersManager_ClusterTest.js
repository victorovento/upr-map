/*
 * Expected result: show one group of notes, removes it, then set another one
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
var osmService = new OLU.ctrl.provider.data.OSM(config.api.overpass);
var mlm = new OLU.view.MapLayersManager(map, tsl.t.bind(tsl));

map.on("clusterlayerready", function() {
	map.addLayer(mlm.layers.cluster);
});

osmService.downloadCluster(
	map.getBounds(),
	function(d) {
		mlm.setOSMCluster(d);
	},
	function() { alert("dl failed"); }
);

setTimeout(function() { map.removeLayer(mlm.layers.cluster) }, 5000);
setTimeout(function() { map.setView([ 48.841672640526525, 2.349014282226562 ], 10); }, 6000);
setTimeout(function() {
	osmService.downloadCluster(
		map.getBounds(),
		function(d) { mlm.setOSMCluster(d); },
		function() { alert("dl failed"); }
	);
}, 7000);
