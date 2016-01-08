var require = (function() {
	var scripts = document.getElementsByTagName('script');
	var HERE = scripts[scripts.length-1].src.replace(/[^\/]*$/, '');
	var LIB_PATH = HERE + "lib/";
	return {
		baseUrl: HERE + "modules/",
		paths: {
			"bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min",
            "leaflet-draw": "//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw",
            "css": LIB_PATH + "require-css/css",
            "cartodb": "//libs.cartocdn.com/cartodb.js/v3/3.15/cartodb",
            "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min"
		},
		shim: {
			"bootstrap": {
				deps: ["jquery", "css!https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"]
			},
			"leaflet-draw" : {
				deps: ["cartodb", "css!//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw.css"]
			},
			"cartodb" : {
				deps: ["css!//libs.cartocdn.com/cartodb.js/v3/3.15/themes/css/cartodb.css"]
			}
            
		}
	};
})();

