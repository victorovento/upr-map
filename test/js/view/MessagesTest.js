/*
 * Expected result: three messages shown successively, then pause, and show another one a bit longer
 */

var L = require("leaflet");
var OLU = require("../src/OLU");

var map = L.map('map').setView([48.11, -1.67], 13);
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var msgs = OLU.view.messages("messages", { timeout: 1500 }).addTo(map);
msgs.show("Test of default");
msgs.show("Test of info", "info");
msgs.show("Test of warning", "warning");

setTimeout(function() { msgs.show("Test of later error", "error", 2000); }, 6000);

setTimeout(function() {
	var side = OLU.view.side("side").addTo(map);
	side.show("help");
	for(var i=0; i < 1000; i++) {
		setTimeout(function() { msgs.show("Test of messages over side content", "warning"); }, i*1500);
	}
}, 9000);
