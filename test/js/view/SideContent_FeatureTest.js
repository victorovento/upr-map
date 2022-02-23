/*
 * Expected result: show feature in sidebar
 */

var $ = require("jquery");
var L = require("leaflet");
var yaml = require("js-yaml");
var OLU = require("../src/OLU");

var ftDetails = {
	"major": {
		"opening_hours": {
			"type": "hours",
			"img": "clock",
			"name": "Opening hours"
		},
		"contact:website": {
			"type": "link",
			"img": "web",
			"name": "Website"
		},
		"website": {
			"type": "link",
			"img": "web",
			"name": "Website"
		},
		"contact:email": {
			"type": "email",
			"img": "email",
			"name": "E-mail"
		},
		"email": {
			"type": "email",
			"img": "email",
			"name": "E-mail"
		},
		"contact:phone": {
			"type": "text",
			"img": "phone",
			"name": "Phone"
		},
		"phone": {
			"type": "text",
			"img": "phone",
			"name": "Phone"
		},
		"wheelchair": {
			"type": "text_bind",
			"img": "wheelchair",
			"text_bind": { "yes": "Fully accessible", "limited": "Limited access", "no": "Not accessible" }
		}
	},
	"minor": {
		"cuisine": {
			"type": "text",
			"img": "cuisine",
			"name": "Cuisine"
		},
		"description": {
			"type": "text",
			"img": "info",
			"name": "More details"
		}
	}
};

//Locales
var tsl = new OLU.ctrl.service.Translator();
$.ajax({
	url: "locales/en.yaml",
	async: false,
	dataType: 'text',
	success: function(data) {
		var locale = yaml.safeLoad(data);
		var localeName = Object.keys(locale)[0];
		tsl.addTranslation("en", locale.en);
	}
}).fail(function() { throw new Error("Error while retrieving locales file"); });

var map = L.map('map').setView([48.11, -1.67], 13);
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var f = new OLU.model.Feature({
	"type": "Feature",
	"id": "node/1250504057",
	"properties": { "type": "node", "id": "node/1250504057", "tags": {
		"shop": "clothes",
		"name": "PanierAvide's clothes",
		"description": "A cool place for buying some clothes",
		"phone": "01 23 45 67 89",
		"website": "paclothes.net",
		"contact:website": "not?awebsite",
		"email": "panier@avide.com",
		"contact:email": "lalala@.com",
		"level": "0",
		"image": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Jean_Loyer_Vue_de_Rennes.jpg",
		"mapillary": "vXUuIbaTJsPjcOe1mXJnyg",
		"mapillary:N": "Eh0yub0CP_IMlfkKMBFE_Q",
		"wikimedia_commons": "File:Beachwave Beachwear, Cocoa Beach.JPG",
		"wheelchair": "limited"
	}, "meta": {}, "relations": [] },
	"geometry": { "type": "Point", "coordinates": [-1.704077,48.1210744] }
});

//Tests
var side = OLU.view.side("side", { t: tsl.t.bind(tsl) }).addTo(map);
side.contents.feature.set(f, ftDetails, { iconFolder: "img", mapillaryClient: "eDhQTTdnRmZJNXdYZWUwRDQxc1NwdzpmYjE3YWE3MWM5ZjcyMTdm", showTags: true });
side.show("feature");
