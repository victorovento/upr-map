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
 * New note content for side bar
 */
var NewNote = function(t) {
//ATTRIBUTES
	/** The new note service **/
	this._newNote = null;
	
	/** The current level **/
	this._level = null;
	
	/** The new note coordinates **/
	this._coords = null;
	
	/** The success handler **/
	this._success = null;
	
	/** The fail handler **/
	this._fail = null;
	
	/** The translator function **/
	this.t = t;
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
NewNote.prototype.get = function() {
	var element = $("<div/>");
	
	element.append("<h2>"+this.t("notes.add.name")+"</h2>");
	element.append("<p>"+this.t("notes.add.desc")+"<br />"+this.t("notes.add.privacy")+"</p>");
	element.append("<textarea id=\"olu-sidecontent-newnote-textarea\">"+((this._level !== null) ? this.t("map.level.value", { l: this._level })+": " : "")+"</textarea>");
	
	var buttons = $("<div class=\"olu-sidecontent-newnote-buttons\"></div>");
	
	//Send button
	var sendBtnDiv = $("<div class=\"olu-sidecontent-newnote-button\">");
	var sendBtn = $("<button id=\"olu-sidecontent-newnote-send\" class=\"olu-success\" type=\"button\">"+this.t("buttons.add")+"</button>");
	sendBtn.click(this._sendNote.bind(this));
	sendBtnDiv.append(sendBtn);
	buttons.append(sendBtnDiv);
	
	//Cancel button
	var cancelBtnDiv = $("<div class=\"olu-sidecontent-newnote-button\">");
	var cancelBtn = $("<button id=\"olu-sidecontent-newnote-cancel\" class=\"olu-warning\" type=\"button\">"+this.t("buttons.cancel")+"</button>");
	cancelBtnDiv.append(cancelBtn);
	buttons.append(cancelBtnDiv);
	
	element.append(buttons);
	
	return element;
};

//MODIFIERS
/**
 * Define some necessary elements
 * @param service The new note service
 * @param success The success handler
 * @param fail The fail handler
 */
NewNote.prototype.set = function(service, success, fail) {
	this._newNote = service;
	this._success = success;
	this._fail = fail;
};

/**
 * Change the level
 */
NewNote.prototype.setLevel = function(l) {
	var text = $("#olu-sidecontent-newnote-textarea");
	if(text.val() == undefined || text.val().trim().length == 0 || text.val().trim() == this.t("map.level.value", { l: this._level })+":") {
		text.val(this.t("map.level.value", { l: l })+": ");
	}
	
	this._level = l;
};

/**
 * Change the note coordinates
 */
NewNote.prototype.setCoordinates = function(c) {
	this._coords = c;
};

//OTHER METHODS
/**
 * Click handler for send button
 */
NewNote.prototype._sendNote = function() {
	var textVal = $("#olu-sidecontent-newnote-textarea").val();
	
	if(
		this._coords == null
		|| textVal == undefined
		|| textVal.trim().length == 0
		|| textVal.trim() == this.t("map.level.value", { l: this._level })+":"
	) {
		this._fail(new Error("view.sidecontent.NewNote.invalidParameters"));
	}
	else {
		this._newNote.do(this._coords, textVal.trim(), this._success, this._fail);
	}
};


module.exports = NewNote;
