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

/**
 * Parameters content for side bar
 */
var Parameters = function() {
//ATTRIBUTES
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
Parameters.prototype.get = function() {
	var element = $("<div/>");
	element.append("<h2>Parameters</h2>");
	
	return element;
};

module.exports = Parameters;
