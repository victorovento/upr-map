var Style = require("./Style");

/**
 * ShieldStyle
 * Based on Overpass Turbo implementation
 * @see https://github.com/tyrasd/overpass-turbo
 */
var ShieldStyle = function() {this.__init__()};

ShieldStyle.prototype = {
	has: function(k) {
		return this.properties.indexOf(k)>-1;
	},
	properties: ['shield_image','shield_width','shield_height'],
	shield_image: null,
	shield_width: NaN,
	shield_height: NaN,
	styleType: 'ShieldStyle',
};

//Inherit from Style
for(var p in Style.prototype) {
	if (ShieldStyle.prototype[p] === undefined) {
		ShieldStyle.prototype[p] = Style.prototype[p];
	}
}

module.exports = ShieldStyle;
