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

var PriorityQueue = require("js-priority-queue");
var HashMap = require("hashmap");
var L = require("leaflet");
var Node = require('./Node');
var util = require("../utils");

/**
 * Graph class
 * Creates the graph for the given OSM Data, and allows to search shortest path in it
 */
var Graph = function() {
//ATTRIBUTES
	/** The graph **/
	this._graph = null;
};

//CONSTRUCTORS
/**
 * Initializes the graph from OSM data
 * @param data The raw OSM data in JSON
 * @param avoidTransitions The transitions to avoid, as a string array
 */
Graph.prototype.createFromOSMData = function(data, avoidTransitions) {
	var nodes = {};
	avoidTransitions = avoidTransitions || [];
	var avoidElevator = util.contains(avoidTransitions, "elevator");
	
	//Parse nodes
	var currentElement = null, isElevator, type;
	for(var i=0, l=data.length; i < l; i++) {
		currentElement = data[i];
		
		if(currentElement.type == "node" && nodes[currentElement.id] == undefined) {
			type = (this._isEntrance(currentElement.tags)) ? "door" : null;
			nodes[currentElement.id] = { default: new Node(L.latLng(currentElement.lat, currentElement.lon), null, currentElement.id, type) };
			
			var levels = util.listLevels(currentElement.tags);
			if(currentElement.tags != undefined && levels.length > 0) {
				isElevator = this._isElevator(currentElement.tags);
				
				for(var j=0; j < levels.length; j++) {
					nodes[currentElement.id][levels[j]] = new Node(nodes[currentElement.id].default.coordinates, levels[j], currentElement.id, type);
					if(isElevator && !avoidElevator && j > 0) {
						nodes[currentElement.id][levels[j]].addNeighbour(
							nodes[currentElement.id][levels[j-1]],
							util.distanceLevels(
								nodes[currentElement.id][levels[j]].coordinates,
								levels[j],
								nodes[currentElement.id][levels[j-1]].coordinates,
								levels[j-1]),
							"elevator"
						);
						nodes[currentElement.id][levels[j-1]].addNeighbour(
							nodes[currentElement.id][levels[j]],
							util.distanceLevels(
								nodes[currentElement.id][levels[j]].coordinates,
								levels[j],
								nodes[currentElement.id][levels[j-1]].coordinates,
								levels[j-1]),
							"elevator"
						);
					}
				}
			}
		}
	}
	
	//Parse ways
	var nodeId, node, nodePrevId, direction, transition, levels, level, levelPrev = null;
	for(var i=0, l=data.length; i < l; i++) {
		currentElement = data[i];
		
		if(this._isAccessible(currentElement.tags)) {
			//Elevators as areas
			if(currentElement.type == "way" && this._isElevator(currentElement.tags) && !avoidElevator) {
				//Check levels
				levels = util.listLevels(currentElement.tags);
				elevatorEntries = {}; //TODO Handle multiple entries for a given level
				
				if(levels.length > 0) {
					//Read each node
					for(var j=0, lj=currentElement.nodes.length; j < lj; j++) {
						nodeId = currentElement.nodes[j];
						
						//If levels were read on node
						if(nodes[nodeId].default.type == "door" && Object.keys(nodes[nodeId]).length > 1) {
							//Read each level
							for(var k in nodes[nodeId]) {
								if(k != "default" && util.contains(levels, parseFloat(k))) {
									elevatorEntries[k] = nodes[nodeId][k];
								}
							}
						}
					}
					
					//Link elevator entries nodes
					var prevEntry = null, currentEntry = null;
					var sortedLevels = Object.keys(elevatorEntries);
					sortedLevels.sort(util.sortNumberArray);
					
					for(var j=0, lj=sortedLevels.length; j < lj; j++) {
						currentEntry = elevatorEntries[sortedLevels[j]];
						
						if(prevEntry != null) {
							currentEntry.addNeighbour(
								prevEntry,
								util.distanceLevels(
									prevEntry.coordinates,
									prevEntry.level,
									currentEntry.coordinates,
									currentEntry.level
								),
								"elevator"
							);
							prevEntry.addNeighbour(
								currentEntry,
								util.distanceLevels(
									prevEntry.coordinates,
									prevEntry.level,
									currentEntry.coordinates,
									currentEntry.level
								),
								"elevator"
							);
						}
						
						prevEntry = currentEntry;
					}
				}
			}
			
			//Walkable paths
			else if(currentElement.type == "way" && this._isWalkable(currentElement.tags)) {
				//Check transition
				transition = this._transition(currentElement.tags);
				
				if(transition == null || !util.contains(avoidTransitions, transition)) {
					//Direction of way
					direction = this._direction(currentElement.tags);
					levelPrev = null;
					nodePrevId = null;
					levels = util.listLevels(currentElement.tags);
					
					//Read each node
					for(var j=0, lj=currentElement.nodes.length; j < lj; j++) {
						nodeId = currentElement.nodes[j];
						
						//Check level on node
						if(levels.length > 0) {
							//Find node to use
							if(levels.length == 0) {
								node = null;
								level = null;
							}
							else if(levels.length == 1) {
								level = levels[0];
								//Create node on current level
								if(!isNaN(level) && nodes[nodeId][level] == undefined) {
									nodes[nodeId][level] = new Node(nodes[nodeId].default.coordinates, level, nodes[nodeId].default.name);
								}
							}
							//Transition ways with several intermediate nodes
							else if(levels.length == 2 && transition != null && j > 0 && j < lj-1) {
								level = (levels[0] + levels[1]) / 2;
								//Create node on intermediate level
								if(!isNaN(level) && nodes[nodeId][level] == undefined) {
									nodes[nodeId][level] = new Node(nodes[nodeId].default.coordinates, level, nodes[nodeId].default.name);
								}
							}
							else {
								//Search which node is available
								node = null;
								level = null;

								for(var lvl in nodes[nodeId]) {
									if(lvl != "default" && util.contains(levels, util.filterFloat(lvl))) {
										node = nodes[nodeId][lvl];
										level = lvl;
									}
								}
							}
							
							//Link node to previous one
							if(j > 0 && nodes[nodeId][level] != undefined) {
								if(levelPrev != null && nodes[nodePrevId][levelPrev] != undefined) {
									//Forward link
									if(direction >= 0) {
										nodes[nodePrevId][levelPrev].addNeighbour(
											nodes[nodeId][level],
											util.distanceLevels(
												nodes[nodePrevId][levelPrev].coordinates,
												nodes[nodePrevId][levelPrev].level,
												nodes[nodeId][level].coordinates,
												nodes[nodeId][level].level
											),
											transition
										);
									}
									
									//Backward link
									if(direction <= 0) {
										nodes[nodeId][level].addNeighbour(
											nodes[nodePrevId][levelPrev],
											util.distanceLevels(
												nodes[nodePrevId][levelPrev].coordinates,
												nodes[nodePrevId][levelPrev].level,
												nodes[nodeId][level].coordinates,
												nodes[nodeId][level].level
											),
											transition
										);
									}
								}
							}
							
							if(level != null) {
								levelPrev = level;
								nodePrevId = nodeId;
							}
						}
					}
				}
			}
		}
	}
	
	//Store final graph
	this._graph = [];
	for(var i in nodes) {
		for(var j in nodes[i]) {
			if(j != "default" && nodes[i][j].neighbours.length > 0) {
				this._graph.push(nodes[i][j]);
			}
		}
	}
};

/**
 * @return True if the object can be walked on
 */
Graph.prototype._isWalkable = function(tags) {
	return tags != null && tags.highway != undefined && tags.area == undefined;
};

/**
 * @return True if the object is an entrance
 */
Graph.prototype._isEntrance = function(tags) {
	return tags != null && (tags.entrance != undefined || tags.door != undefined);
};

/**
 * @return True if the object is an elevator
 */
Graph.prototype._isElevator = function(tags) {
	return tags != null && (tags.highway == "elevator" || tags.highway == "lift" || tags["buildingpart:verticalpassage"] == "elevator" || tags.indoor == "elevator");
};

/**
 * @return True if the object can be accessed by everyone
 */
Graph.prototype._isAccessible = function(tags) {
	return tags != null && (tags.access == undefined || tags.access == "yes" || tags.access == "permissive" || tags.access == "destination" || tags.access == "customers");
};

/**
 * @return 0 if not oneway, 1 if oneway in the direction of the way, -1 if oneway in the opposite direction
 */
Graph.prototype._direction = function(tags) {
	if(tags == null) { return 0; }
	if(tags.oneway != undefined) {
		switch(tags.oneway) {
			case "yes":
				return 1;
			case "-1":
				return -1;
			default:
				return 0;
		}
	}
	else if(tags.conveying != undefined) {
		switch(tags.conveying) {
			case "forward":
				return 1;
			case "backward":
				return -1;
			default:
				return 0;
		}
	}
	else {
		return 0;
	}
};

/**
 * @return The kind of transition (elevator, escalator, stairs, null)
 */
Graph.prototype._transition = function(tags) {
	//Elevator
	if(tags.highway == "elevator" || tags["buildingpart:verticalpassage"] == "elevator" || tags.indoor == "elevator") { return "elevator"; }
	//Escalator
	if((tags.conveying != null && tags.conveying != "no") || tags["buildingpart:verticalpassage"] == "escalator" || tags.room == "escalator") { return "escalator"; }
	//Stairs
	if(tags.highway == "steps" || tags["buildingpart:verticalpassage"] == "stairway" || tags.room == "stairs" || tags.stairs == "yes") { return "stairs"; }
	//Default
	return null;
};

/**
 * Initializes the graph from given nodes
 */
Graph.prototype.createFromNodes = function(nodes) {
	this._graph = nodes;
};

//OTHER METHODS
/**
 * Finds the shortest path in the graph
 * @param startPt The start coordinates
 * @param startLvl The start level
 * @param endPt The end coordinates
 * @param endLvl The end level
 * @return The path to follow (as an array of nodes)
 */
Graph.prototype.findShortestPath = function(startPt, startLvl, endPt, endLvl) {
	//Find start and end nodes near given coordinates
	var start = this._findNearestNode(startPt, startLvl);
	if(start == null) { throw Error("No start node found"); }
	
	var end = this._findNearestNode(endPt, endLvl);
	if(end == null) { throw Error("No end node found"); }
	
	return this._process(start, end);
};

/**
 * Finds the nearest node in graph from given coordinates at given level
 * @param coords The coordinates
 * @param lvl The level
 * @return The nearest node in graph, or null if no one found
 */
Graph.prototype._findNearestNode = function(coords, lvl) {
	var minDistNode = null;
	var minDist = null;
	var current = null;
	var currentDist = null;
	
	for(var i=0, l=this._graph.length; i < l; i++) {
		current = this._graph[i];
		if(current.level == lvl) {
			currentDist = current.coordinates.distanceTo(coords);
			if(minDist == null || minDist > currentDist) {
				minDist = currentDist;
				minDistNode = current;
			}
		}
	}
	
	return minDistNode;
};

/**
 * The algorithm of A*
 * @param start The start node
 * @param end The end node
 * @return The path to follow (as an array of nodes)
 */
Graph.prototype._process = function(start, end) {
	//Init A*
	var frontier = new PriorityQueue({ comparator: function(a, b) { return a.priority - b.priority } });
	var cameFrom = new HashMap();
	var costSoFar = new HashMap();
	var current = null, neighbors = null, next = null, newCost = null, priority = null;
	
	//Add start node
	frontier.queue({ node: start, priority: 0 });
	cameFrom.set(start, null);
	costSoFar.set(start, 0);
	
	//Find path
	while(frontier.length > 0) {
		current = frontier.dequeue().node;
		
		//Stop if current node is the final one
		if(current.equals(end)) { break; }
		
		//Look for current node's neighbors
		neighbors = current.neighbours;
		for(var i=0, l=neighbors.length; i < l; i++) {
			next = neighbors[i];
			newCost = costSoFar.get(current) + current.getCost(next);
			if(!costSoFar.has(next) || newCost < costSoFar.get(next)) {
				costSoFar.set(next, newCost);
				priority = newCost + this._heuristic(end, next);
				frontier.queue({ node: next, priority: priority });
				cameFrom.set(next, current);
			}
		}
	}
	
	//Reconstruct path
	current = end;
	var path = [ current ];
	
	if(!cameFrom.has(end)) {
		throw Error("No route found");
	}
	
	while(!current.equals(start)) {
		current = cameFrom.get(current);
		path.push(current);
	}
	path.reverse();
	
	return path;
};

/**
 * The fly-distance between two nodes in graph
 * @param n1 The first node
 * @param n2 The second node
 * @return The fly-distance
 */
Graph.prototype._heuristic = function(n1, n2) {
	return Math.sqrt(Math.pow(n1.coordinates.distanceTo(n2.coordinates), 2) + Math.pow(Math.abs(n1.level - n2.level)*2.5, 2));
};

module.exports = Graph;
