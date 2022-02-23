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

/**
 * A note is a suite of messages alerting OSM contributors about something wrong on map
 */
var Note = function(id, coordinates, date, status) {
//ATTRIBUTES
	/** The OSM Note ID **/
	this.id = id;
	
	/** The note coordinates **/
	this.coordinates = coordinates;
	
	/** The note opening date **/
	this.date = date;
	
	/** The note current status **/
	this.status = status;
	
	/** The note comments **/
	this.comments = [];
};

//MODIFIERS
/**
 * Adds a new comment to this note
 */
Note.prototype.addComment = function(date, uid, user, action, text) {
	uid = (typeof uid === "number") ? uid : (typeof uid === "string" && uid.length > 0) ? parseInt(uid) : null;
	user = (typeof user === "string" && user.length > 0) ? user : null;
	this.comments.push({ date: date, uid: uid, user: user, action: action, text: text });
};

module.exports = Note;
