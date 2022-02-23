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

var L = require('leaflet');
var $ = require('jquery');

/**
 * Creates a new OSM Note
 */
var NewNote = function(apiUrl) {
//ATTRIBUTES
	/** The OSM API URL for notes **/
	this._url = apiUrl + "notes";
};

//OTHER METHODS
/**
 * Creates a new note
 * @param coordinates The note coordinates
 * @param text The note comment
 * @param success The callback function called when note is successfully added
 * @param fail The callback function called when note isn't added
 */
NewNote.prototype.do = function(coordinates, text, success, fail) {
	//Check text
	if(text == null || text == undefined || text.trim().length == 0) {
		throw new Error("ctrl.service.NewNote.invalidText");
	}
	
	//Check coordinates
	if(coordinates == null || coordinates == undefined || !coordinates instanceof L.LatLng) {
		throw new Error("ctrl.service.NewNote.invalidCoordinates");
	}
	
	coordinates = coordinates.wrap();
	text = text.trim();
	success = success || null;
	fail = fail || function() { throw new Error("ctrl.service.NewNote.sendingFailed"); };
	
	//Create call URL
	var url = this._url + "?lat=" + coordinates.lat + "&lon=" + coordinates.lng + "&text=" + text;
	
	//Post
	$.post(url, null, success, "xml").fail(fail);
};

module.exports = NewNote;
