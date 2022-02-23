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
 * The support view
 */
OLU.view.SupportView = function(main) {
	//ATTRIBUTES
	/** The main view **/
	this._mainView = main;
	
	//CONSTRUCTOR
	$("#support-link").click(function() {
		L.control.window(
			this._mainView.getMapView().get(),
				{
					title: this._mainView.getTranslation("support", "title"),
					content: this._mainView.getTranslation("support", "desc")+'<hr /><p class="donation"><span class="way">Bitcoin</span> <a href="bitcoin:1Jn58LkSNh5iyJ7tA7VHqrLvueVacvuUWt?label=OpenLevelUp">1Jn58LkSNh5iyJ7tA7VHqrLvueVacvuUWt</a></p><p class="donation"><span class="way">Flattr</span> <a href="https://flattr.com/submit/auto?fid=66g2vo&url=http%3A%2F%2Fopenlevelup.pavie.info%2F" target="_blank"><img src="https://button.flattr.com/flattr-badge-large.png" alt="Flattr this" title="Flattr this" border="0"></a></p>',
					modal: true,
					position: 'center',
					visible: true
				}
		);
	}.bind(this));
};
