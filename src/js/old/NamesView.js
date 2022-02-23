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
 * The room names component
 */
OLU.view.NamesView = function(main) {
//ATTRIBUTES
	/** The main view **/
	this._mainView = main;

//CONSTRUCTOR
	$("#search-room").click(this.searchFocus.bind(this));
	$("#search-room").focus(this.searchFocus.bind(this));
	$("#search-room").focusout(this.searchFocus.bind(this));
	$("#search-room").bind("input propertychange", this.update.bind(this));
	$("#search-room-reset").click(this.reset.bind(this));
	$("#search-room").val(this._mainView.getTranslation("value", "general", "search"));
};

//OTHER METHODS
	/**
	 * Shows the export button
	 */
	OLU.view.NamesView.prototype.showButton = function() {
		$("#sidebar-tab-roomlist").removeClass("disabled");
	};
	
	/**
	 * Hides the export button
	 */
	OLU.view.NamesView.prototype.hideButton = function() {
		$("#sidebar-tab-roomlist").addClass("disabled");
	};
	
	/**
	 * Updates the names list
	 */
	OLU.view.NamesView.prototype.update = function() {
		if(this._mainView.getData() != null) {
			var filter = (this.searchOK()) ? $("#search-room").val() : null;
			var roomNames = this._mainView.getData().getNames();
			
			//Filter room names
			var roomNamesFiltered = null;
			
			if(roomNames != null) {
				roomNamesFiltered = {};
				
				for(var lvl in roomNames) {
					roomNamesFiltered[lvl] = {};
					
					for(var room in roomNames[lvl]) {
						var ftGeomRoom = roomNames[lvl][room].getGeometry();
						
						if((filter == null || room.toLowerCase().indexOf(filter.toLowerCase()) > -1)
							&& (roomNames[lvl][room].getStyle().get().popup == undefined
							|| roomNames[lvl][room].getStyle().get().popup == "yes")
							&& this._mainView.getData().getBBox().intersects(ftGeomRoom.getBounds())) {

							roomNamesFiltered[lvl][room] = roomNames[lvl][room];
						}
					}
					
					//Remove level if empty
					if(Object.keys(roomNamesFiltered[lvl]).length == 0) {
						delete roomNamesFiltered[lvl];
					}
				}
			}
			
			if(roomNames != null && roomNamesFiltered != null) {
				var levelsKeys = Object.keys(roomNamesFiltered);
				levelsKeys.sort(function (a,b) { return parseFloat(a)-parseFloat(b);});
				
				var roomHtml = '';
				
				for(var i=0; i < levelsKeys.length; i++) {
					var lvl = levelsKeys[i];

					//Create new level row
					roomHtml += '<div class="lvl-row" id="lvl'+lvl+'"><div class="lvl-name">'+lvl+'</div><div class="lvl-rooms" id="lvl'+lvl+'-rooms"><ul>';

					//Add each room
					for(var room in roomNamesFiltered[lvl]) {
						roomHtml += '<li class="ref"><a href="#" onclick="OLU.controller.getView().getMapView().goTo(\''+roomNamesFiltered[lvl][room].getId()+'\',\''+lvl+'\')">';
						
						if(OLU.STYLE != undefined) {
							roomHtml += '<img src="'+OLU.CONFIG.view.icons.folder+'/'+((OLU.util.contains(OLU.STYLE.images, roomNamesFiltered[lvl][room].getStyle().getIconUrl())) ? roomNamesFiltered[lvl][room].getStyle().getIconUrl() : 'icon_default.png')+'" width="'+OLU.CONFIG.view.icons.size+'px"> '+room;
						}
						
						roomHtml += '</a></li>';
					}
					
					roomHtml += '</ul></div></div>';
				}
				
				$("#rooms").html(roomHtml);
			}
		}
	};
	
	/**
	 * Resets the room names list
	 */
	OLU.view.NamesView.prototype.reset = function() {
		$("#search-room").val(this._mainView.getTranslation("value", "general", "search"));
		this.update();
	};
	
	/**
	 * @return True if the searched string for filtering names is long enough
	 */
	OLU.view.NamesView.prototype.searchOK = function() {
		var search = $("#search-room").val();
		return search != this._mainView.getTranslation("value", "general", "search") && search.length >= 3;
	};
	
	/**
	 * When search room input is changed
	 */
	OLU.view.NamesView.prototype.searchFocus = function() {
		var search = $("#search-room").val();
		if(search == this._mainView.getTranslation("value", "general", "search") && $("#search-room").is(":focus")) {
			$("#search-room").val("");
		}
		else if(search == "" && !$("#search-room").is(":focus")) {
			$("#search-room").val(this._mainView.getTranslation("value", "general", "search"));
		}
	};
