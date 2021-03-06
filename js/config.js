var require = (function() {
	var scripts = document.getElementsByTagName('script');
	var HERE = scripts[scripts.length-1].src.replace(/[^\/]*$/, '');
	var LIB_PATH = HERE + "lib/";
	return {
		baseUrl: HERE + "modules/",
		paths: {
			"bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min",
            "leaflet-draw": "//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw",
            "css": LIB_PATH + "require-css/css",
			"leafletjs": "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet",
            "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min",
            "i18n": LIB_PATH + "i18n.js/src/i18n",
            "text": "//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min",
			"select": "//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.10.0/js/bootstrap-select.min",
			"typeahead": "//cdnjs.cloudflare.com/ajax/libs/bootstrap-3-typeahead/4.0.2/bootstrap3-typeahead.min",
			"mustache": "//cdnjs.cloudflare.com/ajax/libs/mustache.js/2.3.0/mustache.min",
			"c3js": "//cdnjs.cloudflare.com/ajax/libs/c3/0.5.3/c3.min",
			"d3": "//cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min",
			"slider": "//cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/10.0.2/bootstrap-slider.min"
		},
		shim: {
			"bootstrap": {
				deps: ["jquery", "css!https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"]
			},
			"leaflet-draw" : {
				deps: ["leafletjs", "css!//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"]
			},
			"leafletjs" : {
				deps: ["css!//cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.css"]
			},
			"i18n" : {
				deps: ["text"]
			},
			"select": {
				deps: ["bootstrap", "css!https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.10.0/css/bootstrap-select.min.css"]
			},
			"typeahead": {
				deps: ["bootstrap"]
			},
			"c3js": {
				deps: ["d3", "css!https://cdnjs.cloudflare.com/ajax/libs/c3/0.5.3/c3.min.css"]
			},
			"slider" : {
				deps: ["bootstrap", "css!//cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/10.0.2/css/bootstrap-slider.min.css"]
			}

		}
	};
})();
