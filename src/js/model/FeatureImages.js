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

var util = require('../utils');

/**
 * FeatureImages represents the picture related to a given feature
 * They can be from various sources (Web URL, Mapillary, Flickr, ...)
 */
var FeatureImages = function(tags) {
//ATTRIBUTES
	/** The images **/
	this._imgs = [];

//Init
	this._init(tags);
};

//CLASS ATTRIBUTES
/** Regex for URL **/
FeatureImages.prototype.RGX_URL = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?\/[\w#!:.?+=&%@!\-\/]+\.(png|PNG|gif|GIF|jpg|JPG|jpeg|JPEG|bmp|BMP)$/;

/** Regex for URL without protocol **/
FeatureImages.prototype.RGX_URL_NO_PROTOCOL = /^(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?\/[\w#!:.?+=&%@!\-\/]+\.(png|PNG|gif|GIF|jpg|JPG|jpeg|JPEG|bmp|BMP)$/;

/** Regex for wiki image **/
FeatureImages.prototype.RGX_WIKI_IMG = /^(File):.+\.(png|PNG|gif|GIF|jpg|JPG|jpeg|JPEG|bmp|BMP)$/i;


//CONSTRUCTOR
FeatureImages.prototype._init = function(t) {
	// image = *
	if(t.image != undefined) {
		var imgVal = t.image;
		
		if(imgVal.match(this.RGX_URL)) {
			this.addWebImage(imgVal, "Web (image tag)");
		}
		else if(imgVal.match(this.RGX_URL_NO_PROTOCOL)) {
			this.addWebImage("http://"+imgVal, "Web (image tag)");
		}
		else if(imgVal.match(this.RGX_WIKI_IMG)) {
			this.addWikiImage(imgVal);
		}
	}
	
	// wikimedia_commons = *
	if(t.wikimedia_commons != undefined && t.wikimedia_commons.match(this.RGX_WIKI_IMG)) {
		this.addWikiImage(t.wikimedia_commons);
	}
};


//ACCESSORS
/**
 * @return The pictures, ordered by date
 */
FeatureImages.prototype.get = function() {
	return this._imgs.sort(this._sortByDate);
};

/**
 * @return true if it has valid images
 */
FeatureImages.prototype.hasValidImages = function() {
	return this.count() > 0;
};

/**
 * @return The amount of contained images
 */
FeatureImages.prototype.count = function() {
	return this._imgs.length;
};


//MODIFIERS
/**
 * Adds a new web image
 * @param url The image URL
 * @param source The image source
 */
FeatureImages.prototype.addWebImage = function(url, source) {
	this._imgs.push({
		img: url,
		src: source,
		page: url
	});
};

/**
 * Adds a new Wikimedia Commons image
 * @param wmid The wikimedia commons file ID
 */
FeatureImages.prototype.addWikiImage = function(wmid) {
	wmid = wmid.substring(5).replace(/ /g, '_')
	var digest = util.md5(wmid);
	var url = 'https://upload.wikimedia.org/wikipedia/commons/' + digest[0] + '/' + digest[0] + digest[1] + '/' + encodeURIComponent(wmid);
	
	this._imgs.push({
		img: url,
		src: "Wikimedia Commons",
		page: "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(wmid)
	});
};

/**
 * Adds a new Mapillary image
 * @param key The mapillary ID of the picture
 * @param date When the picture was taken
 * @param author The author of the picture
 * @param isSpherical Is this picture a 360° one ? False by default
 */
FeatureImages.prototype.addMapillaryImage = function(key, date, author, isSpherical) {
	isSpherical = isSpherical || false;
	
	this._imgs.push({
		img: "https://d1cuyjsrcm0gby.cloudfront.net/"+key+"/thumb-2048.jpg",
		src: "Mapillary ("+author+")",
		date: date,
		page: "http://www.mapillary.com/map/im/"+key,
		sphere: isSpherical
	});
};

/**
 * Adds a new Flickr image
 * @param title The picture title
 * @param url The picture URL
 * @param date When the picture was taken
 * @param author The author
 * @param authorId The author ID in Flickr
 * @param imgId The picture ID in Flickr
 */
FeatureImages.prototype.addFlickrImage = function(url, date, author, authorId, imgId) {
	this._imgs.push({
		img: url,
		src: "Flickr ("+author+")",
		date: date,
		page: "https://www.flickr.com/photos/"+authorId+"/"+imgId
	});
};


//OTHER METHODS
/**
 * Sort method to order pictures
 */
FeatureImages.prototype._sortByDate = function(a, b) {
	return b.date - a.date;
};

module.exports = FeatureImages;
