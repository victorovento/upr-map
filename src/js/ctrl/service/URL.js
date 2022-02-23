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

var util = require('../../utils');

/**
 * URL service reads and updates browser URL according to application parameters.
 * This service only handles query part of URL (see doc/API.md).
 */
var URL = function(read, write) {
//ATTRIBUTES
	/** The read function **/
	this._readURL = read;
	
	/** The write function **/
	this._writeURL = write;
	
	/** Current URL value **/
	this._url = undefined;
	
	/** The base URL **/
	this._base = undefined;
};

//CONSTANTS
/** Recognized read parameters **/
URL.VALID_PARAMETERS = [ "tile", "level", "style", "transcend", "buildings", "pictures", "unrendered", "notes", "deprecated_lat", "deprecated_lon", "deprecated_zoom" ];

/** Legacy base 62 conversion array **/
URL.BASE62 = [ "0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z" ];

/** Legacy int to letter conversion array **/
URL.LETTERS = [ "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z" ];


//ACCESSORS
/**
 * Return the wanted parameter
 * @param p The parameter to read, available values: tile / level / transcend / buildings / pictures / unrendered / notes
 * @return The wanted value as string
 */
URL.prototype.getParameter = function(p) {
	if(this._url == undefined) { this.read(); }
	if(!util.contains(URL.VALID_PARAMETERS, p)) { throw new Error("ctrl.service.URL.invalidParameter"); }
	
	return this._url[p];
};


//MODIFIERS
/**
 * Edits a given parameter
 * @param p The parameter to edit
 * @param v The new value
 */
URL.prototype.setParameter = function(p, v) {
	if(this._url == undefined) { this.read(); }
	if(!util.contains(URL.VALID_PARAMETERS, p)) { throw new Error("ctrl.service.URL.invalidParameter"); }
	
	//Change parameter
	this._url[p] = v;
};


//OTHER METHODS
/**
 * Reads the URL from the reader function
 */
URL.prototype.read = function() {
	var url = this._readURL();
	
	//Parse given URL
	this._base = (url.indexOf("?") >= 0) ? url.split('?')[0] : url.split('#')[0];
	var query = (url.indexOf("?") >= 0) ? url.split('?')[1].split('#')[0] : "";
	this._url = {};
	
	//Read query parameters
	var params = {};
	var sURLVariables = query.split('&');
	for(var i=0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		params[sParameterName[0]] = sParameterName[1];
	}
	
	//Read legacy parameters
	if(!isNaN(parseFloat(params.lat))) { this._url.deprecated_lat = params.lat; }
	if(!isNaN(parseFloat(params.lon))) { this._url.deprecated_lon = params.lon; }
	if(!isNaN(parseInt(params.z))) { this._url.deprecated_zoom = params.z; }
	if(!isNaN(parseFloat(params.lvl))) { this._url.level = params.lvl; }
	if(params.tcd == "1" || params.tcd == "0") { this._url.transcend = params.tcd == "1"; }
	if(params.urd == "1" || params.urd == "0") { this._url.unrendered = params.urd == "1"; }
	if(params.bdg == "1" || params.bdg == "0") { this._url.buildings = params.bdg == "1"; }
	if(params.pic == "1" || params.pic == "0") { this._url.pictures = params.pic == "1"; }
	if(params.nte == "1" || params.nte == "0") { this._url.notes = params.nte == "1"; }
	
	//Read legacy short links
	if(params.s != undefined) {
		var validShortRgx = /^(-?)([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\+(-?)([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\+([A-Z])([a-zA-Z0-9]+)\+(?:(-?)([a-zA-Z0-9]+)\.([a-zA-Z0-9]+))?(?:\+([a-zA-Z0-9]+))?$/;
		if(validShortRgx.test(params.s)) {
			var shortRes = validShortRgx.exec(params.s);
			this._url.deprecated_lat = (URL.base62toDec(shortRes[2]) + URL.base62toDec(shortRes[3]) / 100000).toString();
			if(shortRes[1] == "-") { this._url.deprecated_lat = "-"+this._url.deprecated_lat; }
			
			this._url.deprecated_lon = (URL.base62toDec(shortRes[5]) + URL.base62toDec(shortRes[6]) / 100000).toString();
			if(shortRes[4] == "-") { this._url.deprecated_lon = "-"+this._url.deprecated_lon; }
			
			this._url.deprecated_zoom = (URL.LETTERS.indexOf(shortRes[7]) + 1).toString();
			
			var options = URL.base62toDec(shortRes[8]).toString(2);
			while(options.length < 7) { options = "0" + options; }
			this._url.unrendered = options[options.length - 1] == 1;
			this._url.transcend = options[options.length - 3] == 1;
			this._url.buildings = options[options.length - 4] == 1;
			this._url.pictures = options[options.length - 5] == 1;
			this._url.notes = options[options.length - 6] == 1;
			
			//Get level if available
			if(shortRes[10] != undefined && shortRes[11] != undefined) {
				this._url.level = URL.base62toDec(shortRes[10]) + URL.base62toDec(shortRes[11]) / 100;
				if(shortRes[9] == "-") { this._url.level = -this._url.level; }
			}
			
			//Get tiles if available
			if(shortRes[12] != undefined) {
				this._url.tile = URL.base62toDec(shortRes[12]);
			}
		}
	}
	
	//Store valid parameters
	if(!isNaN(parseInt(params.t))) { this._url.tile = params.t; }
	if(!isNaN(parseFloat(params.l))) { this._url.level = params.l; }
	if(typeof params.s === "string") { this._url.style = params.s; }
	
	//Boolean options
	if(params.o != undefined) {
		var opts = params.o.split('');
		this._url.transcend = util.contains(opts, "t");
		this._url.buildings = util.contains(opts, "b");
		this._url.pictures = util.contains(opts, "p");
		this._url.unrendered = util.contains(opts, "u");
		this._url.notes = util.contains(opts, "n");
	}
};

/**
 * Writes the URL into the writer function
 */
URL.prototype.write = function() {
	if(this._url == undefined) { this.read(); }
	var url = this._base;
	var query = "";
	
	//Write parameters
	if(this._url.tile != undefined) { query += 't='+this._url.tile; }
	if(this._url.level != undefined) {
		if(this._url.tile != undefined) { query += '&'; }
		query += 'l='+this._url.level;
	}
	if(this._url.style != undefined) {
		if(this._url.tile != undefined || this._url.level != undefined) { query += '&'; }
		query += 's='+this._url.style;
	}
	
	//Write options
	var opts = "";
	if(this._url.transcend) { opts += 't'; }
	if(this._url.buildings) { opts += 'b'; }
	if(this._url.pictures) { opts += 'p'; }
	if(this._url.unrendered) { opts += 'u'; }
	if(this._url.notes) { opts += 'n'; }
	
	if(opts.length > 0) {
		if(this._url.tile != undefined || this._url.level != undefined) { query += '&'; }
		query += 'o=' + opts;
	}
	
	//Add query part to URL
	if(query.length > 0) {
		url += '?' + query;
	}
	
	//Add current hash part
	var splitHash = this._readURL().split('#');
	if(splitHash.length > 1) {
		url += '#' + splitHash[1];
	}
	//Or read from deprecated parameters if no hash part defined
	else if(this._url.deprecated_lat != undefined && this._url.deprecated_lon != undefined && this._url.deprecated_zoom != undefined) {
		url += '#' + this._url.deprecated_zoom + '/' + this._url.deprecated_lat + '/' + this._url.deprecated_lon;
	}
	
	this._writeURL(url);
};

/**
 * Converts a string in base 62 into an integer (base 10, decimal)
 * This is based on the Horner method
 * @param val The string in base 62
 * @return The integer in base 10
 */
URL.base62toDec = function(val) {
	var result = 0;
	
	for(var i=0; i < val.length; i++) {
		result += URL.BASE62.indexOf(val[i]) * Math.pow(62, val.length - 1 - i);
	}
	
	return result;
};

module.exports = URL;
