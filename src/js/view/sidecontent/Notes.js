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
 * Notes content for side bar
 */
var Notes = function(t) {
//ATTRIBUTES
	this.note = null;
	
	/** The translator function **/
	this.t = t;
};

//ACCESSORS
/**
 * @return The HTML element for this view
 */
Notes.prototype.get = function() {
	var element = $("<div/>");
	
	if(this.note != null) {
		element.append("<h2>"+this.t("notes.id", { id: +this.note.id })+"</h2>");
		
		var list = $("<ul class=\"olu-note-comments\"></ul>");
		var comment;
		for(var i=0; i < this.note.comments.length; i++) {
			comment = this.note.comments[i];
			
			commentDetails = (comment.user) ?
				this.t("notes.comment.user", { user: comment.user, action: this.t("notes.action."+comment.action), date: comment.date })
				: this.t("notes.comment.anon", { action: comment.action, date: comment.date });
			
				list.append("<li><span class=\"olu-comment\">"+comment.text+"</span><span class=\"olu-comment-details\">"+commentDetails+"</span>");
		}
		
		element.append(list);
		element.append("<p class=\"olu-note-footer\"><a href=\"http://www.openstreetmap.org/note/"+this.note.id+"\">"+this.t("data.view.osm")+"</a></p>");
	}
	
	return element;
};

//MODIFIERS
/**
 * The note to show
 */
Notes.prototype.set = function(n) {
	this.note = n;
};


module.exports = Notes;
