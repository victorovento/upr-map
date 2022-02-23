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
 * The main view class.
 * It handles the index page, and contains links to sub-components.
 */
OLU.view.MainView = function(ctrl) {
	//ATTRIBUTES
	/** The main controller **/
	this._ctrl = ctrl;
	
	/** Is the user using a WebGL capable browser ? **/
	this._hasWebGL = Detector.webgl;
	
	/** The view language **/
	this._lang = null;
	
	/*
	 * The view components
	 */
	/** The loading component **/
	this._cLoading = null;
	
	/** The about component **/
	this._cAbout = null;
	
	/** The messages stack component **/
	this._cMessages = null;
	
	/** The URL component **/
	this._cUrl = null;
	
	/** The options component **/
	this._cOptions = new OLU.view.OptionsView();
	
	/** The names component **/
	this._cNames = null;
	
	/** The images component **/
	this._cImages = null;
	
	/** The levels component **/
	this._cLevel = null;
	
	/** The tags component **/
	this._cTags = null;
	
	/** The notes component **/
	this._cNotes = null;
	
	/** The routing component **/
	this._cRouting = null;
	
	/** The map component **/
	this._cMap = null;
	
	//CONSTRUCTOR
	this._cUrl = new OLU.view.URLView(this);
	this._cMap = new OLU.view.MapView(this);
	this._cLoading = new OLU.view.LoadingView(this);
	this._cMessages = new OLU.view.MessagesView(this);
	this._cAbout = new OLU.view.AboutView(this);
	this._cSupport = new OLU.view.SupportView(this);
	this._cNames = new OLU.view.NamesView(this);
	this._cRouting = new OLU.view.RoutingView(this);
	this._cImages = new OLU.view.ImagesView(this);
	this._cLevel = new OLU.view.LevelView(this);
	this._cTags = new OLU.view.TagsView(this);
	this._cNotes = new OLU.view.NotesView(this);
	
	this._cNames.hideButton();
	this._cLevel.disable();
	this.translate(window.navigator.userLanguage || window.navigator.language);
	
	//Link on logo
	$("#logo-link").click(function() {
		OLU.controller.getView().getMapView().resetView();
	});
	
	//Export link
	$("#icon-export").click(this._ctrl.onExportLevel.bind(this._ctrl));
};

//ACCESSORS
/**
 * @return True if the application is viewed in a mobile device
 */
OLU.view.MainView.prototype.isMobile = function() {
	return $(window).width() < 768;
};

/**
 * @return True if the browser is WebGL capable
 */
OLU.view.MainView.prototype.hasWebGL = function() {
	return this._hasWebGL;
};

/**
 * @return The URL component
 */
OLU.view.MainView.prototype.getUrlView = function() {
	return this._cUrl;
};

/**
 * @return The map component
 */
OLU.view.MainView.prototype.getMapView = function() {
	return this._cMap;
};

/**
 * @return The messages stack component
 */
OLU.view.MainView.prototype.getMessagesView = function() {
	return this._cMessages;
};

/**
 * @return The options component
 */
OLU.view.MainView.prototype.getOptionsView = function() {
	return this._cOptions;
};

/**
 * @return The loading component
 */
OLU.view.MainView.prototype.getLoadingView = function() {
	return this._cLoading;
};

/**
 * @return The images component
 */
OLU.view.MainView.prototype.getImagesView = function() {
	return this._cImages;
};

/**
 * @return The level component
 */
OLU.view.MainView.prototype.getLevelView = function() {
	return this._cLevel;
};

/**
 * @return The tags component
 */
OLU.view.MainView.prototype.getTagsView = function() {
	return this._cTags;
};

/**
 * @return The notes component
 */
OLU.view.MainView.prototype.getNotesView = function() {
	return this._cNotes;
};

/**
 * @return The routing component
 */
OLU.view.MainView.prototype.getRoutingView = function() {
	return this._cRouting;
};

/**
 * @return The map data from the controller
 */
OLU.view.MainView.prototype.getData = function() {
	return this._ctrl.getData();
};

/**
 * @return The cluster data from the controller
 */
OLU.view.MainView.prototype.getClusterData = function() {
	return this._ctrl.getClusterData();
};

/**
 * @return The notes data from the controller
 */
OLU.view.MainView.prototype.getNotesData = function() {
	return (this._ctrl.getNotesData() != null) ? this._ctrl.getNotesData().get() : null;
};

//OTHER METHODS
/**
 * Updates the view when map moves or zoom changes
 */
OLU.view.MainView.prototype.updateMapMoved = function() {
	var zoom = this._cMap.get().getZoom();
	var oldZoom = this._cMap.getOldZoom();
	
	//Check new zoom value
	if(zoom >= OLU.CONFIG.view.map.full_data_min_zoom) {
		//Update levels
		this._cLevel.update();
		this._cRouting.updateLevels();
		
		//Add names and export buttons if needed
		if(oldZoom == null || oldZoom < OLU.CONFIG.view.map.full_data_min_zoom) {
			this._cNames.showButton();
			this._cNotes.showButton();
			this._cRouting.showButton();
			this._cLevel.enable();
			this._cOptions.enable();
			this._cMap.update();
		}
	}
	else if(zoom >= OLU.CONFIG.view.map.data_min_zoom) {
		//Update levels
		this._cLevel.update();
		this._cRouting.updateLevels();
		
		//Add names and export buttons if needed
		if(oldZoom == null || oldZoom < OLU.CONFIG.view.map.data_min_zoom) {
			this._cNames.showButton();
			this._cNotes.showButton();
			this._cRouting.showButton();
			this._cLevel.enable();
			this._cOptions.enable();
			this._cMap.update();
		}
		else if(oldZoom >= OLU.CONFIG.view.map.full_data_min_zoom) {
			this._cMap.update();
		}
	}
	else if(zoom >= OLU.CONFIG.view.map.cluster_min_zoom) {
		//Remove names and export buttons if needed
		if(oldZoom == null || oldZoom >= OLU.CONFIG.view.map.data_min_zoom) {
			this._cNames.hideButton();
			this._cNotes.hideButton();
			this._cRouting.hideButton();
			this._cLevel.disable();
			this._cOptions.disable();
		}
		
		if(oldZoom == null || oldZoom >= OLU.CONFIG.view.map.data_min_zoom || oldZoom < OLU.CONFIG.view.map.cluster_min_zoom) {
			this._cMap.update();
		}
	}
	else {
		this._cMessages.displayMessage(this.getTranslation("error", "zoomin"), "info");
		
		//Remove names and export buttons if needed
		if(oldZoom == null || oldZoom >= OLU.CONFIG.view.map.data_min_zoom) {
			this._cNames.hideButton();
			this._cNotes.hideButton();
			this._cRouting.hideButton();
			this._cLevel.disable();
			this._cOptions.disable();
		}
		
		//Reset map
		if(oldZoom == null || oldZoom >= OLU.CONFIG.view.map.cluster_min_zoom) {
			this._cMap.update();
		}
	}
	
	this._cUrl.mapUpdated();
	this._cNames.update();
};

/**
 * Updates the view when level changes
 */
OLU.view.MainView.prototype.updateLevelChanged = function() {
	this._cMap.update();
	this._cUrl.levelChanged();
	this._cRouting.updateLevels();
};

/**
 * Updates the view when an option changes
 */
OLU.view.MainView.prototype.updateOptionChanged = function() {
	this._cMap.update();
	this._cUrl.optionsChanged();
};

/**
 * Updates the view when photos are added
 */
OLU.view.MainView.prototype.updatePhotosAdded = function() {
	this._cMap.update();
};

/**
 * Updates the view when new note is added
 */
OLU.view.MainView.prototype.updateNoteAdded = function() {
	this._cMap.update();
};

/**
 * Hides the central panel
 */
OLU.view.MainView.prototype.collapseSidebar = function() {
	$(".sidebar-tabs li").removeClass("active");
	$("#sidebar .sidebar-pane").removeClass("active");
	$("#sidebar").addClass("collapsed");
};

/**
 * Translates all available labels
 */
OLU.view.MainView.prototype.translate = function(lng) {
	//Find if language is available
	if(OLU.LANG.available[lng] == undefined) {
		//Check for complex codes
		if(lng.indexOf("-") == 2) {
			var lngSimple = lng.substring(0, 2);
			if(OLU.LANG.available[lngSimple]) {
				lng = lngSimple;
			}
			else {
				lng = "en";
			}
		}
		else {
			lng = "en";
		}
	}
	
	this._lang = lng;
	console.log("[Lang] Set to "+lng);
	
	$(".i18n").each(function(index) {
		//Check classes of DOM element
		var classes = $(this).attr("class").split(" ");
		var i=0, l=classes.length, found=false, categories, label;
		
		while(i < l && !found) {
			//If class for i18n, read it and translate
			if(classes[i].indexOf(".") >= 0) {
				categories = classes[i].split(".");
				
				if(categories.length == 2) {
					//Check if given label exists in LANG, or use default english
					label = (OLU.LANG[categories[0]][categories[1]][lng] != undefined) ? OLU.LANG[categories[0]][categories[1]][lng] : OLU.LANG[categories[0]][categories[1]].en;
					
					//Replace text in DOM
					$(this).html(label);
					
					found = true;
				}
			}
			i++;
		}
	});
	
	$(".i18n-title").each(function(index) {
		//Check classes of DOM element
		var classes = $(this).attr("class").split(" ");
		var i=0, l=classes.length, found=false, categories, label;
		
		while(i < l && !found) {
			//If class for i18n, read it and translate
			if(classes[i].indexOf("title.") == 0) {
				categories = classes[i].substring(6).split(".");
				
				if(categories.length == 2) {
					//Check if given label exists in LANG, or use default english
					label = (OLU.LANG.title[categories[0]][categories[1]][lng] != undefined) ? OLU.LANG.title[categories[0]][categories[1]][lng] : OLU.LANG.title[categories[0]][categories[1]].en;
					
					//Replace text in DOM
					$(this).attr("title", label);
					
					found = true;
				}
			}
			i++;
		}
	});
	
	$(".i18n-value").each(function(index) {
		//Check classes of DOM element
		var classes = $(this).attr("class").split(" ");
		var i=0, l=classes.length, found=false, categories, label;
		
		while(i < l && !found) {
			//If class for i18n, read it and translate
			if(classes[i].indexOf("value.") == 0) {
				categories = classes[i].substring(6).split(".");
				
				if(categories.length == 2) {
					//Check if given label exists in LANG, or use default english
					label = (OLU.LANG.value[categories[0]][categories[1]][lng] != undefined) ? OLU.LANG.value[categories[0]][categories[1]][lng] : OLU.LANG.value[categories[0]][categories[1]].en;
					
					//Replace text in DOM
					$(this).attr("value", label);
					
					found = true;
				}
			}
			i++;
		}
	});
};

/**
 * Get translation for a given code
 */
OLU.view.MainView.prototype.getTranslation = function(n1, n2, n3) {
	if(n1 == "title" || n1 == "value") {
		if(OLU.LANG[n1][n2] != undefined && OLU.LANG[n1][n2][n3] != undefined) {
			return (OLU.LANG[n1][n2][n3][this._lang] != undefined) ? OLU.LANG[n1][n2][n3][this._lang] : OLU.LANG[n1][n2][n3].en;
		}
	}
	else {
		if(OLU.LANG[n1] != undefined && OLU.LANG[n1][n2] != undefined) {
			return (OLU.LANG[n1][n2][this._lang] != undefined) ? OLU.LANG[n1][n2][this._lang] : OLU.LANG[n1][n2].en;
		}
	}
	console.error("[Lang] Missing translation:",n1,n2,n3);
	return "";
};
