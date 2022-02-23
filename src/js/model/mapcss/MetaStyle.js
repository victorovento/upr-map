var Style = require("./Style");

/**
 * MetaStyle
 * Handles properties specific to meta rules.
 * 
 * Based on Overpass Turbo implementation
 * @see https://github.com/tyrasd/overpass-turbo
 */
var MetaStyle = function() {this.__init__()};
MetaStyle.prototype = {
	properties: ['title'],

	styleType: 'MetaStyle'
};

//Inherit from Style
for(var p in Style.prototype) {
	if (MetaStyle.prototype[p] === undefined) {
		MetaStyle.prototype[p] = Style.prototype[p];
	}
}

module.exports = MetaStyle;
