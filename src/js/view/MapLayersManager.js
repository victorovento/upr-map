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

var $ = require('jquery');
var L = require('leaflet');
var lh = require('leaflet.heat');
var azm = require("azimuth");
var Note = require("../model/Note");
var util = require("../utils");

/**
 * Manager for map layers, reading external data and creating appropriate map layers.
 * Adding/removing layers from map is not handled here.
 */
var MapLayersManager = function(map, t) {
//ATTRIBUTES
	/** The leaflet map **/
	this.map = map;
	
	/** The layers **/
	this.layers = { notes: null, cluster: null, features: null, tiles: null };
	
	/** The translator **/
	this.t = t;
	
	/** The markers **/
	this.markers = {
		noteOpen: L.icon({
			iconUrl: 'img/icon_note_open.png',
			iconSize: [25, 40],
			iconAnchor: [12, 40],
			popupAnchor: [0, -20]
		}),
		noteClosed: L.icon({
			iconUrl: 'img/icon_note_closed.png',
			iconSize: [25, 40],
			iconAnchor: [12, 40],
			popupAnchor: [0, -20]
		})
	};
};


//MODIFIERS
/**
 * Changes the notes layer on map
 * @param notes An array of Note
 */
MapLayersManager.prototype.setNotes = function(notes) {
	//Empty previous notes layer if any
	this.layers.notes = null;
	
	if(notes != null) {
		//Create markers
		var notesLayers = [];
		var n;
		
		for(var i=0; i < notes.length; i++) {
			n = notes[i];
			if(n instanceof Note) {
				notesLayers.push(
					L.marker(
						n.coordinates,
						{
							title: this.t("notes.id", { id: n.id }),
							icon: (n.status == "closed") ? this.markers.noteClosed : this.markers.noteOpen
						}
					).bindPopup(
						"<h3>"+this.t("notes.id", { id: n.id })+"</h3>"+
						"<p>Status: "+n.status+"<br /><a href=\"\">Details</a></p>"
					)
				);
			}
		}
		
		//Add to map
		this.layers.notes = L.layerGroup(notesLayers);
		this.map.fire("noteslayerready");
	}
};

/**
 * Changes the base tile layers
 * @param tiles The tile layers from CONFIG file
 */
MapLayersManager.prototype.setTiles = function(tiles) {
	//Empty previous tiles layers
	this.layers.tiles = {};
	
	var first = "";
	
	for(var i=0; i < tiles.length; i++) {
		this.layers.tiles[tiles[i].name] = L.tileLayer(tiles[i].URL, tiles[i]);
		if(i==0) {
			first = tiles[i].name;
		}
	}
	
	this.map.fire("tileslayerready", { first: first });
};

/**
 * Changes the OSM features layers
 * @param features An object { osmid: Feature }
 * @param ruleset The style rules to apply
 * @param options Parameters for icons { folder, size } and objects { showMissing }, and layer click { clickHandler }
 */
MapLayersManager.prototype.setOSMFeatures = function(f, ruleset, options) {
	//Create empty feature layers
	this.layers.features = {};
	for(var i=0; i < f.levels.length; i++) {
		this.layers.features[f.levels[i]] = L.layerGroup();
	}
	
	var feature, fid, fLayer, fStyle, fLayerEdited, fClickHandler;
	var fLevel, fIconUrl, fIconCoords, fIconAngle, coord1, coord2;
	var midSegment, fIconRgxTagName, fIconRgxTagValue, fTextOffset;
	var fHasIcon, textVal, fStyleProps;
	var fIconRgx = /\$\[(\w+)\]/;
	var locale = (window.navigator.userLanguage || window.navigator.language || "en").split("-")[0].toLowerCase();
	
	fClickHandler = options.clickHandler;
	
	//Read features
	for(fid in f.features) {
		feature = f.features[fid];
		feature.computeStyle(ruleset);
		
		//Create feature layer
		fLayer = L.featureGroup();
		fLayerEdited = false;
		fHasIcon = false;

// 		if(fid == "way/338795993") {
// 			console.log(feature);
// 			console.log(feature.style);
// 		}

		/*
		 * Shape styles
		 */
		if(feature.style.shapeStyles.default != undefined) { // && feature.geometry.type != "Point") {
			fStyle = feature.style.shapeStyles.default;
			fStyleProps = {
				weight: fStyle.width,
				color: fStyle.color,
				opacity: fStyle.opacity,
				dashArray: fStyle.dashes,
				lineCap: fStyle.linecap,
				fillColor: fStyle.fill_color,
				fillOpacity: fStyle.fill_opacity
			};
			
			if(feature.geometry.type != "Point") {
				fLayer.addLayer(
					L.GeoJSON.geometryToLayer(
						feature.asGeoJSON(),
						fStyleProps
					)
				);
			}
			else {
				fLayer.addLayer(
					L.circleMarker(feature.geometry.getLabelPosition(), fStyleProps)
				);
			}
			
			if(fStyle.z_index != undefined) {
				fLayer._olu_z_index = fStyle.z_index;
			}
			
			fLayerEdited = true;
		}
		
		/*
		 * Point styles
		 */
		if(feature.style.pointStyles.default != undefined && feature.style.pointStyles.default.icon_image != undefined) {
			fStyle = feature.style.pointStyles.default;
			fIconUrl = /url\(\'(.+)\'\)/.exec(fStyle.icon_image)[1];
			
			//Replace joker values in icon URL
			while(fIconUrl && fIconRgx.test(fIconUrl)) {
				//Replace tag name with actual tag value
				fIconRgxTagName = fIconRgx.exec(fIconUrl)[1];
				fIconRgxTagValue = feature.getTag(fIconRgxTagName);
				
				//If an alias exists for the given value, replace
				if(typeof feature.style.pointStyles.default.icon_image_aliases[fIconRgxTagValue] === "string") {
					fIconRgxTagValue = feature.style.pointStyles.default.icon_image_aliases[fIconRgxTagValue];
				}
				
				fIconUrl = fIconUrl.replace(fIconRgx, fIconRgxTagValue);
			}
			
			if(fIconUrl.length > 0) {
				fLayer.addLayer(L.marker(
					feature.geometry.getLabelPosition(),
					{
						icon: L.icon({
							iconUrl: options.folder + "/" + fIconUrl,
							iconSize: [
								(!isNaN(fStyle.icon_width)) ? fStyle.icon_width : options.size,
								(!isNaN(fStyle.icon_height)) ? fStyle.icon_height : options.size
							]
						}),
						opacity: fStyle.icon_opacity
					}
				));
				
				fLayerEdited = true;
				fHasIcon = true;
			}
		}
		
		/*
		 * Text styles
		 */
		if(
			feature.style.textStyles.default != undefined
			&& feature.style.textStyles.default.text != undefined
			&& feature.hasTag(feature.style.textStyles.default.text)
		) {
			fStyle = feature.style.textStyles.default;
			
			//Find angle and coordinates
			if(fStyle.text_center === false) {
				switch(feature.geometry.type) {
					case "LineString":
						midSegment = Math.floor((feature.geometry.coordinates.length-1)/2);
						coord1 = feature.geometry.coordinates[midSegment];
						coord2 = feature.geometry.coordinates[midSegment+1];
						fIconCoords = L.latLng((coord1[1] + coord2[1]) / 2, (coord1[0] + coord2[0]) / 2);
						fIconAngle = azm.azimuth({lat: coord1[1], lng: coord1[0], elv: 0}, {lat: coord2[1], lng: coord2[0], elv: 0}).azimuth;
						break;
					
					case "Polygon":
						midSegment = Math.floor((feature.geometry.coordinates[0].length-1)/2);
						coord1 = feature.geometry.coordinates[0][midSegment];
						coord2 = feature.geometry.coordinates[0][midSegment+1];
						fIconCoords = L.latLng((coord1[1] + coord2[1]) / 2, (coord1[0] + coord2[0]) / 2);
						fIconAngle = azm.azimuth({lat: coord1[1], lng: coord1[0], elv: 0}, {lat: coord2[1], lng: coord2[0], elv: 0}).azimuth;
						break;
					
					case "MultiPolygon":
						midSegment = Math.floor((feature.geometry.coordinates[0][0].length-1)/2);
						coord1 = feature.geometry.coordinates[0][0][midSegment];
						coord2 = feature.geometry.coordinates[0][0][midSegment+1];
						fIconCoords = L.latLng((coord1[1] + coord2[1]) / 2, (coord1[0] + coord2[0]) / 2);
						fIconAngle = azm.azimuth({lat: coord1[1], lng: coord1[0], elv: 0}, {lat: coord2[1], lng: coord2[0], elv: 0}).azimuth;
						break;
					
					case "Point":
					default:
						fIconCoords = feature.geometry.getLabelPosition();
						fIconAngle = null;
				}
			}
			else {
				fIconCoords = feature.geometry.getLabelPosition();
				fIconAngle = null;
			}
			
			//Text offset
			fTextOffset = (!isNaN(fStyle.text_offset)) ? (fStyle.text_offset) : 0;
			if(fHasIcon) {
				fTextOffset -= ((!isNaN(fStyle.icon_height)) ? fStyle.icon_height : options.size) / 2 + 5;
			}
			
			//Text value
			textVal = (fStyle.text == "name" && feature.hasTag("name:"+locale)) ? feature.getTag("name:"+locale) : feature.getTag(fStyle.text);
			
			fLayer.addLayer(this._createLabel(
				fIconCoords,
				textVal,
				fStyle,
				fTextOffset,
				fIconAngle
			));
			
			fLayerEdited = true;
		}
		
		/*
		 * Add to result layers
		 */
		if(fLayerEdited) {
			//Bind click event if needed
			if(fClickHandler) {
				var handler = (function(f) { return function() { fClickHandler(f); } })(feature);
				fLayer.on("click", handler);
			}
			
			//Add to each level layer
			for(fLevel=0; fLevel < feature.onLevels.length; fLevel++) {
				this.layers.features[feature.onLevels[fLevel]].addLayer(fLayer);
			}
		}
	}
	
	//Notify that layers are ready
	this.map.fire("featureslayerready", { levels: f.levels, names: f.names });
};

/**
 * Changes the OSM cluster layer
 * @param features An object { osmid: GeoJSON feature }
 */
MapLayersManager.prototype.setOSMCluster = function(cluster) {
	//Empty previous cluster layer
	this.layers.cluster = null;
	
	//Create cluster
	if(cluster != null) {
		var latlngs = [];
		
		for(var i=0; i < cluster.features.length; i++) {
			latlngs.push(L.latLng(cluster.features[i].geometry.coordinates[1], cluster.features[i].geometry.coordinates[0]));
		}
		
		this.layers.cluster = L.heatLayer(latlngs, {
			radius: 30,
			blur: 20,
			minOpacity: 0.4,
			gradient: {0.4: '#87D37C', 0.6: '#F7CA18', 0.7: '#D91E18'}
		});
		this.map.fire("clusterlayerready");
	}
};

//OTHER METHODS
/**
 * Create a label layer
 * @param coordinates The position of the label
 * @param text The content of the label
 * @param styles The text styles from MapCSS
 * @param offset The vertical offset
 * @param angle The rotation angle of the label (from 0 to 359, with 0 = north, 90 = east, 180 = south, 270 = west)
 * @return The leaflet layer
 */
MapLayersManager.prototype._createLabel = function(coordinates, text, styles, offset, angle) {
	if(angle) {
		//Change orientation from azimuth to text along line
		if(angle >= 90) { angle -= 90; }
		else { angle += 270; }
		
		//Correct reversed text
		if(angle > 90 && angle <= 180) { angle += 180; }
		else if(angle > 180 && angle <= 270) { angle -= 180; }
	}
	
	//Create CSS styles from parameters
	var cssStyles = (angle || false) ? 'transform: rotate('+angle+'deg);' : '';
	cssStyles += (styles.font_family) ? 'font-family: '+styles.font_family+';' : '';
	cssStyles += (!isNaN(styles.font_size)) ? 'font-size: '+styles.font_size+'px;line-height: '+styles.font_size+'px;' : '';
	cssStyles += (styles.font_bold) ? 'font-weight: bold;' : '';
	cssStyles += (styles.font_italic) ? 'font-style: italic;' : '';
	cssStyles += (styles.text_color) ? 'color: '+styles.text_color+';' : '';
	cssStyles += (!isNaN(styles.text_opacity)) ? 'opacity: '+styles.text_opacity+';' : '';
	
	return L.marker(coordinates, {
		icon: L.divIcon({
			className: 'olu-feature-label',
			html: '<div style="'+cssStyles+'">'+text+'</div>',
			iconAnchor: [ null, offset ],
			iconSize: [ ((angle) ? 200 : 70), null ]
		}),
		draggable: false
	});
};


module.exports = MapLayersManager;
