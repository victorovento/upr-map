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
 * Allows label translating according to given translations.
 */

var Translator = function () {
	/** The loaded translations **/
	this.translations = {};
	
	/** The currently used locale **/
	this.currentLocale = 'en';
};

/** Change the current locale **/
Translator.prototype.setLocale = function(lng) {
	if(this.translations[lng] !== undefined) {
		this.currentLocale = lng;
	}
	else if(this.translations[lng.split('-')[0]]) {
		this.currentLocale = lng.split('-')[0];
	}
};

/** Add a new language **/
Translator.prototype.addTranslation = function(lng, data) {
	this.translations[lng] = data;
};

/**
	* Given a string identifier, try to find that string in the current
	* language, and return it.
	* @param s string identifier
	* @param o Optional parameters to replace in the label
	* @param lng Optional, the locale to use
	* @returns locale string
	*/
Translator.prototype.t = function(s, o, loc) {
	loc = loc || this.currentLocale;
	
	var path = s.split('.').reverse();
	var rep = this.translations[loc];
	
	while (rep !== undefined && path.length) rep = rep[path.pop()];
	
	if (rep !== undefined) {
		if (o) for (var k in o) rep = rep.replace('{' + k + '}', o[k]);
		return rep;
	}
	
	if (loc !== 'en') {
		return this.t(s, o, 'en');
	}
	
	if (o && 'default' in o) {
		return o.default;
	}
	
	console.error('[Translator] Missing ' + loc + ' translation: ' + s);
	
	return 'Missing label';
};

module.exports = Translator;
