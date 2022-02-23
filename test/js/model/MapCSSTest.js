/*
 * Test script for MapCSS parser
 */

var QUnit = require("qunitjs");
var OLU = require("../src/OLU");

QUnit.module("Model > MapCSS");

/*
 * TESTS
 */
QUnit.test("Simple MapCSS parsing", function(assert) {
	var css =
		'canvas {'+
			'background-color: #ffffea;'+
			'default-points: false;'+
			'default-lines: false;'+
		'}'+
		'relation[boundary=administrative][admin_level=7]:closed'+
		'{'+
			'width: 1;'+
			'color: black;'+
			'opacity: 1;'+
			'fill-color: orange;'+
			'fill-opacity: 0.3;'+
			'font-size: 16;'+
			'text-color: green;'+
			'text: admin_level;'+
			'text-position: center;'+
		'}'+
		'relation[boundary=administrative][admin_level=8]:closed'+
		'{'+
			'width: 1;'+
			'color: black;'+
			'opacity: 1;'+
			'fill-color: blue;'+
			'fill-opacity: 0.3;'+
			'font-size: 16;'+
			'text-color: red;'+
			'text: admin_level;'+
			'text-position: center;'+
		'}'+
		'relation[boundary=administrative][admin_level=6]:closed'+
		'{'+
			'width: 1;'+
			'color: black;'+
			'opacity: 1;'+
			'fill-color: brown;'+
			'fill-opacity: 0.3;'+
			'font-size: 16;'+
			'text-color: white;'+
			'text: admin_level;'+
			'text-position: center;'+
		'}';
	var parser = new OLU.model.mapcss.RuleSet();
	parser.parseCSS(css);
	
	console.log(parser);
	assert.ok(parser != null);
	assert.equal(parser.choosers.length, 4);
	
	assert.equal(parser.choosers[0].ruleChains.length, 1);
	assert.equal(parser.choosers[0].ruleChains[0].rules.length, 1);
	assert.equal(parser.choosers[0].ruleChains[0].rules[0].subject, "canvas");
	
	assert.equal(parser.choosers[1].ruleChains.length, 1);
	assert.equal(parser.choosers[1].ruleChains[0].rules.length, 1);
	assert.equal(parser.choosers[1].ruleChains[0].rules[0].subject, "relation");
	assert.equal(parser.choosers[1].ruleChains[0].rules[0].conditions.length, 3);
	assert.equal(parser.choosers[1].ruleChains[0].rules[0].conditions[0].type, "eq");
	assert.equal(parser.choosers[1].ruleChains[0].rules[0].conditions[0].params.length, 2);
	assert.equal(parser.choosers[1].ruleChains[0].rules[0].conditions[0].params[0], "boundary");
	assert.equal(parser.choosers[1].ruleChains[0].rules[0].conditions[0].params[1], "administrative");
});
