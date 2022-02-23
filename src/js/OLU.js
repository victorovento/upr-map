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

//Global conf (cache enabled)
$.ajaxSetup({ cache: true });

/*
 * Main OpenLevelUp definitions
 */
var OLU = {
	model: {
		Feature: require("./model/Feature"),
		FeatureGeometry: require("./model/FeatureGeometry"),
		FeatureImages: require("./model/FeatureImages"),
		Graph: require("./model/Graph"),
		Node: require("./model/Node"),
		Note: require("./model/Note"),
		SearchResult: require("./model/SearchResult"),
		
		mapcss: {
			Condition: require("./model/mapcss/Condition"),
			InstructionStyle: require("./model/mapcss/InstructionStyle"),
			PointStyle: require("./model/mapcss/PointStyle"),
			Rule: require("./model/mapcss/Rule"),
			RuleChain: require("./model/mapcss/RuleChain"),
			RuleSet: require("./model/mapcss/RuleSet"),
			ShapeStyle: require("./model/mapcss/ShapeStyle"),
			ShieldStyle: require("./model/mapcss/ShieldStyle"),
			Style: require("./model/mapcss/Style"),
			StyleChooser: require("./model/mapcss/StyleChooser"),
			StyleList: require("./model/mapcss/StyleList"),
			TextStyle: require("./model/mapcss/TextStyle")
		}
	},
	view: {
		Main: require("./view/Main"),
		level: require("./view/Level"),
		MapLayersManager: require("./view/MapLayersManager"),
		messages: require("./view/Messages"),
		side: require("./view/Side"),
		spinner: require("./view/Spinner"),
		
		sidecontent: {
			Feature: require("./view/sidecontent/Feature"),
			Help: require("./view/sidecontent/Help"),
			Layers: require("./view/sidecontent/Layers"),
			Notes: require("./view/sidecontent/Notes"),
			Parameters: require("./view/sidecontent/Parameters"),
			Routing: require("./view/sidecontent/Routing"),
			Search: require("./view/sidecontent/Search")
		}
	},
	ctrl: {
		Main: require("./ctrl/Main"),
		
		provider: {
			data: {
				Notes: require("./ctrl/provider/data/Notes"),
				OSM: require("./ctrl/provider/data/OSM"),
			},
			picture: {
				Flickr: require("./ctrl/provider/picture/Flickr"),
			}
		},
		service: {
			LevelExport: require("./ctrl/service/LevelExport"),
			NewNote: require("./ctrl/service/NewNote"),
			Routing: require("./ctrl/service/Routing"),
			URL: require("./ctrl/service/URL"),
			Search: require("./ctrl/service/Search"),
			Translator: require("./ctrl/service/Translator")
		}
	},
	util: require("./utils")
};

//Compatibility with old browsers
OLU.util.addCompatibility();

//Main OpenLevelUp method
OLU.init = function(divId, mode, config) {
	return new OLU.ctrl.Main(divId, mode, config);
};


module.exports = OLU;
