/*
 * Expected result: empty map initialized with all OpenLevelUp widgets
 */

var OLU = require("../src/OLU");
var $ = require("jquery");
var L = require("leaflet");

var config = null;
var style = [];

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

var newNoteService = new OLU.ctrl.service.NewNote(config.api.osm_dev);
var searchService = new OLU.ctrl.service.Search(config.api.nominatim);
var osmProvider = new OLU.ctrl.provider.data.OSM(config.api.overpass, config.polygonFeatures);
var flickrProvider = new OLU.ctrl.provider.picture.Flickr(config.api.flickr.url, config.api.flickr.key);

var mainview = new OLU.view.Main("olu", "advanced", config, style, newNoteService, searchService, osmProvider, flickrProvider);
