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
var Polylabel = require("polylabel");
var util = require('../utils');

/**
 * This class handles a feature geometry, and allows to do some processing on it.
 */
var FeatureGeometry = function(fGeometry) {
//ATTRIBUTES
	/** The coordinates **/
	this.coordinates = fGeometry.coordinates;
	
	/** The geometry type (GeoJSON based) **/
	this.type = fGeometry.type;
};

//ACCESSORS
/**
 * @return The center of bounding box
 */
FeatureGeometry.prototype.getBoundsCenter = function() {
	var result = null;
	var bounds = this.getBounds();
	
	if(bounds != null) {
		result = bounds.getCenter();
	}
	
	return result;
};

/**
 * Get the centroid for label
 * @return The centroid if it's in the polygon, or another point in the polygon
 */
FeatureGeometry.prototype.getLabelPosition = function() {
	var result = null;
	
	if(this.type == "Point") {
		result = this.asLatLng();
	}
	else if(this.type == "LineString") {
		var length = this.coordinates.length;
		
		//Even
		if(length % 2 == 0) {
			var midId = length / 2 - 1;
			result = L.latLng(
				(this.coordinates[midId][1] + this.coordinates[midId+1][1]) / 2,
				(this.coordinates[midId][0] + this.coordinates[midId+1][0]) / 2
			);
		}
		//Uneven = LatLng of middle point
		else {
			result = L.latLng(this.coordinates[(length-1)/2][1], this.coordinates[(length-1)/2][0]);
		}
	}
	else if(this.type == "Polygon" || this.type == "MultiPolygon") {
		var coords = (this.type == "MultiPolygon") ? this.coordinates[0] : this.coordinates;
		if(coords[0].length > 4) {
			result = Polylabel(coords, 0.00001);
			result = L.latLng(result[1], result[0]);
		}
		else {
			result = this.getBoundsCenter();
		}
	}
	else {
		console.log("Unknown type: "+this.type);
	}
	
	return result;
};

/**
 * @return The geometry as leaflet format (LatLng)
 */
FeatureGeometry.prototype.asLatLng = function() {
	var result = null;
	
	switch(this.type) {
		case "Point":
			result = L.latLng(this.coordinates[1], this.coordinates[0]);
			break;
			
		case "LineString":
			result = [];
			var coords;
			for(var i = 0; i < this.coordinates.length; i++) {
				coords = this.coordinates[i];
				result[i] = L.latLng(coords[1], coords[0]);
			}
			break;
			
		case "Polygon":
			result = [];
			var coords;
			for(var i = 0; i < this.coordinates.length; i++) {
				result[i] = [];
				for(var j=0; j < this.coordinates[i].length; j++) {
					coords = this.coordinates[i][j];
					result[i][j] = L.latLng(coords[1], coords[0]);
				}
			}
			break;
			
		case "MultiPolygon":
			result = [];
			var coords;
			for(var i = 0; i < this.coordinates.length; i++) {
				result[i] = [];
				for(var j=0; j < this.coordinates[i].length; j++) {
					result[i][j] = [];
					for(var k=0; k < this.coordinates[i][j].length; k++) {
						coords = this.coordinates[i][j][k];
						result[i][j][k] = L.latLng(coords[1], coords[0]);
					}
				}
			}
			break;
			
		default:
			console.log("Unknown type: "+this.type);
	}
	
	return result;
};

/**
 * Returns the bounding box
 * @return The bounding box
 */
FeatureGeometry.prototype.getBounds = function() {
	var minlat, maxlat, minlon, maxlon, result;

	switch(this.type) {
		case "Point":
			minlat = this.coordinates[1];
			maxlat = this.coordinates[1];
			minlon = this.coordinates[0];
			maxlon = this.coordinates[0];
			result = L.latLngBounds(L.latLng(minlat, minlon), L.latLng(maxlat, maxlon));
			break;
			
		case "LineString":
			minlat = this.coordinates[0][1];
			maxlat = this.coordinates[0][1];
			minlon = this.coordinates[0][0];
			maxlon = this.coordinates[0][0];
			
			for(var i = 1; i < this.coordinates.length; i++) {
				var coords = this.coordinates[i];
				if(coords[0] < minlon) { minlon = coords[0]; }
				else if(coords[0] > maxlon) { maxlon = coords[0]; }
				if(coords[1] < minlat) { minlat = coords[1]; }
				else if(coords[1] > maxlat) { maxlat = coords[1]; }
			}
			result = L.latLngBounds(L.latLng(minlat, minlon), L.latLng(maxlat, maxlon));
			break;
			
		case "Polygon":
			minlat = this.coordinates[0][0][1];
			maxlat = this.coordinates[0][0][1];
			minlon = this.coordinates[0][0][0];
			maxlon = this.coordinates[0][0][0];
			
			var coords;
			for(var i = 0; i < this.coordinates.length; i++) {
				for(var j=0; j < this.coordinates[i].length; j++) {
					coords = this.coordinates[i][j];
					if(coords[0] < minlon) { minlon = coords[0]; }
					else if(coords[0] > maxlon) { maxlon = coords[0]; }
					if(coords[1] < minlat) { minlat = coords[1]; }
					else if(coords[1] > maxlat) { maxlat = coords[1]; }
				}
			}
			result = L.latLngBounds(L.latLng(minlat, minlon), L.latLng(maxlat, maxlon));
			break;
			
		case "MultiPolygon":
			minlat = this.coordinates[0][0][0][1];
			maxlat = this.coordinates[0][0][0][1];
			minlon = this.coordinates[0][0][0][0];
			maxlon = this.coordinates[0][0][0][0];
			
			var coords;
			for(var i = 0; i < this.coordinates.length; i++) {
				for(var j=0; j < this.coordinates[i].length; j++) {
					for(var k=0; k < this.coordinates[i][j].length; k++) {
						coords = this.coordinates[i][j][k];
						if(coords[0] < minlon) { minlon = coords[0]; }
						else if(coords[0] > maxlon) { maxlon = coords[0]; }
						if(coords[1] < minlat) { minlat = coords[1]; }
						else if(coords[1] > maxlat) { maxlat = coords[1]; }
					}
				}
			}
			result = L.latLngBounds(L.latLng(minlat, minlon), L.latLng(maxlat, maxlon));
			break;
			
		default:
			console.log("Unknown type: "+this.type);
			result = null;
	}
	
	return result;
};

module.exports = FeatureGeometry;
