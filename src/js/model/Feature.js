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

var FeatureGeometry = require('./FeatureGeometry');
var FeatureImages = require('./FeatureImages');
var util = require('../utils');

/**
 * A feature is a geolocated object with properties, style, geometry, ...
 */
var Feature = function(f) {
//ATTRIBUTES
	/** The human readable name of the object **/
	this.name = null;
	
	/** The human readable category of the object **/
	this.category = null;

	/** The OSM ID (for example "node/123456") **/
	this.id = f.id;
	
	/** The levels in which this object is present **/
	this.onLevels = null;

	/** The OSM object tags **/
	this.tags = f.properties.tags;
	
	/** The feature geometry **/
	this.geometry = new FeatureGeometry(f.geometry);
	
	/** The feature style **/
	this.style = undefined;
	
	/** The parent relations **/
	this._parentRelations = f.properties.relations;
	
	/** The feature images (if any) **/
	this._images = undefined;

//Init
	this._init(f);
};

//CONSTRUCTOR
Feature.prototype._init = function(f) {
	//Find a category
	var potentialTags = [ "amenity", "shop", "craft", "highway", "historic", "landuse", "man_made", "barrier", "office", "public_transport", "tourism" ];
	var i = 0;
	
	while(this.category === null && i < potentialTags.length) {
		if(this.tags[potentialTags[i]]) { this.category = this.tags[potentialTags[i]]; }
		i++;
	}
	
	if(this.category !== null) {
		this.category = (this.category.charAt(0).toUpperCase() + this.category.slice(1)).replace(/_/g, " ");
	}
	
	//Find a name for this object
	if(this.tags.name != undefined) {
		this.name = this.tags.name;
	}
	else if(this.tags.ref != undefined) {
		this.name = this.tags.ref;
	}
	else {
		this.name = this.category;
	}
	
	//Parse levels
	this.onLevels = util.listLevels(this.tags, f.properties.relations);
};

//ACCESSORS
/**
 * @return The OSM ID for editors like iD
 */
Feature.prototype.idForEditor = function() {
	return this.id.charAt(0)+this.id.substring(this.id.indexOf("/")+1);
};

/**
 * @return True if the feature has related images
 */
Feature.prototype.hasImages = function() {
	return this.getImages().hasValidImages();
};

/**
 * @param lvl The level to look for
 * @return True if the feature is present in the given level
 */
Feature.prototype.isOnLevel = function(lvl) {
	return util.contains(this.onLevels, lvl);
};

/**
 * @param key The OSM key
 * @return The corresponding OSM value, or undefined if not found
 */
Feature.prototype.getTag = function(key) {
	return this.tags[key];
};

/**
 * @param key The OSM key
 * @return True if this key is defined in this object
 */
Feature.prototype.hasTag = function(key) {
	return this.getTag(key) != undefined;
};

/**
 * @return The feature images object or null if no available images
 */
Feature.prototype.getImages = function() {
	if(this._images === undefined) {
		this._images = new FeatureImages(this.tags);
	}
	return this._images;
};

/**
 * @return The feature as GeoJSON
 */
Feature.prototype.asGeoJSON = function() {
	return {
		type: "Feature",
		properties: this.tags,
		geometry: { type: this.geometry.type, coordinates: this.geometry.coordinates }
	};
};

//MODIFIERS
/**
 * Create the style for this feature according to given rule set
 * @param rules The rule set
 */
Feature.prototype.computeStyle = function(rules) {
	this.style = rules.getStyles(
		{
			isSubject: function(subject) {
				var osmType = this.id.split("/")[0];
				switch(subject) {
					case "node":
						return osmType == "node" || this.geometry.type == "Point";
					case "area":
						return this.geometry.type == "Polygon" || this.geometry.type == "MultiPolygon";
					case "line":
						return this.geometry.type == "LineString";
					case "way":
						return osmType == "way";
					case "relation":
						return osmType == "relation";
				}
				return false;
			}.bind(this),
			getParentObjects: function() {
				if(this._parentRelations.length == 0) {
					return [];
				}
				else {
					return this._parentRelations.map(function(rel) {
						return {
							tags: rel.reltags,
							isSubject: function(subject) {
								return subject=="relation" || (subject=="area" && rel.reltags.type=="multipolyon");
							},
							getParentObjects: function() {return [];},
						}
					});
				}
			}.bind(this)
		},
		$.extend(
			{ ":tagged": true, ":placeholder": true },
			this.tags
		),
		18
	);
	
	if(this.id == "node/3701335527") {
		console.log(this.style);
	}
};

module.exports = Feature;
