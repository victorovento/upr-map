/*
 * Expected result: one first loading, then two simultaneous loadings, later one lasting loading
 */

var L = require("leaflet");
var OLU = require("../src/OLU");

var map = L.map('map').setView([48.11, -1.67], 13);
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var spin = OLU.view.spinner("spinner").addTo(map);
spin.show("Loading data");

setTimeout(function() { spin.hide(); }, 2000);

setTimeout(function() { spin.show("Loading first data", "upload"); }, 4000);
setTimeout(function() { spin.show("Loading second data", "download"); }, 5000);
setTimeout(function() { spin.hide(); }, 8000);
setTimeout(function() { spin.hide(); }, 10000);

setTimeout(function() { spin.show("Loading final data"); }, 12000);
