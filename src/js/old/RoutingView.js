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
 * The routing view
 */
OLU.view.RoutingView = function(main) {
//ATTRIBUTES
	/** The main view **/
	this._mainView = main;

//CONSTRUCTOR
	//Markers buttons
	$("#rtg-marker-start").click(this.addStartMarker.bind(this));
	$("#rtg-marker-end").click(this.addEndMarker.bind(this));
	
	//Level selectors for markers
	$("#routing-start-level").change(this.startLevelChanged.bind(this));
	$("#routing-end-level").change(this.endLevelChanged.bind(this));
	
	//Disable level selectors
	$("#routing-start-level").prop("disabled", true);
	$("#routing-end-level").prop("disabled", true);
	
	//Disable buttons
	$("#routing-start-delete").prop("disabled", true);
	$("#routing-end-delete").prop("disabled", true);
	$("#routing-valid").prop("disabled", true);
	
	//Delete buttons events
	$("#routing-start-delete").click(this.removeStartMarker.bind(this));
	$("#routing-end-delete").click(this.removeEndMarker.bind(this));
	
	//Set marker labels to default
	this.updateLabel("start", null);
	this.updateLabel("end", null);
	
	//Define routing modes
	var modeOptions = '';
	for(var mode in OLU.CONFIG.routing) {
		modeOptions += '<option value="'+ mode + '" class="i18n routingmode.'+mode+'">' + this._mainView.getTranslation("routingmode", mode) + '</option>';
	}
	$("#routing-mode").html(modeOptions);
	
	//Add draggable markers
	var markerStart = new OLU.view.DraggableMarkerView(this._mainView, "start", "#rtg-marker-start");
	var markerEnd = new OLU.view.DraggableMarkerView(this._mainView, "end", "#rtg-marker-end");
	
	//Add valid button handler
	$("#routing-valid").click(this.validClicked.bind(this));
};

//ACCESSORS
	/**
	 * @return The start level
	 */
	OLU.view.RoutingView.prototype.getStartLevel = function() {
		var lvl = $("#routing-start-level").val();
		return (lvl == "null") ? null : parseFloat(lvl);
	};
	
	/**
	 * @return The end level
	 */
	OLU.view.RoutingView.prototype.getEndLevel = function() {
		var lvl = $("#routing-end-level").val();
		return (lvl == "null") ? null : parseFloat(lvl);
	};

//MODIFIERS
	/**
	* Shows the button
	*/
	OLU.view.RoutingView.prototype.showButton = function() {
		$("#sidebar-tab-routing").removeClass("disabled");
	};

	/**
	* Hides the button
	*/
	OLU.view.RoutingView.prototype.hideButton = function() {
		$("#sidebar-tab-routing").addClass("disabled");
	};

	/**
	 * Updates the label next to marker
	 * @param type The kind of marker (start or end)
	 * @param coords The marker coordinates, or null if disabled
	 */
	OLU.view.RoutingView.prototype.updateLabel = function(type, coords) {
		var obj = $("#routing-"+type);
		if(coords == null) {
			obj.html(this._mainView.getTranslation("routing", "clickmarker"));
		}
		else {
			obj.html(coords.lat.toFixed(6)+", "+coords.lng.toFixed(6));
		}
	};
	
	/**
	 * Adds a marker on map
	 * @param type Start or end
	 * @param coords The marker coords
	 */
	OLU.view.RoutingView.prototype.addMarker = function(type, coords) {
		if(type == "start") { this.addStartMarker(coords); }
		else if(type == "end") { this.addEndMarker(coords); }
	};
	
	/**
	 * Adds the start marker on map
	 */
	OLU.view.RoutingView.prototype.addStartMarker = function(coords) {
		coords = coords || null;
		$("#routing-start-level option[value=\""+this._mainView.getLevelView().get()+"\"]").attr("selected", "selected");
		this._mainView.getMapView().addRoutingMarker("start", coords);
		$("#routing-start-level").prop("disabled", false);
		$("#routing-start-delete").prop("disabled", false);
		this._updateValidButton();
	};
	
	/**
	 * Adds the end marker on map
	 */
	OLU.view.RoutingView.prototype.addEndMarker = function(coords) {
		coords = coords || null;
		$("#routing-end-level option[value=\""+this._mainView.getLevelView().get()+"\"]").attr("selected", "selected");
		this._mainView.getMapView().addRoutingMarker("end", coords);
		$("#routing-end-level").prop("disabled", false);
		$("#routing-end-delete").prop("disabled", false);
		this._updateValidButton();
	};
	
	/**
	 * Removes the start marker on map
	 */
	OLU.view.RoutingView.prototype.removeStartMarker = function() {
		this.showRoute(null);
		this._mainView.getMapView().removeRoutingMarker("start");
		$("#routing-start-level").prop("disabled", true);
		$("#routing-start-delete").prop("disabled", true);
		this._updateValidButton();
	};
	
	/**
	 * Removes the end marker on map
	 */
	OLU.view.RoutingView.prototype.removeEndMarker = function() {
		this.showRoute(null);
		this._mainView.getMapView().removeRoutingMarker("end");
		$("#routing-end-level").prop("disabled", true);
		$("#routing-end-delete").prop("disabled", true);
		this._updateValidButton();
	};
	
	/**
	 * Changes the state of valid button according to markers state
	 */
	OLU.view.RoutingView.prototype._updateValidButton = function() {
		if($("#routing-end-level").prop("disabled") || $("#routing-start-level").prop("disabled")) {
			$("#routing-valid").prop("disabled", true);
		}
		else {
			$("#routing-valid").prop("disabled", false);
		}
	};
	
	/**
	 * Updates levels values in selectors
	 */
	OLU.view.RoutingView.prototype.updateLevels = function() {
		var selectStart = $("#routing-start-level");
		var selectEnd = $("#routing-end-level");
		
		var levels = this._mainView.getData().getLevels();
		var option = '';

		//Create options list
		for(var i=0; i < levels.length; i++) {
			var lvl = levels[i];
			option += '<option value="'+ lvl + '">' + lvl + '</option>';
		}
		
		//Keep old values
		var oldStartLvl = selectStart.val();
		var oldEndLvl = selectEnd.val();
		
		//Update levels
		selectStart.html(option);
		selectEnd.html(option);
		
		//Restore old values if possible
		if(oldStartLvl != null && oldStartLvl != "null") {
			$("#routing-start-level option[value=\""+oldStartLvl+"\"]").attr("selected", "selected");
		}
		if(oldEndLvl != null && oldEndLvl != "null") {
			$("#routing-end-level option[value=\""+oldEndLvl+"\"]").attr("selected", "selected");
		}
	};
	
	/**
	 * Called when start level changes in selector
	 */
	OLU.view.RoutingView.prototype.startLevelChanged = function() {
		this.showRoute(null);
	};

	/**
	 * Called when end level changes in selector
	 */
	OLU.view.RoutingView.prototype.endLevelChanged = function() {
		this.showRoute(null);
	};
	
	/**
	 * Called when OK button is clicked
	 */
	OLU.view.RoutingView.prototype.validClicked = function() {
		OLU.controller.startRouting(
			$("#routing-mode").val(),
			this._mainView.getMapView().getRoutingMarkerCoords("start"),
			parseFloat($("#routing-start-level").val()),
			this._mainView.getMapView().getRoutingMarkerCoords("end"),
			parseFloat($("#routing-end-level").val())
		);
	};
	
	/**
	 * Resets the view
	 */
	OLU.view.RoutingView.prototype.reset = function() {
		this.showRoute(null);
		this.removeStartMarker();
		this.removeEndMarker();
	};
	
	/**
	 * Shows the given route in view and on map
	 * @param path The path to display
	 */
	OLU.view.RoutingView.prototype.showRoute = function(path) {
		//Show route on map
		this._mainView.getMapView().setRoute(path);
		
		if(path == null) {
			$("#rtg-instructions").addClass("hidden");
		}
		else {
			var length = 0;
			var speed = OLU.CONFIG.routing[$("#routing-mode").val()].speed;
			var instructions = [], instruction, lastLength = 0, lastDirection = 0, currentDirection;
			var transition, levelDiff;
			
			//Show instructions in panel
			for(var i=0, l=path.length; i < l; i++) {
				//Calculate length
				if(i < l-1) {
					lastLength = path[i].getCost(path[i+1]);
					length += lastLength;
					transition = path[i].getTransition(path[i+1]);
					levelDiff = path[i+1].getLevel() - path[i].getLevel();
				}
				else {
					lastLength = null;
					transition = null;
					levelDiff = 0;
				}
				
				//Calculate direction
				if(i == 0) {
					lastDirection = azimuth(
						{lat: path[i].getLatLng().lat, lng: path[i].getLatLng().lng, elv: 0},
						{lat: path[i+1].getLatLng().lat, lng: path[i+1].getLatLng().lng, elv: 0}
					).azimuth;
					currentDirection = lastDirection;
				}
				else if(i < l-1) {
					currentDirection = azimuth(
						{lat: path[i].getLatLng().lat, lng: path[i].getLatLng().lng, elv: 0},
						{lat: path[i+1].getLatLng().lat, lng: path[i+1].getLatLng().lng, elv: 0}
					).azimuth;
				}
				
				//Create instruction
				instruction = {};
				
				if(i == l-1) {
					instruction.img = 'end';
					instruction.txt = this._mainView.getTranslation("routing", "arrived");
					instructions.push(instruction);
				}
				else {
					//Find direction relatively to user
					if(transition == null) {
						instruction.img = OLU.util.angle360toAngle180(OLU.util.angle360toAngle180(currentDirection) - OLU.util.angle360toAngle180(lastDirection));
						
						//Case of going out of an elevator
						if(i > 0 && path[i-1].getTransition(path[i]) == "elevator") {
							instruction.img = "forward";
							instruction.txt = this._mainView.getTranslation("routing", "outelevator");
						}
						//Other directions
						else if(instruction.img <= 30 && instruction.img >= -30) {
							instruction.img = "forward";
							instruction.txt = this._mainView.getTranslation("routing", "goforward");
						}
						else if(instruction.img < -30 && instruction.img >= -120) {
							instruction.img = "left";
							instruction.txt = this._mainView.getTranslation("routing", "turnleft");
						}
						else if(instruction.img > 30 && instruction.img <= 120) {
							instruction.img = "right";
							instruction.txt = this._mainView.getTranslation("routing", "turnright");
						}
						else {
							instruction.img = "backward";
							instruction.txt = this._mainView.getTranslation("routing", "gobackward");
						}
					}
					//Create label for transition
					else {
						switch(transition) {
							case "stairs":
								if(levelDiff > 0) {
									instruction.img = "stairs_up";
									instruction.txt = this._mainView.getTranslation("routing", "upstairs");
								}
								else if(levelDiff < 0) {
									instruction.img = "stairs_down";
									instruction.txt = this._mainView.getTranslation("routing", "downstairs");
								}
								else {
									instruction.img = "stairs";
									instruction.txt = this._mainView.getTranslation("routing", "usestairs");
								}
								break;
							case "escalator":
								if(levelDiff > 0) {
									instruction.img = "escalator_up";
									instruction.txt = this._mainView.getTranslation("routing", "upconveying");
								}
								else if(levelDiff < 0) {
									instruction.img = "escalator_down";
									instruction.txt = this._mainView.getTranslation("routing", "downconveying");
								}
								else {
									instruction.img= "escalator";
									instruction.txt = this._mainView.getTranslation("routing", "useconveying");
								}
								break;
							case "elevator":
								if(levelDiff > 0) {
									instruction.img = "elevator_up";
									instruction.txt = this._mainView.getTranslation("routing", "golevel")+" "+path[i+1].getLevel()+" "+this._mainView.getTranslation("routing", "usingelevator");
								}
								else if(levelDiff < 0) {
									instruction.img = "elevator_down";
									instruction.txt = this._mainView.getTranslation("routing", "golevel")+" "+path[i+1].getLevel()+" "+this._mainView.getTranslation("routing", "usingelevator");
								}
								else {
									instruction.img= "elevator";
									instruction.txt = this._mainView.getTranslation("routing", "useelevator");
								}
								break;
							default:
								console.error("[Routing] Unknown transition type: "+transition);
						}
					}
					
					//Merge with previous instruction if possible
					if(
						instructions.length > 0
						&& ((instructions[instructions.length-1].img == instruction.img)
						|| (instructions[instructions.length-1].img == "stairs_down" && instruction.img == "stairs")
						|| (instructions[instructions.length-1].img == "escalator_down" && instruction.img == "escalator")
						|| (instructions[instructions.length-1].img == "stairs_up" && instruction.img == "stairs")
						|| (instructions[instructions.length-1].img == "escalator_up" && instruction.img == "escalator"))
					) {
						instructions[instructions.length-1].lgt += lastLength;
					}
					//Add new instruction
					else {
						instruction.lgt = lastLength;
						instructions.push(instruction);
					}
				}
				
				lastDirection = currentDirection;
			}
			
			//Update length
			$("#rtg-instr-length").html(Math.ceil(length));
			$("#rtg-instr-time").html(Math.ceil(length / speed / 60));
			
			//Show instructions list
			var instructionsTxt = '';
			for(var instrId=0, instrL = instructions.length; instrId < instrL; instrId++) {
				instructionsTxt += '<div class="routing-instruction">'
									+'<span class="routing-instr-img"><img src="img/icon_rtg_'+instructions[instrId].img+'.svg" /></span>'
									+' <span class="routing-instr-ref">'+(instrId+1)+'.</span>'
									+' <span class="routing-instr-txt">'+instructions[instrId].txt+'</span>'
									+'<span class="routing-instr-time">'+((instructions[instrId].lgt != undefined) ? Math.ceil(instructions[instrId].lgt)+' m' : '')+'</span>'
									+'</div>';
			}
			
			$("#rtg-instr-list").html(instructionsTxt);
			$("#rtg-instructions").removeClass("hidden");
		}
	};
