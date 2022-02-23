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

/**
 * A search result is a place somewhere in the world.
 * It has coordinates, a name, a type of object (road, room, ...) and eventually a level.
 */
var SearchResult = function(coords, bbox, name, type, level) {
//ATTRIBUTES
    /** The location of the object **/
    this.coordinates = coords;
    
	/** The bounding box **/
	this.bbox = bbox;
	
    /** Its name **/
    this.name = name;
    
    /** Its type **/
    this.objectType = type;
    
    /** Its level (0 by default) **/
    this.level = level || 0;
};


module.exports = SearchResult;
