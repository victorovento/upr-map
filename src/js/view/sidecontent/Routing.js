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
 * Routing content for side bar
 */
var Routing = function() {
//ATTRIBUTES
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
Routing.prototype.get = function() {
	var element = $("<div/>");
	element.append("<h2>Routing</h2>");
	element.append("<p>Not available yet</p>");
	
	return element;
};

module.exports = Routing;
