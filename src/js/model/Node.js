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
 * A node is the main component of a graph
 * Transition between nodes have a cost
 * As the graph is oriented, you should set neighbours on two concerned nodes to make the link bidirectionnal.
 */
var Node = function(latlng, level, name, type) {
//ATTRIBUTES
	/** The coordinates of the node **/
	this.coordinates = latlng;
	
	/** The level where the node can be found **/
	this.level = level;
	
	/** The name of the node **/
	this.name = name || null;
	
	/** The type of node (default = null, door) **/
	this.type = type || null;
	
	/** The neighbours of the node **/
	this.neighbours = [];
	
	/** The kind of transition between this node and neighbours (null = flat, stairs, escalator, elevator) **/
	this._transitions = [];
	
	/** The costs to go to a neighbour **/
	this._costs = [];
};

//ACCESSORS
/**
 * @return The cost to travel to the given node
 */
Node.prototype.getCost = function(n) {
	var id = this.neighbours.indexOf(n);
	return this._costs[id];
};

/**
 * @return The kind of transition between this node and the given one
 */
Node.prototype.getTransition = function(n) {
	var id = this.neighbours.indexOf(n);
	return this._transitions[id];
};

/**
 * @return True if the given node is the same as the current one
 */
Node.prototype.equals = function(n) {
	if(this === n) { return true; }
	if(this.level != n.level) return false;
	if(this.type != n.type) return false;
	if(!this.coordinates.equals(n.coordinates)) return false;
	if(this.neighbours.length != n.neighbours.length) return false;
	return true;
};

//MODIFIERS
/**
 * Add a neighbour to this node
 * @param n The node to add
 * @param w The cost to go from this node to the given one
 * @param t The kind of transition (stairs, elevator, escalator, or null if flat)
 */
Node.prototype.addNeighbour = function(n, w, t) {
	this.neighbours.push(n);
	this._costs.push(w);
	this._transitions.push(t || null);
};

module.exports = Node;
