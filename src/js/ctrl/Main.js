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

var $ = require("jquery");
var L = require("leaflet");
var yaml = require("js-yaml");

var RuleSet = require("../model/mapcss/RuleSet");
var MainView = require("../view/Main");
var ServiceURL = require("./service/URL");
var ServiceLevelExport = require("./service/LevelExport");
var ServiceNewNote = require("./service/NewNote");
var ServiceSearch = require("./service/Search");
var ProviderDataOSM = require("./provider/data/OSM");
var ProviderDataNotes = require("./provider/data/Notes");
var ProviderPictureFlickr = require("./provider/picture/Flickr");
var Translator = require("./service/Translator");

/**
 * Main controller is the master of puppets.
 * It coordinates all services/providers of OpenLevelUp.
 * It also links them to view classes.
 */
var Main = function(divId, mode, config) {
//DEFAULT CONFIGURATION
	this.config = {
		"map": {
			"iconSize": 24,
			"iconFolder": "img",
			"clusterMinZoom": 11,
			"dataMinZoom": 18,
			"maxZoom": 24,
			"tilesMinOpacity": 0.2,
			"center": {
				"lat": 46.973,
				"lon": 1.934,
				"zoom": 6
			},
			"defaultStyle": "basic.mapcss"
		},

		"styles": [
			"styles/basic.mapcss",
			"styles/default.mapcss",
			"styles/details.mapcss"
		],

		"locales": [
			"locales/en.yaml",
			"locales/fr.yaml",
			"locales/de.yaml",
			"locales/hu.yaml",
			"locales/pt.yaml",
			"locales/nl.yaml"
		],

		"api": {
			"overpass": "https://www.overpass-api.de/api/interpreter?data=",
			"overpass_alt": "https://api.openstreetmap.fr/oapi/interpreter/?data=",
			"osm": "https://api.openstreetmap.org/api/0.6/",
			"osm_dev": "https://api06.dev.openstreetmap.org/api/0.6/",
			"nominatim": "https://nominatim.openstreetmap.org/",
			"flickr": {
				"url": "https://api.flickr.com/services/rest/?",
				"key": "d06fb1ebb3ede5813b89c79320e11ab8"
			},
			"mapillary": {
				"clientId": "eDhQTTdnRmZJNXdYZWUwRDQxc1NwdzpmYjE3YWE3MWM5ZjcyMTdm"
			}
		},

		"tiles": [
		{
			"name": "OpenStreetMap",
			"URL": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			"attribution": "<a href=\"http://openstreetmap.org/\">OSM</a>",
			"minZoom": 1,
			"maxZoom": 19
		},
		{
			"name": "OpenStreetMap FR",
			"URL": "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
			"attribution": "<a href=\"http://tile.openstreetmap.fr/\">OSMFR</a>",
			"minZoom": 1,
			"maxZoom": 20
		},
		{
			"name": "Stamen Toner",
			"URL": "http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png",
			"attribution": "<a href=\"http://maps.stamen.com/\">Stamen Toner</a>",
			"minZoom": 1,
			"maxZoom": 20
		},
		{
			"name": "Cadastre FR",
			"URL": "http://tms.cadastre.openstreetmap.fr/*/tout/{z}/{x}/{y}.png",
			"attribution": "Cadastre (DGFiP)",
			"minZoom": 1,
			"maxZoom": 20
		},
		{
			"name": "ÖPNV",
			"URL": "https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png",
			"attribution": "<a href=\"http://www.öpnvkarte.de/\">ÖPNV</a>",
			"minZoom": 1,
			"maxZoom": 18
		},
		{
			"name": "OpenStreetMap DE",
			"URL": "https://b.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png",
			"attribution": "<a href=\"http://openstreetmap.de/karte.html\">OSMDE</a>",
			"minZoom": 1,
			"maxZoom": 18,
			"subdomains": "abcd"
		}
		],

		"feature": {
			"details": {
				"major": {
					"opening_hours": {
						"type": "hours",
						"img": "clock",
						"name": "Opening hours"
					},
					"contact:website": {
						"type": "link",
						"img": "web",
						"name": "Website"
					},
					"website": {
						"type": "link",
						"img": "web",
						"name": "Website"
					},
					"contact:email": {
						"type": "email",
						"img": "email",
						"name": "E-mail"
					},
					"email": {
						"type": "email",
						"img": "email",
						"name": "E-mail"
					},
					"contact:phone": {
						"type": "text",
						"img": "phone",
						"name": "Phone"
					},
					"phone": {
						"type": "text",
						"img": "phone",
						"name": "Phone"
					},
					"wheelchair": {
						"type": "text_bind",
						"img": "wheelchair",
						"text_bind": { "yes": "Fully accessible", "limited": "Limited access", "no": "Not accessible" }
					}
				},
				"minor": {
					"cuisine": {
						"type": "text",
						"img": "cuisine",
						"name": "Cuisine"
					},
					"description": {
						"type": "text",
						"img": "info",
						"name": "More details"
					}
				}
			}
		},

		"routing": {
			"foot": {
				"name": "By foot",
				"speed": 1.39
			},

			"wheelchair": {
				"name": "In wheelchair",
				"speed": 0.7,
				"avoid": [ "stairs", "escalator" ]
			},

			"sport": {
				"name": "By foot (sportive)",
				"speed": 1.39,
				"avoid": [ "elevator", "escalator" ]
			}
		},

		"polygonFeatures": {
			"building": true,
			"highway": {
				"included_values": {
					"services": true,
					"rest_area": true,
					"escape": true,
					"elevator": true
				}
			},
			"natural": {
				"excluded_values": {
					"coastline": true,
					"cliff": true,
					"ridge": true,
					"arete": true,
					"tree_row": true
				}
			},
			"landuse": true,
			"waterway": {
				"included_values": {
					"riverbank": true,
					"dock": true,
					"boatyard": true,
					"dam": true
				}
			},
			"amenity": true,
			"leisure": true,
			"barrier": {
				"included_values": {
					"city_wall": true,
					"ditch": true,
					"retaining_wall": true,
					"spikes": true,
					"self_checkout": true,
					"checkout": true,
					"shelf": true
				}
			},
			"railway": {
				"included_values": {
					"station": true,
					"turntable": true,
					"roundhouse": true,
					"platform": true
				}
			},
			"area": true,
			"boundary": true,
			"man_made": {
				"excluded_values": {
					"cutline": true,
					"embankment": true,
					"pipeline": true
				}
			},
			"power": {
				"included_values": {
					"plant": true,
					"substation": true,
					"generator": true,
					"transformer": true
				}
			},
			"place": true,
			"shop": true,
			"aeroway": {
				"excluded_values": {
					"taxiway": true
				}
			},
			"tourism": true,
			"historic": true,
			"public_transport": true,
			"office": true,
			"building:part": true,
			"military": true,
			"ruins": true,
			"area:highway": true,
			"craft": true,
			"golf": true,
			"indoor": {
				"excluded_values": {
					"yes": true,
					"wall": true
				}
			},
			"buildingpart": {
				"excluded_values": {
					"yes": true,
					"wall": true
				}
			},
			"room": true,
			"department": true
		}
	};

//ATTRIBUTES
	/** The ID of DOM container **/
	this.divId = divId;

	/** The configuration **/
	this.styles = [ {} ];
	this._initConfig(config);

	/** The OpenLevelUp mode (basic, advanced) **/
	this.mode = mode || "basic";

	/** The main view **/
	this.view = null;

	/*
	 * Services
	 */
	/** Routing service **/
	//this.routing = null;

	/** URL service **/
	this.url = new ServiceURL(function() { return $(location).attr('href'); }, function(u) { window.history.replaceState({}, "OpenLevelUp!", u); });

	/** Level export **/
	//this.levelExport = new ServiceLevelExport();

	/** New note **/
	this.newNote = new ServiceNewNote(this.config.api.osm);

	/** Search **/
	this.search = new ServiceSearch(this.config.api.nominatim);

	/** Translator **/
	this.translator = new Translator();

	/*
	 * Providers
	 */
	/** Picture providers **/
	this.pictures = {
		flickr: new ProviderPictureFlickr(this.config.api.flickr.url, this.config.api.flickr.key)
	};

	/** Data providers **/
	this.data = {
		osm: new ProviderDataOSM(this.config.api.overpass, this.config.polygonFeatures)/*,
		notes: new ProviderDataNotes(this.config.api.osm)*/
	};

//CONSTRUCTOR
	var options = {};

	/*
	 * Read URL parameters
	 */
	this.url.write();
	options.level = (this.url.getParameter("level") != null) ? parseFloat(this.url.getParameter("level")) : undefined;
	options.tile = (this.url.getParameter("tile") != null) ? parseInt(this.url.getParameter("tile")) : undefined;
	options.style = (this.url.getParameter("style") != null) ? this.url.getParameter("style") : undefined;

	/*
	 * Init locales
	 */
	for(var lngId=0; lngId < this.config.locales.length; lngId++) {
		$.ajax({
			url: this.config.locales[lngId],
			async: false,
			dataType: 'text',
			success: function(data) {
				var locale = yaml.safeLoad(data);
				var localeName = Object.keys(locale)[0];
				this.translator.addTranslation(localeName, locale[localeName]);
			}.bind(this)
		}).fail(function() { throw new Error("[Controller] Error while retrieving locales file: "+this.config.locales[lngId]); }.bind(this));
	}
	//Set locale according to browser
	this.translator.setLocale(window.navigator.userLanguage || window.navigator.language);

	/*
	 * Init main view
	 */
	this.view = new MainView(
		this.divId,
		this.mode,
		this.config,
		this.styles,
		this.newNote,
		this.search,
		this.data.osm,
		this.pictures.flickr,
		this.translator.t.bind(this.translator),
		options
	);

	/*
	 * URL updates
	 */
	this.view.map.on("levelchanged", function() {
		this.url.setParameter("level", this.view.level.level);
		this.url.write();
	}.bind(this));

	this.view.map.on("basechanged", function(o) {
		//Find tile ID in config
		var tileId = -1;
		var confId = 0;
		while(tileId < 0 && confId < this.config.tiles.length) {
			if(this.config.tiles[confId].name == o.base) {
				tileId = confId;
			}
			confId++;
		}

		if(tileId >=0) {
			this.url.setParameter("tile", tileId);
		}

		this.url.write();
	}.bind(this));

	this.view.map.on("stylechanged", function(o) {
		this.url.setParameter("style", this.styles[o.style].olu_shortname);
		this.url.write();
	}.bind(this));
};

//OTHER METHODS
/**
 * Loads synchronously all the configuration files
 * @param folder The folder containing JSON configuration files
 */
Main.prototype._initConfig = function(config) {
	var overwriteStyle = (config && config.styles && config.styles.length > 0) ? config.styles : null;
	//Update default config according to given one
	$.extend(true, this.config, config);
	if(overwriteStyle) { this.config.styles = overwriteStyle; }

	//Load MapCSS styles
	for(var i=0; i < this.config.styles.length; i++) {
		if(typeof this.config.styles[i] === 'string') {
			$.ajax({
				url: this.config.styles[i],
				async: false,
				dataType: 'text',
				success: function(data) {
					var shortname = this.config.styles[i].replace(".mapcss", "").toLowerCase();
					this.styles[i] = new RuleSet();
					this.styles[i].parseCSS(data);
					this.styles[i].olu_shortname = shortname;
				}.bind(this)
			}).fail(function() { throw new Error("[Controller] Error while retrieving MapCSS file: "+this.config.styles[i]); }.bind(this));
		}
	}
};


module.exports = Main;
