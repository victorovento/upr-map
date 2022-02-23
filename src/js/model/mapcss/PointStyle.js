var Style = require("./Style");

/**
 * PointStyle
 * Based on Overpass Turbo implementation
 * @see https://github.com/tyrasd/overpass-turbo
 */
var PointStyle = function() {this.__init__()};
PointStyle.prototype = {
	properties: ['icon_image','icon_width','icon_height','icon_opacity','rotation','icon_image_aliases'],
	icon_image: null,
	icon_width: 0,
	icon_height: NaN,
	icon_image_aliases: '',
	rotation: NaN,
	styleType: 'PointStyle',
	
	drawn:function() {
		return (this.icon_image !== null);
	},
	
	maxwidth:function() {
		return this.evals.icon_width ? 0 : this.icon_width;
	},
	
	setImageAliases:function() {
		if(this.icon_image_aliases.replace) {
			var json = '{ '+this.icon_image_aliases.replace(/'/g, "")+' }';
			this.icon_image_aliases = JSON.parse(json);
		}
	}
};

//Inherit from Style
for(var p in Style.prototype) {
	if (PointStyle.prototype[p] === undefined) {
		PointStyle.prototype[p] = Style.prototype[p];
	}
}

module.exports = PointStyle;
