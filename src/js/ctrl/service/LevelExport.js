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

var FileSaver = require('filesaver');

/**
 * Service for exporting a given level of OSM features
 */
var LevelExport = function() {
};

//OTHER METHODS

/**
 * Export features of a given level
 * @param level The level to export
 * @param features The OSM features (as an object with id -> feature)
 */
LevelExport.prototype.do = function(level, features, avoidDl) {
	avoidDl = avoidDl || false;
	var featuresOnLevel = [];
	
	//Filter features
	for(var f in features) {
		if(features[f].isOnLevel(level)) {
			featuresOnLevel.push(features[f].asGeoJSON());
		}
	}
	
	//Error if no features found
	if(featuresOnLevel.length == 0) {
		throw new Error("ctrl.service.LevelExport.noFeaturesOnLevel");
	}
	
	//Create GeoJSON
	var geojson = { type: "FeatureCollection", features: featuresOnLevel };
	
	//Export
	var file = new Blob(
		[JSON.stringify(geojson, null, '\t')],
						{ type: "application/json;charset=utf-8;" }
	);
	if(!avoidDl) {
		FileSaver.saveAs(file, "OpenLevelUp_lvl_"+level+".geojson");
	}
};

module.exports = LevelExport;
