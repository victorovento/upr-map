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
var Mapillary = require("mapillary-js");

/**
 * Feature content for side bar
 */
var Feature = function(t) {
//ATTRIBUTES
	/** The current feature **/
	this._feature = null;
	
	/** The available feature details **/
	this._details = null;
	
	/** Some OLU options **/
	this._options = null;
	
	/** The currently shown picture ID **/
	this._pictureId = null;
	
	/** The mapillary keys associated to feature **/
	this._mapillary = null;
	
	/** The mapillary viewer **/
	this._mapillaryViewer = null;
	
	/** The translation function **/
	this.t = t;
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
Feature.prototype.get = function() {
	var element = $("<div/>");
	
	if(this._feature != null) {
		var title = $(
			"<div class=\"olu-side-content-feature-title\"><h2>"+this._displayName()+"</h2>"+
			((this._feature.category != this._feature.name && this._feature.category != null) ? "<span>"+this._feature.category+"</span>" : "<span>"+this.t("features.name")+"</span>")+
			"</div>"
		);
		element.append(title);
		
		/*
		 * Images
		 */
		var pictures = $("<div class=\"olu-side-content-feature-pictures\"></div>");
		
		if(this._feature.hasImages() || this._mapillary.length > 0) {
			this._pictureId = 0;
			
			//Prev / next buttons
			if(this._feature.getImages().count() + this._mapillary.length > 1) {
				var prevBtn = $("<div class=\"olu-prev\"><span>&lt;</span></div>");
				var nextBtn = $("<div class=\"olu-next\"><span>&gt;</span></div>");
				
				prevBtn.on("click", this._showPreviousPicture.bind(this));
				nextBtn.on("click", this._showNextPicture.bind(this));
				
				pictures.append(prevBtn);
				pictures.append(nextBtn);
			}
			
			//Simple images
			if(this._feature.getImages().count() > 0) {
				var images = this._feature.getImages().get();
				for(var i=0; i < images.length; i++) {
					pictures.append($("<div class=\"olu-side-content-feature-picture basic\"><a href=\""+images[i].img+"\" title=\""+this.t("pictures.show.fullsize")+"\" target=\"blank\"><img src=\""+images[i].img+"\" alt=\""+this.t("pictures.loading")+"\" /></a></div>").hide());
				}
			}
			
			//Mapillary images
			if(this._mapillary.length > 0) {
				pictures.append($("<div class=\"olu-side-content-feature-picture mapillary\"><div id=\"olu-side-content-feature-picture-mapillary-viewer\"></div></div>").hide());
			}
			
			pictures.find(".olu-side-content-feature-picture:first").show();
		}
		//Stub image
		else {
			pictures.append("<div class=\"olu-side-content-feature-picture basic\"><img src=\"img/stub_feature.jpg\" alt=\""+this.t("pictures.loading")+"\" /></div>");
		}
		element.append(pictures);
		
		/*
		 * Details
		 */
		var details = $("<div class=\"olu-side-content-feature-details\"></div>");
		
		//Major
		var detailsMajor = $("<div class=\"olu-major\"></div>");
		for(var dOsmKey in this._details.major) {
			if(this._feature.hasTag(dOsmKey)) {
				detailsMajor.append(this._detail(dOsmKey, this._details.major[dOsmKey]));
			}
		}
		details.append(detailsMajor);
		
		//Minor
		var detailsMinor = $("<div class=\"olu-minor\"></div>");
		for(var dOsmKey in this._details.minor) {
			if(this._feature.hasTag(dOsmKey)) {
				detailsMinor.append(this._detail(dOsmKey, this._details.minor[dOsmKey]));
			}
		}
		details.append(detailsMinor);
		
		element.append(details);
		
		/*
		 * Tags
		 */
		if(this._options.showTags) {
			var tags = $("<div class=\"olu-side-content-feature-tags\"></div>");
			tags.append("<h3>"+this.t("features.tags")+"</h3>");
			
			var table = $("<table></table>");
			
			//Tag table
			for(var k in this._feature.tags) {
				table.append("<tr><th><a href=\"https://wiki.openstreetmap.org/wiki/Key:"+k+"\">"+k+"</a></th><td>"+this._feature.getTag(k)+"</td></tr>");
			}
			
			tags.append(table);
			element.append(tags);
		}
	}
	
	return element;
};

//MODIFIERS
/**
 * Change the parameters
 * @param f The feature to show
 * @param d The details to show if set on feature
 */
Feature.prototype.set = function(f, d, o) {
	this._feature = f;
	this._details = d;
	this._options = o;
	//this._mapillary = this._mapillaryKeys();
	
	//Temporary hack to display mapillary pictures even if MapillaryJS viewer isn't well integrated
	this._mapillary = [];
	var mk = this._mapillaryKeys();
	for(var i=0; i < mk.length; i++) {
		this._feature.getImages().addMapillaryImage(mk[i]);
	}
};

/**
 * Show next available picture
 */
Feature.prototype._showNextPicture = function() {
	if(this._pictureId != null) {
		this._showPicture(this._pictureId + 1);
	}
};

/**
 * Show previous available picture
 */
Feature.prototype._showPreviousPicture = function() {
	if(this._pictureId != null) {
		this._showPicture(this._pictureId - 1);
	}
};

/**
 * Show the given picture
 * @param id The picture ID
 */
Feature.prototype._showPicture = function(id) {
	//Adjust picture ID to make slideshow infinite
	if(id < 0) {
		this._pictureId = this._feature.getImages().count() + this._mapillary.length - 1;
	}
	else if(id >= this._feature.getImages().count() + this._mapillary.length) {
		this._pictureId = 0;
	}
	else {
		this._pictureId = id;
	}
	
	$(".olu-side-content-feature-picture:visible").hide();
	
	//Show simple image
	if(this._pictureId < this._feature.getImages().count()) {
		$(".olu-side-content-feature-picture:eq("+this._pictureId+")").show();
	}
	//Show mapillary image
	else if(this._mapillary.length > 0) {
		if(this._mapillaryViewer == null) {
			this._mapillaryViewer = new Mapillary.Viewer(
				"olu-side-content-feature-picture-mapillary-viewer",
				this._options.mapillaryClient,
				this._mapillary[0],
				{
					renderMode: Mapillary.RenderMode.Fill
				}
			);
		}
		
		$(".olu-side-content-feature-picture:eq("+this._feature.getImages().count()+")").show();
		this._mapillaryViewer.moveToKey(this._mapillary[this._pictureId - this._feature.getImages().count()]);
	}
};

//OTHER METHODS
/**
 * Creates a detail HTML element
 * @param osmKey The OSM key
 * @param d The detail object
 * @return The HTML element as string
 */
Feature.prototype._detail = function(osmKey, d) {
	var result = "<div class=\"olu-side-content-feature-detail\">"
					+"<div class=\"olu-key\"><img src=\""+this._options.iconFolder+"/icon_"+d.img+".png\" /></div>"
					+"<div class=\"olu-value\">";
	
	var val = this._feature.getTag(osmKey);
	
	switch(d.type) {
		case "link":
			var regexURL = /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/;
			
			//Incomplete link
			if(!val.match(regexURL)) {
				//Missing protocol
				if(val.match(/^[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/)) {
					val = "http://" + val;
				}
			}
			
			if(val.match(regexURL)) {
				result += "<a href=\""+val+"\">"+val+"</a>";
			}
			else {
				result += this.t("features.url.invalid");
			}
			break;
		
		case "email":
			if(val.match(/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/)) {
				result += "<a href=\"mailto:"+val+"\">"+val+"</a>";
			}
			else {
				result += this.t("features.email.invalid");
			}
			break;
		
		case "hours":
			result += "<a href=\"http://projets.pavie.info/yohours/?oh="+encodeURIComponent(val)+"\" target=\"_blank\">"+this.t("features.hours.show")+"</a>";
			break;
		
		case "text_bind":
			result += d.text_bind[val];
			break;
		
		case "text":
		default:
			result += val;
	}
	
	result += "</div></div>";
	
	return result;
};

/**
 * Parse mapillary keys
 * @return Mapillary keys as an array
 */
Feature.prototype._mapillaryKeys = function() {
	var result = [];
	for(var k in this._feature.tags) {
		if(k.indexOf("mapillary") == 0) {
			var mp = this._feature.tags[k].split(';');
			for(var mpid = 0; mpid < mp.length; mpid++) {
				if(mp[mpid].match(/[a-zA-Z0-9_\-]{22}/)) {
					result.push(mp[mpid]);
				}
			}
		}
	}
	return result;
};

/**
 * @return The readable name of a feature
 */
Feature.prototype._displayName = function() {
	if(this._feature.name) {
		//Check for name in browser locale
		var locale = (window.navigator.userLanguage || window.navigator.language || "en").split("-")[0].toLowerCase();
		return (this._feature.tags["name:"+locale]) ? this._feature.tags["name:"+locale] : this._feature.name;
	}
	else {
		return (this._feature.category) ? this._feature.category : this._feature.id;
	}
};

module.exports = Feature;
