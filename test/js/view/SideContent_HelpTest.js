/*
 * Expected result: show side help with appropriate content
 */

var L = require("leaflet");
var OLU = require("../src/OLU");

var map = L.map('map').setView([48.11, -1.67], 13);
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Tests
var side = OLU.view.side("side").addTo(map);
side.show("help");
