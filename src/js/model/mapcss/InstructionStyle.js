var Style = require("./Style");

/**
 * InstructionStyle
 * Based on Overpass Turbo implementation
 * @see https://github.com/tyrasd/overpass-turbo
 */
var InstructionStyle = function() {this.__init__()};
InstructionStyle.prototype = {
	set_tags: null,
	breaker: false,
	styleType: 'InstructionStyle',
	
	__init__: function() {
	},
	
	addSetTag: function(k,v) {
		this.edited=true;
		if (!this.set_tags) this.set_tags={};
		this.set_tags[k]=v;
	},
	
};

//Inherit from Style
for(var p in Style.prototype) {
	if (InstructionStyle.prototype[p] === undefined) {
		InstructionStyle.prototype[p] = Style.prototype[p];
	}
}

module.exports = InstructionStyle;
