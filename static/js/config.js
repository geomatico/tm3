var require = (function() {
	var scripts = document.getElementsByTagName('script');
	var HERE = scripts[scripts.length-1].src.replace(/[^\/]*$/, '');
	var LIB_PATH = HERE + "lib/";
	return {
		baseUrl: HERE + "modules/",
		paths: {
			"jquery": LIB_PATH + "jquery/dist/jquery.min",
			"bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min",
            "leaflet-draw": "//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw",
            "css": LIB_PATH + "require-css/css",
            "cartodb": "//libs.cartocdn.com/cartodb.js/v3/3.15/cartodb"
		},
		shim: {
			"bootstrap": {
				deps: ["cartodb", "css!//maxcdn.bootstrapcdn.com/bootswatch/3.3.5/united/bootstrap.min.css"]
			},
			"leaflet-draw" : {
				deps: ["cartodb"]
			},
			"leaflet": {
				deps: ["css!" + LIB_PATH + "leaflet/dist/leaflet.css"]
			}
            
		}
	};
})();

