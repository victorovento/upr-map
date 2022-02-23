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
var L = require('leaflet');
var osmtogeojson = require('osmtogeojson');
var util = require('../../../utils');
var Feature = require('../../../model/Feature');

/**
 * OSM data provider requests data to Overpass-Turbo
 */
var OSM = function(oapi, polygonFeatures) {
//ATTRIBUTES
	/** The Overpass API URL **/
	this._oapi = oapi;
	
	/** The polygon features config **/
	this.polygonFeatures = polygonFeatures;
	
	/** Is another Overpass API query running **/
	this._runningQuery = false;
};

//OTHER METHODS
/**
 * Download full data in given bounding box
 * @param bbox The bounding box
 * @param success The callback function when download is successful, must take as first argument an object { features: features, levels: levels, names: names }
 * @param fail The callback function when download fails
 */
OSM.prototype.download = function(bbox, success, fail) {
	this._requestOverpass(
		bbox,
		'(node["repeat_on"];way["repeat_on"];relation["repeat_on"];node[~"level"~"."];way[~"level"~"."];relation[~"level"~"."];);out body;>;out qt skel;',
		function(data) { success(this._process(data)); }.bind(this),
		fail
	);
};

/**
 * Download partial data (main elements such as building structure and main POIs) in given bounding box
 * @param bbox The bounding box
 * @param success The callback function when download is successful, must take as first argument an object { featureId: feature }
 * @param fail The callback function when download fails
 */
OSM.prototype.downloadLight = function(bbox, success, fail) {
	this._requestOverpass(
		bbox,
		'(way["indoor"]["indoor"!="yes"];relation["indoor"]["indoor"!="yes"];way["buildingpart"~"room|verticalpassage|corridor"];relation["buildingpart"~"room|verticalpassage|corridor"];node[~"amenity|shop|railway|highway|door|entrance"~"."];way[~"amenity|shop|railway|highway|building:levels"~"."];relation[~"amenity|shop|railway|highway|building:levels"~"."];);out body;>;out skel qt;',
		function(data) { success(this._process(data)); }.bind(this),
		fail
	);
};

/**
 * Download high-level data (minimal elements) in given bounding box
 * @param bbox The bounding box
 * @param success The callback function when download is successful, must take as first argument an object { featureId: feature }
 * @param fail The callback function when download fails
 */
OSM.prototype.downloadCluster = function(bbox, success, fail) {
	this._requestOverpass(
		bbox,
		'(way["indoor"="room"]["level"];way["buildingpart"="room"]["level"];);out ids center;',
		function(data) { success(this._parse(data)); }.bind(this),
		fail
	);
};

/**
 * Request the overpass API
 * @param request The overpass request
 * @param success The success callback
 * @param fail The fail callback
 */
OSM.prototype._requestOverpass = function(bbox, request, success, fail) {
	if(!this._runningQuery) {
		this._runningQuery = true;
		
		bbox = L.latLngBounds(bbox.getSouthWest().wrap(), bbox.getNorthEast().wrap());
		var url = this._oapi+encodeURIComponent('[out:json][timeout:25][bbox:'+bbox.getSouth()+","+bbox.getWest()+","+bbox.getNorth()+","+bbox.getEast()+'];' + request);
		
		fail = fail || function(event, jqxhr, settings, thrownError) { throw new Error(thrownError+"\nURL: "+settings.url); }
		var ownFail = function(event, jqxhr, settings, thrownError) {
			this._runningQuery = false;
			fail(event, jqxhr, settings, thrownError);
		}.bind(this);
		$(document).ajaxError(ownFail);
		
		$.get(
			url,
			function(d) {
				this._runningQuery = false;
				success(d);
			}.bind(this),
			"json"
		).fail(ownFail);
	}
	//Delay request in order to not being blocked by Overpass API
	else {
		setTimeout(
			function() {
				this._requestOverpass(bbox, request, success, fail);
			}.bind(this),
			1000
		);
	}
};

/**
 * Processes returned data for simple download
 */
OSM.prototype._process = function(data) {
	var geojson = this._parse(data);
	var features = {}, levels = [], names = [];
	var id, f, i, currentFeature, lvlId, lvl, nbLevels;
	
	//Create features
	for(i=0; i < geojson.features.length; i++) {
		f = geojson.features[i];
		id = f.id;
		currentFeature = new Feature(f);
		nbLevels = currentFeature.onLevels.length;
		
		if(features[id] == undefined) {
			if(nbLevels > 0) {
				features[id] = currentFeature;
				
				//Add levels to list
				$.merge(levels, currentFeature.onLevels);
				
				//Add name to list
				if(currentFeature.hasTag("name")) {
					for(var lvlId=0; lvlId < currentFeature.onLevels.length; lvlId++) {
						lvl = currentFeature.onLevels[lvlId];
						
						//Create given level in names if needed
						if(names[lvl] == undefined) {
							names[lvl] = [];
						}
						
						names[lvl][currentFeature.getTag("name")] = currentFeature;
					}
				}
			}
		}
	}
	
	//Sort and remove duplicates in levels array
	levels = levels.sort(util.sortNumberArray).filter(util.rmDuplicatesSortedArray);
	
	return { features: features, levels: levels, names: names };
};

/**
 * Parses raw OSM data, and return result.
 * @param data The OSM data.
 * @return The OSM parsed data (GeoJSON)
 */
OSM.prototype._parse = function(data) {
	if(!data) {
		console.error(data);
		throw new Error("ctrl.provider.data.OSM.invalidData");
	}
	return osmtogeojson(data, { polygonFeatures: this.polygonFeatures });
};

module.exports = OSM;
