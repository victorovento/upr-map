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

var Graph = require('../../model/Graph');

/**
 * Routing service generates route to go from one place to another.
 */
var Routing = function(modes, osmData) {
//ATTRIBUTES
	/** The routing modes **/
	this._modes = modes;
	
	/** The OpenStreetMap raw data **/
	this._osm = osmData;
	
	/** The graphs **/
	this._graphs = {};
};

//OTHER METHODS
/**
 * Process graph to create route
 * @param mode The routing mode
 * @param startPoint The coordinates where the route starts
 * @param startLevel The level where the start point belongs
 * @param endPoint The coordinates where the route ends
 * @param endLevel The level where the end point belongs
 * @param success The success function to call back
 * @param fail The fail function to call back
 */
Routing.prototype.do = function(mode, startPoint, startLevel, endPoint, endLevel, success, fail) {
	var self = this;
	
	setTimeout(function() { self._process(mode, startPoint, startLevel, endPoint, endLevel, success, fail); });
};

/**
 * Process route
 */
Routing.prototype._process = function(mode, startPoint, startLevel, endPoint, endLevel, success, fail) {
	//Create graph if not available
	if(this._graphs[mode] == undefined) {
		this._graphs[mode] = new Graph();
		this._graphs[mode].createFromOSMData(this._osm, this._modes[mode].avoid);
	}
	
	//Launch routing
	success(this._graphs[mode].findShortestPath(startPoint, startLevel, endPoint, endLevel));
};

module.exports = Routing;
