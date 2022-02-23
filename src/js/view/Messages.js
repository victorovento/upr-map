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

/**
 * Messages view shows alert, warning, error or simple messages over map.
 * Based on https://github.com/tinuzz/leaflet-messagebox and https://github.com/Turbo87/leaflet-sidebar
 */
var Messages = L.Control.extend({
	options: {
		position: 'bottom',
		timeout: 3000
	},
	
	initialize: function(placeholder, options) {
		L.setOptions(this, options);
		
		// Find content container
		var content = this._contentContainer = L.DomUtil.get(placeholder);
		
		// Remove the content container from its original parent
		content.parentNode.removeChild(content);
		
		var l = 'leaflet-';
		
		// Create sidebar container
		var container = this._container =
		L.DomUtil.create('div', l + 'messages ' + l + this.options.position);
		
		// Style and attach content container
		L.DomUtil.addClass(content, l + 'control-olu-messages');
		container.appendChild(content);
	},
	
	addTo: function (map) {
		var container = this._container;
		var content = this._contentContainer;
		
		// Attach sidebar container to controls container
		var controlContainer = map._controlContainer;
		controlContainer.insertBefore(container, controlContainer.firstChild);
		
		this._map = map;
		
		return this;
	},
	
	removeFrom: function (map) {
		//if the control is visible, hide it before removing it.
		this.hide();
		
		var container = this._container;
		var content = this._contentContainer;
		
		// Remove sidebar container from controls container
		var controlContainer = map._controlContainer;
		controlContainer.removeChild(container);
		
		//disassociate the map object
		this._map = null;
		
		return this;
	},
	
	show: function (message, type, timeout) {
		if(this._queue == undefined) { this._queue = []; }
		
		//Add message to queue
		this._queue.push({ msg: message, type: type || null, timeout: timeout || this.options.timeout });
		
		//Start message display if not already
		if(typeof this.timeoutID != 'number') {
			this._display();
		}
	},
	
	_display: function () {
		var container = this._container;
		var content = this._contentContainer;
		
		if(this._queue != undefined && this._queue.length > 0) {
			var msg = this._queue.shift();
			
			content.innerHTML = msg.msg;
			content.style.display = 'block';
			
			L.DomUtil.removeClass(content, "info");
			L.DomUtil.removeClass(content, "warning");
			L.DomUtil.removeClass(content, "error");
			if(msg.type != null) { L.DomUtil.addClass(content, msg.type); }
			
			this.timeoutID = setTimeout(this._display.bind(this), msg.timeout);
		}
		else {
			content.style.display = 'none';
			clearTimeout(this.timeoutID);
			this.timeoutID = null;
		}
	}
});

module.exports = function (placeholder, options) {
	return new Messages(placeholder, options);
};
