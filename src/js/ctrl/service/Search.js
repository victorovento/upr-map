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
var SearchResult = require("../../model/SearchResult");

/**
 * Search service takes user string and find location corresponding to the given address.
 */
var Search = function(nominatimUrl) {
//ATTRIBUTES
	/** The nominatim API URL **/
	this._nominatim = nominatimUrl;
};

//OTHER FUNCTIONS
/**
 * Find a place according to given address
 * @param text The address to look for
 * @param success The function to call back if search worked
 * @param fail The function to call back in case of error
 */
Search.prototype.find = function(text, success, fail) {
	text = text.trim().replace(/\s/g, "+");
	
	if(text != "") {
		$.get(
			this._nominatim + "search?q=" + encodeURIComponent(text).replace(/\%2B/g, "+") + "&format=json",
			null,
			function(d) { success(this._parse(d)); }.bind(this),
			"json"
		).fail(fail);
	} else {
		throw new Error("ctrl.service.Search.invalidQuery");
	}
};

/**
 * Parse results from nominatim
 * @param raw The raw JSON data from Nominatim
 * @return An array of SearchResult objects
 */
Search.prototype._parse = function(raw) {
	var result = [];
	var r;
	
	for(var i=0; i < raw.length; i++) {
		r = raw[i];
		result.push(
			new SearchResult(
				L.latLng(r.lat, r.lon),
				L.latLngBounds(
					L.latLng(r.boundingbox[0], r.boundingbox[2]),
					L.latLng(r.boundingbox[1], r.boundingbox[3])
				),
				r.display_name,
				r.class+": "+r.type
			)
		);
	}
	
	return result;
};


module.exports = Search;
