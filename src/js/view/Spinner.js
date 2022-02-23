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
 * Spinner shows a loading message.
 * Based on Messages class.
 */
var Spinner = L.Control.extend({
	options: {
		position: 'top'
	},
	
	messages: [],
	
	initialize: function(placeholder, options) {
		L.setOptions(this, options);
		
		// Find content container
		var content = this._contentContainer = L.DomUtil.get(placeholder);
		
		// Remove the content container from its original parent
		content.parentNode.removeChild(content);
		
		var l = 'leaflet-';
		
		// Create sidebar container
		var container = this._container =
		L.DomUtil.create('div', l + 'spinner ' + l + this.options.position);
		
		// Style and attach content container
		L.DomUtil.addClass(content, l + 'control-olu-spinner');
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
	
	show: function (text, classes) {
		classes = classes || "";
		this.messages.push({ text: text, classes: classes });
		
		if(this.messages.length == 1) {
			this._display();
		}
	},
	
	_display: function() {
		var container = this._container;
		var content = this._contentContainer;
		var msg = this.messages[0];
		content.className = ("leaflet-control-olu-spinner "+msg.classes).trim();
		content.innerHTML = msg.text;
		content.style.display = 'block';
	},
	
	hide: function () {
		this.messages.shift();
		
		if(this.messages.length > 0) {
			this._display();
		}
		else {
			var container = this._container;
			var content = this._contentContainer;
			
			content.style.display = 'none';
			clearTimeout(this.timeoutID);
			this.timeoutID = null;
		}
	}
});

module.exports = function (placeholder, options) {
	return new Spinner(placeholder, options);
};
