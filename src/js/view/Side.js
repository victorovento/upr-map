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
var sb = require('leaflet-sidebar');
var $ = require('jquery');
var SideContentSearch = require('./sidecontent/Search');
var SideContentRouting = require('./sidecontent/Routing');
var SideContentNotes = require('./sidecontent/Notes');
var SideContentNewNote = require('./sidecontent/NewNote');
var SideContentParameters = require('./sidecontent/Parameters');
var SideContentHelp = require('./sidecontent/Help');
var SideContentFeature = require('./sidecontent/Feature');
var SideContentLayers = require('./sidecontent/Layers');

/**
 * Side is a side panel which shows several contents (configuration, search results, ...)
 */
var Side = L.Control.Sidebar.extend({
//ATTRIBUTES
	halfsize: [ "search", "routing", "notes", "newnote", "feature" ],

//OTHER METHODS
	initialize: function(placeholder, options) {
		L.Control.Sidebar.prototype.initialize.call(this, placeholder, options);
		
		if(options.t) { this.t = options.t; }
		
		this.contents = {
			search: new SideContentSearch(this.t),
			routing: new SideContentRouting(),
			notes: new SideContentNotes(this.t),
			newnote: new SideContentNewNote(this.t),
			parameters: new SideContentParameters(),
			help: new SideContentHelp(),
			feature: new SideContentFeature(this.t),
			layers: new SideContentLayers(this.t)
		};
		
		//Create each side content
		for(var c in this.contents) {
			L.DomUtil.create("div", "olu-side-content olu-side-content-"+c, this.getContainer())
		}
		
		$(".olu-side-content").hide();
	},
	
	show: function(content) {
		if(L.Control.Sidebar.prototype.isVisible.call(this) && $(".olu-side-content-"+content).is(":visible") && content != "feature") {
			this.hide();
		}
		else {
			L.Control.Sidebar.prototype.show.call(this);
			
			//Update content
			$(".olu-side-content-"+content).empty();
			$(".olu-side-content-"+content).append(this.contents[content].get());
			
			//Change visibility
			$(".olu-side-content:not(.olu-side-content-"+content+")").hide();
			$(".olu-side-content-"+content).show();
			
			//Half height on mobile devices
			if(this.halfsize.indexOf(content) >= 0) {
				$(this.getContainer()).parent().addClass("halfsize");
			}
			else {
				$(this.getContainer()).parent().removeClass("halfsize");
			}
			
			//Event handlers for specific cases
			if(content == "newnote") {
				$("#olu-sidecontent-newnote-cancel").click(function() {
					this.hide();
				}.bind(this));
			}
			
			//Trigger event
			$(this._contentContainer).trigger("sidecontentopened", [ content ]);
		}
	},
	
	hide: function() {
		$(this._contentContainer).trigger("sidecontentclosed");
		L.Control.Sidebar.prototype.hide.call(this);
	},
	
	on: function(event, handler) {
		$(this._contentContainer).on(event, handler);
	}
});

module.exports = function (placeholder, options) {
	return new Side(placeholder, options);
};
