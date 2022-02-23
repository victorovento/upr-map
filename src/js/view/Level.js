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
var $ = require('jquery');
var util = require("../utils");

/**
 * Level selector
 */
var Level = L.Control.extend({
//ATTRIBUTES
	options: {
		position: 'topright',
		levels: [ 0 ],
		visibleButtons: 5,
		scrollSpeed: 50
	},

	level: 0,
	scrolled: 0,
	_canScroll: false,

//CONSTRUCTOR
	initialize: function (options) {
		L.Util.setOptions(this, options);
	},

//MODIFIERS
	setAvailable: function(levels) {
		this.options.levels = levels;
		$(this.container).empty();
		this._initContainer();
		this.setCurrent(this.level, false);
	},

	setCurrent: function(l, b) {
		b = (b === undefined) ? true : b;
		var previousLevel = this.level;
		var btnHeight = $(".olu-level-control-button:first").height();
		this.level = l;
		
		//Fire event
		if(b) {
			this.map.fire("levelchanged", { level: l, previous: previousLevel });
		}
		
		//Update buttons
		$(".olu-level-control-button-lvl-current").removeClass("olu-level-control-button-lvl-current");
		$(".olu-level-control-button-lvl"+this.options.levels.indexOf(l)).addClass("olu-level-control-button-lvl-current");
		
		//Set scroll in order to see level if not already visible
		var levelScroll = (this.options.levels.length - 1 - this.options.levels.indexOf(l)) * btnHeight;
		this.scrolled = levelScroll;
		
		if($(".olu-level-control-levels").scrollTop() > levelScroll || levelScroll > $(".olu-level-control-levels").scrollTop() + (this.options.visibleButtons -0.5) * btnHeight) {
			$(".olu-level-control-levels").animate(
				{
					scrollTop: levelScroll
				},
				0,
				null,
				this._checkButtons.bind(this)
			);
		}
	},

//OTHER METHODS
	onAdd: function (map) {
		this.map = map;
		
		this.container = L.DomUtil.create('div', 'olu-level-control-container leaflet-control leaflet-bar');
		this._initContainer();
		L.DomEvent.disableClickPropagation(this.container);
		return this.container;
	},

	onRemove: function (map) {
		this.map = null;
	},
	
	_scroll: function(direction, action) {
		action = (action == "start" || action == "continue" || action == "stop") ? action : undefined;
		
		if(
			(direction == "up" && !$(".olu-level-control-scroll-up").hasClass("leaflet-disabled"))
			|| (direction == "down" && !$(".olu-level-control-scroll-down").hasClass("leaflet-disabled"))
		) {
			//console.log(direction+" "+action);
			if(action == "start" || (action == "continue" && this._canScroll) || action == undefined) {
				var scrollAmount = (action == "start" || action == "continue") ? 10 : $(".olu-level-control-button:first").height() * 3;
				
				if(action == "start") {
					this._canScroll = true;
				}
				if(action == "start" || action == undefined) {
					this.scrolled = $(".olu-level-control-levels").scrollTop();
				}
				
				//Set scroll value
				this.scrolled = (direction == "up") ? this.scrolled - scrollAmount : this.scrolled + scrollAmount;
				if(this.scrolled < 0) { this.scrolled = 0; }
				else if(this.scrolled > $(".olu-level-control-levels")[0].scrollHeight) { this.scrolled = $(".olu-level-control-levels")[0].scrollHeight; }
				
				//Go to scroll
				$(".olu-level-control-levels").animate(
					{
						scrollTop: this.scrolled
					},
					this.options.scrollSpeed,
					"linear",
					(action != undefined) ? this._scroll.bind(this, direction, "continue") : null
				);
				
				this._checkButtons();
			}
			else if(action == "stop" || action == undefined) {
				this._canScroll = false;
			}
		}
	},
	
	_initContainer: function() {
		var btnOverflow = this.options.levels.length > this.options.visibleButtons;
		
		//If too many levels
		if(btnOverflow) {
			$(this.container).addClass("olu-level-control-container-full");
			var btnUp = this._createButton("↑", this.options.t("map.level.up.desc"), 'olu-level-control-scroll-up', this.container, this._scroll.bind(this, "up"));
			if(!util.isMobileBrowser()) {
				L.DomEvent.on(btnUp, 'mouseover', this._scroll.bind(this, "up", "start"));
				L.DomEvent.on(btnUp, 'mouseout', this._scroll.bind(this, "up", "stop"));
			}
			
			//Levels
			var levelsButtonsHeight = $(".olu-level-control-scroll-up:first").height() * ((btnOverflow) ? this.options.visibleButtons : this.options.levels.length);
			
			var levelsContainer = L.DomUtil.create('div', 'olu-level-control-levels', this.container);
			$(levelsContainer).css('height', levelsButtonsHeight);
			$(levelsContainer).css('line-height', levelsButtonsHeight);
			
			this._createLevels(levelsContainer);
			
			var btnDown = this._createButton("↓", this.options.t("map.level.down.desc"), 'olu-level-control-scroll-down', this.container, this._scroll.bind(this, "down"));
			if(!util.isMobileBrowser()) {
				L.DomEvent.on(btnDown, 'mouseover', this._scroll.bind(this, "down", "start"));
				L.DomEvent.on(btnDown, 'mouseout', this._scroll.bind(this, "down", "stop"));
			}
		}
		else {
			this._createLevels(this.container);
		}
	},
	
	_createLevels: function(container) {
		var lvl;
		for(var i=this.options.levels.length-1; i>=0; i--) {
			lvl = this.options.levels[i];
			
			this._createButton(
				lvl,
				"Level "+lvl,
				'olu-level-control-button olu-level-control-button-lvl'+i+((lvl == this.level) ? ' olu-level-control-button-lvl-current' : ''),
				container,
				this.setCurrent.bind(this, lvl, true)
			);
		}
	},
	
	_createButton: function (html, title, className, container, fn) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;
		
		L.DomEvent
			.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.stop)
			.on(link, 'click', fn, this)
			.on(link, 'click', this._refocusOnMap, this);
		
		return link;
	},
	
	_checkButtons: function() {
		//Enabled/disable buttons
		if(this.scrolled == 0) {
			$(".olu-level-control-scroll-up").addClass("leaflet-disabled");
		}
		else if($(".olu-level-control-scroll-up").hasClass("leaflet-disabled")) {
			$(".olu-level-control-scroll-up").removeClass("leaflet-disabled");
		}
		
		if(this.scrolled + this.options.visibleButtons * $(".olu-level-control-button:first").height() >= $(".olu-level-control-levels")[0].scrollHeight) {
			$(".olu-level-control-scroll-down").addClass("leaflet-disabled");
		}
		else if($(".olu-level-control-scroll-down").hasClass("leaflet-disabled")) {
			$(".olu-level-control-scroll-down").removeClass("leaflet-disabled");
		}
	}
});

module.exports = function(options) {
	return new Level(options);
};
