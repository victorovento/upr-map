/*
 * Expected result: show various features with proper style
 */

var $ = require("jquery");
var L = require("leaflet");
var yaml = require("js-yaml");
var OLU = require("../src/OLU");
L.Icon.Default.imagePath = "img/lib";

var config = null;
var style = null;

//Load config file
$.ajax({
	url: 'config.json',
	async: false,
	dataType: 'json',
	success: function(data) { config = data; }
}).fail(function() { throw new Error("[Controller] Error while retrieving CONFIG"); });

//Load style file
$.ajax({
	url: 'styles/default.mapcss',
	async: false,
	dataType: 'text',
	success: function(data) {
		style = new OLU.model.mapcss.RuleSet();
		style.parseCSS(data);
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

var map = L.map('map', {
	//center: [48.84438, 2.37416], //Gare de Lyon, Paris
	//center: [48.12129, -1.71122], //Métro Kennedy, Rennes
	center: [48.13742, -1.69583], //Grand Quartier, Rennes
	zoom: 19,
	maxZoom: 24
});
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Tests
var osmService = new OLU.ctrl.provider.data.OSM(config.api.overpass, config.polygonFeatures);
var mlm = new OLU.view.MapLayersManager(map, tsl.t.bind(tsl));

osmService.download(
	map.getBounds(),
	function(d) { mlm.setOSMFeatures(d, style, { size: config.map.iconSize, folder: config.map.iconFolder }); },
	function() { alert("dl failed"); }
);

map.on("featureslayerready", function(o) {
	//Add first level to map
	var firstLvl = o.levels[0];
	
	//Add level selector
	var levelSelector = OLU.view.level({
		levels: o.levels
	}).addTo(map);
	
	//Add level change reaction
	map.on("levelchanged", function(obj) {
		if(map.hasLayer(mlm.layers.features[obj.previous])) {
			map.removeLayer(mlm.layers.features[obj.previous]);
		}
		mlm.layers.features[obj.level].addTo(map);
		
		//Reorder layers according to options.layer value
		var fLayers = mlm.layers.features[obj.level].getLayers().sort(function(a, b) {
			var layerA = (a.options != undefined) ? ((isNaN(parseFloat(a.options.layer))) ? 0 : parseFloat(a.options.layer)) : 0;
			var layerB = (b.options != undefined) ? ((isNaN(parseFloat(b.options.layer))) ? 0 : parseFloat(b.options.layer)) : 0;
			return layerA - layerB;
		});
		
		for(var i=0; i < fLayers.length; i++) {
			if(fLayers[i].bringToFront) {
				fLayers[i].bringToFront();
			}
		}
		
		//Hide missing images
		$("img").error(function () { 
			$(this).hide();
		});
	});
	
	levelSelector.setCurrent(firstLvl);
});
