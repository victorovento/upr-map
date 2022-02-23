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
 * Search content for side bar
 */
var Search = function(t) {
//ATTRIBUTES
	/** The search service **/
	this._service = null;
	
	/** The map instance **/
	this._map = null;
	
	/** The translator function **/
	this.t = t;
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
Search.prototype.get = function() {
	var element = $("<div/>");
	element.append("<h2>"+this.t("search.name")+"</h2>");
	
	var searchArea = $("<div class=\"olu-sidecontent-search-area olu-input-field\"></div>");
	var searchText = $("<input type=\"text\" id=\"olu-sidecontent-search-field\" placeholder=\""+this.t("search.ask")+"\" />");
	searchText.keypress(function(e) {
		if(e.which == 13) {
			this._search();
			return false;
		}
	}.bind(this));
	
	var searchButtonContainer = $("<span class=\"olu-btn\"></span>");
	var searchButton = $("<button id=\"olu-sidecontent-search-valid\" class=\"olu-success\" type=\"button\">"+this.t("buttons.search")+"</button>");
	searchButton.click(this._search.bind(this));
	
	searchArea.append(searchText);
	searchButtonContainer.append(searchButton);
	searchArea.append(searchButtonContainer);
	element.append(searchArea);
	
	element.append("<div id=\"olu-sidecontent-search-results\"></div>");
	
	return element;
};

//MODIFIERS
/**
 * Change the search service instance
 */
Search.prototype.set = function(service, map) {
	this._service = service;
	this._map = map;
};

//OTHER METHODS
/**
 * Launch search
 */
Search.prototype._search = function() {
	var search = $("#olu-sidecontent-search-field").val();
	
	if(search != undefined && search.trim().length > 0) {
		this._service.find(
			search.trim(),
			this._show.bind(this),
			this._error.bind(this)
		);
	} else {
		$("#olu-sidecontent-search-results").empty();
	}
};

/**
 * Process search results
 */
Search.prototype._show = function(result) {
	$("#olu-sidecontent-search-results").empty();
	
	if(result.length > 0) {
		var list = $("<ul>");
		
		var r, rDom, f;
		for(var i=0; i < result.length; i++) {
			r = result[i];
			rDom = $("<li><span class=\"olu-result-name\">"+r.name+"</span><span class=\"olu-result-type\">"+r.objectType+"</span></li>");
			
			//TODO Handle levels
			f = (function(bbox) {
				return function() {
					this._map.fitBounds(bbox);
				}.bind(this);
			}.call(this, r.bbox));
			
			rDom.click(f);
			list.append(rDom);
		}
		
		$("#olu-sidecontent-search-results").append(list);
	}
	else {
		$("#olu-sidecontent-search-results").text(this.t("search.results.none"));
	}
};

/**
 * Display error
 */
Search.prototype._error = function(e) {
	$("#olu-sidecontent-search-results").empty();
	$("#olu-sidecontent-search-results").text(this.t("search.error"));
	console.error(e);
};


module.exports = Search;
