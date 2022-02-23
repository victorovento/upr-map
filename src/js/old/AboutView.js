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
 * The about view
 */
OLU.view.AboutView = function(main) {
//ATTRIBUTES
	/** The main view **/
	this._mainView = main;

//CONSTRUCTOR
	$("#about-link").click(function() {
		L.control.window(
			this._mainView.getMapView().get(),
			{
				title: this._mainView.getTranslation("about", "title"),
				 content: '<span class="i18n about.summary">'+this._mainView.getTranslation("about", "summary")+'</span><br /><p style="text-align: center;"><a href="mailto:panieravide@riseup.net" class="i18n about.contact">'+this._mainView.getTranslation("about", "contact")+'</a> | <a href="https://github.com/PanierAvide/panieravide.github.io/tree/master/openlevelup" class="i18n about.github">'+this._mainView.getTranslation("about", "github")+'</a> | <a href="https://wiki.openstreetmap.org/wiki/OpenLevelUp" class="i18n about.wiki">'+this._mainView.getTranslation("about", "wiki")+'</a> | <a class="i18n about.doctag" href="https://wiki.openstreetmap.org/wiki/OpenLevelUp/Recommended_tagging">'+this._mainView.getTranslation("about", "doctag")+'</a></p><p class="laureate"><span class="images"><a href="http://opendata.regionpaca.fr"><img src="img/logo_paca.jpg" /></a></span><span class="desc i18n about.laureate">'+this._mainView.getTranslation("about", "laureate")+'</span></p>',
				modal: true,
				position: 'center',
				visible: true
			}
		);
	}.bind(this));
}
