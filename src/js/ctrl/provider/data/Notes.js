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
var L = require("leaflet");
var Note = require('../../../model/Note');

/**
 * Notes data provider allows to download OSM notes.
 */
var Notes = function(apiUrl) {
//ATTRIBUTES
	/** The API URL for notes download **/
	this._url = apiUrl + 'notes';
};

//OTHER METHODS
/**
 * Download notes on a given area
 * @param bbox The bounding box
 * @param success The function which is called when notes download is done. It must accept as a parameter an array of Notes
 * @param fail The function which is called if download fails. By default, a function throwing an Error is used.
 */
Notes.prototype.download = function(bbox, success, fail) {
	//Check parameters
	if(bbox == null || bbox == undefined || !bbox instanceof L.LatLngBounds) { throw new Error("ctrl.provider.data.Notes.invalidBbox"); }
	if(success == null || success == undefined || typeof success !== "function") { throw new Error("ctrl.provider.data.Notes.invalidSuccessFunction"); }
	
	var url = this._url + '?closed=0&bbox=' + bbox.toBBoxString();
	var parser = function(xml) { this._parse(xml, success, fail); }.bind(this);
	fail = fail || function() { throw new Error("ctrl.provider.data.Notes.downloadFailed"); }
	
	$.ajax({
		url: url,
		type: 'GET',
		async: true,
		dataType: 'xml',
		success: parser
	}).fail(fail);
};

/**
 * Parses XML response
 * @param xml The XML response from API
 * @param success The function to call back if parsing is successful
 * @param fail The function to call back if parsing fails
 */
Notes.prototype._parse = function(xml, success, fail) {
	var result = [];
	
	//Read XML result
	$(xml).find('note').each(function() {
		//Create note
		var id = result.push(new Note(
			$(this).find('id').text(),
			L.latLng($(this).attr('lat'), $(this).attr('lon')),
			$(this).find('date_created').text(),
			$(this).find('status').text()
		)) - 1;
		
		//Add comments
		$(this).find('comment').each(function() {
			result[id].addComment(
				$(this).find('date').text(),
				$(this).find('uid').text(),
				$(this).find('user').text(),
				$(this).find('action').text(),
				$(this).find('text').text()
			);
		});
	});
	
	if(result.length > 0) {
		success(result);
	}
	else {
		fail = fail || function() { throw new Error("ctrl.provider.data.Notes.noNotesFound"); }
		fail();
	}
};

module.exports = Notes;
