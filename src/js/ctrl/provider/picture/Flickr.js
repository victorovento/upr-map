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
 * Flickr picture provider calls Flickr API to get related pictures.
 * Related pictures have an "osm:" machine tag and a geolocation.
 */
var Flickr = function(apiUrl, apiKey) {
//ATTRIBUTES
	/** The API URL **/
	this._url = apiUrl;
	
	/** The API key for OpenLevelUp **/
	this._key = apiKey;
};

//CONSTANTS
/** Regex for OSM machine tag in Flickr **/
Flickr.OSM_TAG_RGX = /^(osm:)(node|way|relation)$/;


//OTHER METHODS
/**
 * Retrieves Flickr pictures as { osmId: [ pic1, pic2, ... ] }
 * @param bbox The bounding box
 * @param success The function to call back if picture download is successful
 * @param fail The function to call back if an error occurs
 */
Flickr.prototype.get = function(bbox, success, fail) {
	bbox = L.latLngBounds(bbox.getSouthWest().wrap(), bbox.getNorthEast().wrap());
	var url = this._url + 'method=flickr.photos.search&api_key=' + this._key + '&bbox=' + bbox.toBBoxString() + '&machine_tags=osm:&has_geo=1&extras=machine_tags,url_c,date_taken,owner_name&format=json&nojsoncallback=1';
	
	$.ajax({
		url: url,
		async: true,
		dataType: 'json',
		success: function(d) {
			if(!d || d.stat != "ok" || d.photos == undefined || d.photos.photo == undefined) {
				fail();
			}
			else {
				success(Flickr._simpleResult(d));
			}
		}
	}).fail(fail);
};

/**
 * Simplifies the returned Flickr data
 * @param data The API data
 * @return Simple data
 */
Flickr._simpleResult = function(data) {
	var result = {};
	
	if(data.stat != "ok" || data.photos == undefined || data.photos.photo == undefined) {
		throw new Error("ctrl.provider.picture.Flickr.invalidData");
	}
	
	var photos = data.photos.photo;
	var photo, machineTags, machineTag, mtKey, mtValue, osmType, osmId;
	
	for(var i=0; i < photos.length; i++) {
		photo = photos[i];
		
		//Read machine tags
		machineTags = photo.machine_tags.split(' ');
		for(var j=0; j < machineTags.length; j++) {
			machineTag = machineTags[j].split('=');
			mtKey = machineTag[0];
			mtValue = machineTag[1];
			
			//Check if is an OSM machine tag
			if(mtKey.match(Flickr.OSM_TAG_RGX) && !isNaN(mtValue)) {
				var osmType = mtKey.split(':')[1];
				var osmId = osmType + '/' + mtValue;
				
				//Add to result
				if(result[osmId] == undefined) { result[osmId] = []; }
				
				result[osmId].push({
					url: photo.url_c,
					date: new Date(photo.datetaken.replace(" ", "T")).getTime() / 1000,
					author: photo.ownername,
					authorId: photo.owner,
					imgId: photo.id
				});
			}
		}
	}
	
	return result;
};

module.exports = Flickr;
