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
 * The options component
 */
OLU.view.OptionsView = function() {
//ATTRIBUTES
	/** Show transcendent elements **/
	this._transcend = true;
	
	/** Show unrendered elements **/
	this._unrendered = false;
	
	/** Show only buildings **/
	this._buildings = false;
	
	/** Show photos markers **/
	this._photos = false;
	
	/** Show OSM notes **/
	this._notes = false;
	
	/** Show objects with implicit level **/
	this._implicitLevel = false;

//CONSTRUCTOR
	//Init checkboxes
	$("#show-transcendent").prop("checked", this._transcend);
	$("#show-unrendered").prop("checked", this._unrendered);
	$("#show-buildings-only").prop("checked", this._buildings);
	$("#show-photos").prop("checked", this._photos);
	$("#show-notes").prop("checked", this._notes);
	$("#show-implicit-level").prop("checked", this._implicitLevel);
	
	//Add triggers
	$("#show-transcendent").change(function() {
		this.changeTranscendent();
		OLU.controller.getView().updateOptionChanged();
	}.bind(this));
	$("#show-unrendered").change(function() {
		this.changeUnrendered();
		OLU.controller.getView().updateOptionChanged();
	}.bind(this));
	$("#show-buildings-only").change(function() {
		this.changeBuildingsOnly();
		OLU.controller.getView().updateOptionChanged();
	}.bind(this));
	$("#show-photos").change(function() {
		this.changePhotos();
		OLU.controller.getView().updateOptionChanged();
	}.bind(this));
	$("#show-notes").change(function() {
		this.changeNotes();
		OLU.controller.getView().updateOptionChanged();
	}.bind(this));
	$("#show-implicit-level").change(function() {
		this.changeImplicitLevel();
		OLU.controller.implicitLevelChanged();
	}.bind(this));
	
	this.enable();
};

//ACCESSORS
	/**
	 * @return Must we show transcendent objects ?
	 */
	OLU.view.OptionsView.prototype.showTranscendent = function() {
		return this._transcend;
	};
	
	/**
	 * @return Must we show unrendered objects ?
	 */
	OLU.view.OptionsView.prototype.showUnrendered = function() {
		return this._unrendered;
	};
	
	/**
	 * @return Must we show only building objects ?
	 */
	OLU.view.OptionsView.prototype.showBuildingsOnly = function() {
		return this._buildings;
	};
	
	/**
	 * @return Must we show photo markers ?
	 */
	OLU.view.OptionsView.prototype.showPhotos = function() {
		return this._photos;
	};
	
	/**
	 * @return Must we show notes markers ?
	 */
	OLU.view.OptionsView.prototype.showNotes = function() {
		return this._notes;
	};
	
	/**
	 * @return Must we show objects with implicit level 0 ?
	 */
	OLU.view.OptionsView.prototype.showImplicitLevel = function() {
		return this._implicitLevel;
	};

//MODIFIERS
	/**
	 * Must we set transcendent objects ?
	 */
	OLU.view.OptionsView.prototype.changeTranscendent = function() {
		this._transcend = !this._transcend;
	};
	
	/**
	 * Must we set unrendered objects ?
	 */
	OLU.view.OptionsView.prototype.changeUnrendered = function() {
		this._unrendered = !this._unrendered;
	};
	
	/**
	 * Must we set only building objects ?
	 */
	OLU.view.OptionsView.prototype.changeBuildingsOnly = function() {
		this._buildings = !this._buildings;
	};
	
	/**
	 * Must we show photo markers ?
	 */
	OLU.view.OptionsView.prototype.changePhotos = function() {
		this._photos = !this._photos;
	};
	
	/**
	 * Must we show OSM notes ?
	 */
	OLU.view.OptionsView.prototype.changeNotes = function() {
		this._notes = !this._notes;
	};
	
	/**
	 * Must we show objects with implicit level value ?
	 */
	OLU.view.OptionsView.prototype.changeImplicitLevel = function() {
		this._implicitLevel = !this._implicitLevel;
	};
	
	/**
	 * Must we set transcendent objects ?
	 */
	OLU.view.OptionsView.prototype.setTranscendent = function(p) {
		this._transcend = p;
		$("#show-transcendent").prop("checked", this._transcend);
	};
	
	/**
	 * Must we set unrendered objects ?
	 */
	OLU.view.OptionsView.prototype.setUnrendered = function(p) {
		this._unrendered = p;
		$("#show-unrendered").prop("checked", this._unrendered);
	};
	
	/**
	 * Must we set only building objects ?
	 */
	OLU.view.OptionsView.prototype.setBuildingsOnly = function(p) {
		this._buildings = p;
		$("#show-buildings-only").prop("checked", this._buildings);
	};
	
	/**
	 * Must we show photo markers ?
	 */
	OLU.view.OptionsView.prototype.setPhotos = function(p) {
		this._photos = p;
		$("#show-photos").prop("checked", this._photos);
	};
	
	/**
	 * Must we show notes markers ?
	 */
	OLU.view.OptionsView.prototype.setNotes = function(p) {
		this._notes = p;
		$("#show-notes").prop("checked", this._notes);
	};
	
	/**
	 * Must we show objects with implicit level ?
	 */
	OLU.view.OptionsView.prototype.setImplicitLevel = function(p) {
		this._implicitLevel = p;
		$("#show-implicit-level").prop("checked", this._implicitLevel);
	};
	
	/**
	 * Disable options buttons
	 */
	OLU.view.OptionsView.prototype.disable = function() {
		$("#show-buildings-only").prop("disabled", true);
		$("#show-unrendered").prop("disabled", true);
		$("#show-transcendent").prop("disabled", true);
		$("#show-photos").prop("disabled", true);
		$("#show-notes").prop("disabled", true);
		$("#show-implicit-level").prop("disabled", true);
	};
	
	/**
	 * Enable level button
	 */
	OLU.view.OptionsView.prototype.enable = function() {
		$("#show-buildings-only").prop("disabled", false);
		$("#show-unrendered").prop("disabled", false);
		$("#show-transcendent").prop("disabled", false);
		$("#show-photos").prop("disabled", false);
		$("#show-notes").prop("disabled", false);
		$("#show-implicit-level").prop("disabled", false);
	};
