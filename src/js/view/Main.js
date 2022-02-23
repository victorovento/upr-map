/*
 * This file is part of OpenLevelUp!.
 *
 * OpenLevelUp! is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenLevelUp! is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with OpenLevelUp!.  If not, see <http://www.gnu.org/licenses/>.
 */

var L = require("leaflet");
require("leaflet.locatecontrol");
require("leaflet-easybutton");
require("leaflet-editinosm");
require("leaflet-hash");
var $ = require("jquery");

var MapLayersManager = require("./MapLayersManager");
var Level = require("./Level");
var Messages = require("./Messages");
var Side = require("./Side");
var Spinner = require("./Spinner");

/*
 * OpenLevelUp!
 * Web viewer for indoor mapping (based on OpenStreetMap data).
 * Author: Adrien PAVIE
 */
/**
 * Main view
 * @param divId The placeholder ID in DOM (or alternatively, a DOM node)
 * @param mode The view mode (basic or advanced)
 * @param config The configuration file as an Object
 * @param rulesets An array of rulesets defining map styles
 * @param newNoteService The new note service
 * @param searchService The search service
 * @param osmProvider The OSM data provider
 * @param flickrProvider The flickr pictures provider
 * @param t The translation function
 * @param options Some init options, like { tile: integer, level: float }
 */
var Main = function(divId, mode, config, rulesets, newNoteService, searchService, osmProvider, flickrProvider, t, options) {
//ATTRIBUTES
	/** The view mode (basic, advanced) **/
	this.mode = (mode == "advanced") ? mode : "basic";

	/** The main view DOM **/
	this.dom = (typeof divId == 'string') ? $("#"+divId) : $(divId);

	/** The leaflet map **/
	this.map = null;

	/** The view options **/
	this.options = options || {};

	/** The configuration **/
	this.config = config;

	/** The side bar **/
	this.side = null;

	/** The messages widget **/
	this.messages = null;

	/** The loading spinner **/
	this.spinner = null;

	/** The layers manager **/
	this.layersManager = null;

	/** The level widget **/
	this.level = null;

	/** A draggable marker for map **/
	this.draggableMarker = null;

	/** The bounding boxes of downloaded data **/
	this.bounds = {};

	/** The map buttons **/
	this.buttons = {};

	/** The available rulesets for map **/
	this.rulesets = rulesets;

	/** The ruleset to use **/
	this.currentRuleset = 0;

	/** The map layers currently shown **/
	this.layers = { tile: null, data: null, overlays: [] };

	/** The retrieved pictures **/
	this.pictures = { flickr: null };

	/** The last downloaded features **/
	this._lastFeatures = null;

//CONSTRUCTOR
	/***************************************************************************
	 * Create DOM structure
	 */
	this.dom.empty();
	this.dom.append("<div id=\"olu-map\"></div>");
	this.dom.append("<div id=\"olu-map-side\"></div>");
	this.dom.append("<div id=\"olu-messages\"></div>");
	this.dom.append("<div id=\"olu-spinner\"></div>");


	/***************************************************************************
	 * Create map
	 */
	L.Icon.Default.imagePath = this.config.map.iconFolder;
	this.map = L.map("olu-map", {
		center: L.latLng(this.config.map.center.lat, this.config.map.center.lon),
		zoom: this.config.map.center.zoom,
		zoomControl: false,
		maxZoom: this.config.map.maxZoom
	});

	//Wrap coordinates
	this.map.on("load moveend", function() {
		if(this.map.getCenter().lng < -180 || this.map.getCenter().lng > 180) {
			this.map.setView(this.map.getCenter().wrap());
		}
	}.bind(this));

	this.map.attributionControl.setPrefix('<img src="img/favicon.png" /> <a href="http://openlevelup.net">'+t("olu.name")+'</a>');
	this.layersManager = new MapLayersManager(this.map, t);
	var hash = new L.Hash(this.map);


	/***************************************************************************
	 * Create controls
	 */
	this.side = Side("olu-map-side", { autoPan: false, t: t });
	this.messages = Messages("olu-messages");
	this.spinner = Spinner("olu-spinner");
	this.level = Level({ position: "topright", t: t });
	var levelControl = this.level; //To have access in editor control
	var zoomControl = L.control.zoom({ position: "topright" });
	var scaleControl = L.control.scale({ position: "bottomleft" });
	var locateControl = L.control.locate({ position: "bottomright", icon: "fa fa-location-arrow" });
	this.buttons.note = L.easyButton(
		'fa-comment',
		function(btn, map){
			this.side.show("newnote");
		}.bind(this),
		t("notes.desc"),
		{ position: "topleft" }
	);
	var searchButton = L.easyButton(
		'fa-search',
		function(btn, map){ this.side.show("search"); }.bind(this),
		t("search.desc")
	);
	var layersButton = L.easyButton(
		'fa-globe',
		function(btn, map){ this.side.show("layers"); }.bind(this),
		t("map.layers.desc"),
		{ position: "bottomleft" }
	);
	var routingButton = L.easyButton(
		'fa-map-signs',
		function(btn, map){ this.side.show("routing"); }.bind(this),
		t("routing.desc")
	);
	var navbar = L.easyBar([ searchButton, routingButton ], { position: "bottomright", id: "olu-control-navbar" });
	var editorControl = new L.Control.EditInOSM({
		editors: [
			{
				displayName: "OsmInEdit",
				url: "https://osminedit.pavie.info/",
				buildUrl: function(map) { return this.url + "#" + map.getZoom() + "/" + map.getCenter().lat + "/" + map.getCenter().lng + "/" + levelControl.level; }
			},
			{
				displayName: "iD Indoor",
				url: "https://projets.pavie.info/id-indoor/",
				buildUrl: function(map) { return this.url + "#level="+levelControl.level+"&map=" + map.getZoom() + "/" + map.getCenter().lng + "/" + map.getCenter().lat; }
			},
			'josm'
		],
		position: "topleft"
	});


	/***************************************************************************
	 * Define tile layers
	 */

	//Restore style from URL parameters
	if(this.options.style) {
		//Find ruleset ID
		var rId = -1;
		var crId = 0;
		while(rId < 0 && crId < this.rulesets.length) {
			if(this.rulesets[crId].olu_shortname == this.options.style) {
				rId = crId;
			}
			crId++;
		}

		if(rId >= 0) {
			this.currentRuleset = rId;
		}
	}

	this.map.on("tileslayerready", function(o) {
		var tileToShow = (this.options.tile) ? this.config.tiles[this.options.tile].name : o.first;
		this.layers.tile = this.layersManager.layers.tiles[tileToShow];
		this.layers.tile.addTo(this.map);

		this.side.contents.layers.set(this.map, this.layersManager.layers.tiles, this.rulesets, tileToShow, this.currentRuleset);
	}.bind(this));

	this.map.on("load zoomend moveend", function() {
		this.side.contents.layers.setCoordinates(this.map.getCenter().lat, this.map.getCenter().lng, this.map.getZoom());
	}.bind(this));

	this.map.on("basechanged", function(o) {
		for(var l in this.layersManager.layers.tiles) {
			if(l != o.base && this.map.hasLayer(this.layersManager.layers.tiles[l])) {
				this.map.removeLayer(this.layersManager.layers.tiles[l]);
			}
			else if(l == o.base && !this.map.hasLayer(this.layersManager.layers.tiles[l])) {
				this.map.addLayer(this.layersManager.layers.tiles[l]);
			}
		}
	}.bind(this));

	this.map.on("stylechanged", function(o) {
		this.changeRuleset(o.style);
	}.bind(this));

	this.layersManager.setTiles(this.config.tiles);


	/***************************************************************************
	 * Add controls to map (order matters)
	 */
	this.side.addTo(this.map);
	this.messages.addTo(this.map);
	this.spinner.addTo(this.map);
	//Top right
	zoomControl.addTo(this.map);
	//Top left
	this.buttons.note.addTo(this.map);
	//Bottom right
	navbar.addTo(this.map);
	locateControl.addTo(this.map);
	//Advanced only
	if(mode == "advanced") {
		scaleControl.addTo(this.map);
		layersButton.addTo(this.map);
		editorControl.addTo(this.map);
	}


	/***************************************************************************
	 * Configure side contents
	 */
	//New note
	this.side.contents.newnote.set(
		newNoteService,
		function() {
			this.messages.show(t("notes.sent"), "info");
			this.side.hide();

			//TODO Reload notes data if already shown
		}.bind(this),
		function(e) {
			this.messages.show(e.message, "error");
		}.bind(this)
	);
	this.side.on("sidecontentopened", function(e, content) {
		if(content == "newnote") {
			this.draggableMarker = L.marker(
				this.map.getCenter(),
				{
					draggable: true,
					icon: L.icon({
						iconUrl: this.config.map.iconFolder + '/icon_note_new.png',
						iconAnchor: [12, 40],
					})
				}
			).addTo(this.map);
			this.side.contents.newnote.setCoordinates(this.map.getCenter());
			this.draggableMarker.on("move", function(e) {
				this.side.contents.newnote.setCoordinates(e.latlng);
			}.bind(this));
		}
		else {
			if(this.draggableMarker) {
				this.map.removeLayer(this.draggableMarker);
				this.draggableMarker = null;
			}
		}
	}.bind(this));
	this.side.on("sidecontentclosed", function() {
		if(this.draggableMarker != null) {
			this.map.removeLayer(this.draggableMarker);
			this.draggableMarker = null;
		}
	}.bind(this));
	//Search
	this.side.contents.search.set(searchService, this.map);


	/***************************************************************************
	 * Map layers management
	 */

	/*
	 * Remove previous data layer if any
	 */
	var clearPreviousDataLayer = function() {
		if(this.layers.data != null && this.map.hasLayer(this.layers.data)) {
			this.map.removeLayer(this.layers.data);
			this.layers.data = null;
		}

		//Remove events handlers
		if(this.map.hasEventListeners("levelchanged")) {
			this.map.removeEventListener("levelchanged", levelChangedHandler);
		}
	}.bind(this);

	/*
	 * Post-process features data on map (remove missing images, order layers)
	 */
	var postProcessOSMFeatures = function() {
		//Reorder layers according to options.layer value
		var fLayers = this.layers.data.getLayers().sort(function(a, b) {
			var layerA = (isNaN(parseFloat(a._olu_z_index))) ? 0 : parseFloat(a._olu_z_index);
			var layerB = (isNaN(parseFloat(b._olu_z_index))) ? 0 : parseFloat(b._olu_z_index);
			return layerA - layerB;
		});

		for(var i=0; i < fLayers.length; i++) {
			if(fLayers[i].bringToFront) {
				fLayers[i].bringToFront();
			}
		}

		//Change background opacity
		this.layers.tile.setOpacity(this.config.map.tilesMinOpacity);
		for(var i in this.layersManager.layers.tiles) {
			this.layersManager.layers.tiles[i].setOpacity(this.config.map.tilesMinOpacity);
		}

		//Hide missing images
		$("img").error(function () {
			$(this).hide();
		});

		//Add level change reaction
		this.map.on("levelchanged", levelChangedHandler);
	}.bind(this);

	/*
	 * Handler for level change event on map
	 */
	var levelChangedHandler = function(obj) {
		clearPreviousDataLayer();
		this.layers.data = this.layersManager.layers.features[obj.level];
		this.layers.data.addTo(this.map);
		this.side.contents.newnote.setLevel(obj.level);
		postProcessOSMFeatures();
	}.bind(this);

	/*
	 * Create layer requests against data providers, and send them to layersManager when downloaded
	 */
	var layerRequester = function() {
		var zoom = this.map.getZoom();
		var bounds = this.map.getBounds();

		//Details zooms
		if(zoom >= this.config.map.dataMinZoom) {
			//Download new data
			if(this.bounds.features == undefined || !this.bounds.features.contains(bounds)) {
				this.spinner.show(t("data.download.building"), "download");
				this.bounds.features = bounds.pad(1.1 + 0.5 * (zoom - this.config.map.dataMinZoom));

				//Retrieve pictures
				this.pictures.flickr = null;
				flickrProvider.get(
					this.bounds.features,
					function(photos) {
						this.pictures.flickr = photos;
					}.bind(this),
					function() {
						this.messages.show(t("data.pictures.fail", { provider: "Flickr" }), "error");
					}.bind(this)
				);

				//Features data
				console.log("[Main] Start download features data");
				var downloader = ((this.mode == "basic") ? osmProvider.downloadLight : osmProvider.download).bind(osmProvider);

				downloader(
					this.bounds.features,
					function(d) {
						//Associate pictures to features
						if(this.pictures.flickr != null) {
							for(var id in this.pictures.flickr) {
								if(d.features[id] != undefined) {
									for(var picId = 0; picId < this.pictures.flickr[id].length; picId++) {
										d.features[id].getImages().addFlickrImage(
											this.pictures.flickr[id][picId].url,
											this.pictures.flickr[id][picId].date,
											this.pictures.flickr[id][picId].author,
											this.pictures.flickr[id][picId].authorId,
											this.pictures.flickr[id][picId].imgId
										);
									}
								}
							}
						}

						if(this._lastFeatures) { delete this._lastFeatures; }
						this._lastFeatures = d;

						this.layersManager.setOSMFeatures(
							d,
							this.rulesets[this.currentRuleset],
							{
								folder: this.config.map.iconFolder,
								size: this.config.map.iconSize,
								clickHandler: function(feature) {
									this.side.contents.feature.set(
										feature,
										this.config.feature.details,
										{
											iconFolder: this.config.map.iconFolder,
											mapillaryClient: this.config.api.mapillary.clientId,
											showTags: this.mode == "advanced"
										}
									);
									this.side.show("feature");
								}.bind(this)
							}
						);

						this.spinner.hide();
					}.bind(this),
					function(e) {
						this.messages.show(e.message || t("data.download.fail"), "error");
						this.spinner.hide();
					}.bind(this)
				);
			}
			//Reload existing data
			else if(this.layersManager.layers.features != null) {
				//Check first if one of the feature levels is shown
				var level = null;
				var levels = Object.keys(this.layersManager.layers.features);
				var currentLevel = (this.level.map == null) ? null : this.level.level;

				for(var i in this.layersManager.layers.features) {
					if(this.layers.data == this.layersManager.layers.features[i]) {
						level = i;
						break;
					}
				}

				if(level === null) {
					level = (levels.indexOf(0) >= 0) ? 0 : levels[0];
				}

				if(level != currentLevel) {
					levelChangedHandler({ level: level });
					if(this.level.map == null) {
						this.level.addTo(this.map);
					}
					this.level.setAvailable(levels);
					this.level.setCurrent(level);
				}
			}

			this.buttons.note.enable();
		}
		else {
			this.layers.tile.setOpacity(1);
			for(var i in this.layersManager.layers.tiles) {
				this.layersManager.layers.tiles[i].setOpacity(1);
			}

			this.buttons.note.disable();
			//Hide eventual data layer
			if(this.level.map != null) {
				this.map.removeControl(this.level);
			}
		}

		//Heat map zooms
		if(zoom >= this.config.map.clusterMinZoom && zoom < this.config.map.dataMinZoom) {
			//Download new data
			if(this.bounds.cluster == undefined || !this.bounds.cluster.contains(bounds)) {
				this.spinner.show(t("data.download.location"), "download");
				this.bounds.cluster = bounds.pad(1.1);
				console.log("[Main] Start download cluster data");
				osmProvider.downloadCluster(
					this.bounds.cluster,
					function(d) {
						this.layersManager.setOSMCluster(d);
						this.spinner.hide();
					}.bind(this),
					function(e) {
						this.messages.show(e.message || t("data.download.fail"), "error");
						this.spinner.hide();
					}.bind(this)
				);
			}
			//Reload existing data
			else if(this.layersManager.layers.cluster != null && this.layers.data != this.layersManager.layers.cluster) {
				clearPreviousDataLayer();
				this.layers.data = this.layersManager.layers.cluster;
				this.layers.data.addTo(this.map);
			}
		}

		//Upper zooms
		if(zoom < this.config.map.clusterMinZoom) {
			clearPreviousDataLayer();
			//TODO Better handling of those messages
			this.messages.show(t("map.zoom.showdata"), "info", 1000);
		}
	}.bind(this);

	/*
	 * Set cluster data on map when ready
	 */
	this.map.on("clusterlayerready", function() {
		clearPreviousDataLayer();

		//Set cluster data as current data layer
		this.layers.data = this.layersManager.layers.cluster;
		this.layers.data.addTo(this.map);
	}.bind(this));

	/*
	 * Set features data on map when ready
	 */
	this.map.on("featureslayerready", function(o) {
		clearPreviousDataLayer();

		//Choose first level to show
		var firstLvl = (o.levels.indexOf(0) >= 0) ? 0 : o.levels[0];
		if(this.options.level != undefined && o.levels.indexOf(this.options.level) >= 0) {
			firstLvl = this.options.level;
			this.options.level = undefined;
		}

		//Add level selector
		if(this.level.map == null) {
			this.level.addTo(this.map);
		}
		this.level.setAvailable(o.levels);

		//Add level change reaction
		this.map.on("levelchanged", levelChangedHandler);

		this.level.setCurrent(firstLvl);
	}.bind(this));

	//Bind layer requester to map movements
	this.map.on("zoomend moveend", layerRequester);
	layerRequester();
};


//MODIFIERS
/**
 * Change the current ruleset for map style
 * @param id The ruleset id
 */
Main.prototype.changeRuleset = function(id) {
	if(id >= 0 && id < this.rulesets.length) {
		this.currentRuleset = id;

		//Reload current features layer if needed
		if(this._lastFeatures != null && this.map.getZoom() >= this.config.map.dataMinZoom) {
			if(this.level && this.level.level) { this.options.level = this.level.level; }
			this.layersManager.setOSMFeatures(
				this._lastFeatures,
				this.rulesets[this.currentRuleset],
				{
					folder: this.config.map.iconFolder,
					size: this.config.map.iconSize,
					clickHandler: function(feature) {
						this.side.contents.feature.set(
							feature,
							this.config.feature.details,
							{
								iconFolder: this.config.map.iconFolder,
								mapillaryClient: this.config.api.mapillary.clientId
							}
						);
						this.side.show("feature");
					}.bind(this)
				}
			);
		}
	}
};

module.exports = Main;
