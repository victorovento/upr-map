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
 * Layers content for side bar
 */
var Layers = function(t) {
//ATTRIBUTES
	/** The map **/
	this._map = null;
	
	/** The base layers **/
	this._bases = null;
	
	/** The current base layer **/
	this._currentBase = 0;
	
	/** The bases map to get base name from ID **/
	this._basesId = [];
	
	/** The map styles **/
	this._styles = null;
	
	/** The current style **/
	this._currentStyle = 0;
	
	/** The map coordinates **/
	this._coords = { lat: 48.12114, lng: -1.71129, zoom: 18 };
	
	/** The translator function **/
	this.t = t;
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
Layers.prototype.get = function() {
	var img, url, fStyle, fBase, bid;
	var element = $("<div/>");
	
	if(this._styles) {
		element.append("<h2>"+this.t("map.layers.name")+"</h2>");
		var styles = $("<div id=\"olu-side-content-layers-styles\"></div>");
		
		//Read each meta style
		for(var s=0; s < this._styles.length; s++) {
			var mcssStyle = this._styles[s].getStyles(
				{
					isSubject: function(subject) { return subject == "meta"; },
					getParentObjects: function() { return []; }
				},
				{},
				18
			);
			
			//If meta style properly defined, add button
			if(mcssStyle && mcssStyle.metaStyles && mcssStyle.metaStyles.default && mcssStyle.metaStyles.default.title) {
				img = (mcssStyle.pointStyles && mcssStyle.pointStyles.default && mcssStyle.pointStyles.default.icon_image) ?
								/url\(\'(.+)\'\)/.exec(mcssStyle.pointStyles.default.icon_image)[1]
								: "favicon.png";
				
				//Click handler
				fStyle = (function(style) {
					return function() {
						$(".olu-side-content-layers-button.style.selected").removeClass("selected");
						$("#olu-side-content-layers-style-"+style).addClass("selected");
						this._currentStyle = style;
						this._map.fire("stylechanged", { style: style });
					}.bind(this);
				}).call(this, s);

				styles.append($("<div id=\"olu-side-content-layers-style-"+s+"\" class=\"olu-side-content-layers-button style"+((this._currentStyle == s) ? " selected" : "")+"\"><img src=\"img/"+img+"\" /> "+mcssStyle.metaStyles.default.title.replace(/\'/g, "")+"</div>").click(fStyle));
			}
		}
		
		element.append(styles);
	}
	
	if(this._bases) {
		element.append("<h2>"+this.t("map.layers.background")+"</h2>");
		var bases = $("<div id=\"olu-side-content-layers-bases\"></div>");
		this._basesId = [];
		
		for(var b in this._bases) {
			bid = this._basesId.length;
			this._basesId.push(b);
			
			url = this._bases[b].options.URL
						.replace(/\{s\}/, this._bases[b].options.subdomains[0])
						.replace(/\{z\}/, this._coords.zoom)
						.replace(/\{x\}/, parseInt(Math.floor((this._coords.lng + 180) / 360 * (1<<this._coords.zoom))))
						.replace(/\{y\}/, parseInt(Math.floor( (1 - Math.log(Math.tan(this._coords.lat.toRad()) + 1 / Math.cos(this._coords.lat.toRad())) / Math.PI) / 2 * (1<<this._coords.zoom) )));
			
			//Click handler
			fBase = (function(base, bid) {
				return function() {
					$(".olu-side-content-layers-button.base.selected").removeClass("selected");
					$("#olu-side-content-layers-base-"+bid).addClass("selected");
					this._currentBase = base;
					this._map.fire("basechanged", { base: base });
				}.bind(this);
			}).call(this, b, bid);
			
			var bdiv = $("<div id=\"olu-side-content-layers-base-"+bid+"\" class=\"olu-side-content-layers-button base"+((this._currentBase == b) ? " selected" : "")+"\"></div>");
			var bimg = $("<img src=\""+url+"\" />");
			var blbl = $("<span>"+b+"</span>");
			blbl.click(fBase);
			bimg.click(fBase);
			
			bdiv.append(bimg);
			bdiv.append(blbl);
			bases.append(bdiv);
		}
		
		element.append(bases);
	}
	
	return element;
};

//MODIFIERS
/**
 * Change the layers
 */
Layers.prototype.set = function(map, baselayers, mapstyles, currentBase, currentStyle) {
	this._map = map;
	this._bases = baselayers;
	this._styles = mapstyles;
	this._currentBase = currentBase
	this._currentStyle = currentStyle;
};

/**
 * Change the coordinates
 */
Layers.prototype.setCoordinates = function(lat, lng, zoom) {
	this._coords = { lat: lat, lng: lng, zoom: Math.min(zoom, 18) };
};


module.exports = Layers;
