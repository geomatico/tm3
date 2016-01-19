var require = (function() {
	var scripts = document.getElementsByTagName('script');
	var HERE = scripts[scripts.length-1].src.replace(/[^\/]*$/, '');
	var LIB_PATH = HERE + "lib/";
	return {
		baseUrl: HERE + "modules/",
		paths: {
			"bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min",
            "leaflet-draw": "//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw",
            "leaflet-maskcanvas": LIB_PATH + "leaflet.maskcanvas/src/L.TileLayer.MaskCanvas",
            "quadtree": LIB_PATH + "leaflet.maskcanvas/src/QuadTree",
            "css": LIB_PATH + "require-css/css",
            "cartodb": "//libs.cartocdn.com/cartodb.js/v3/3.15/cartodb",
            "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min",
            "i18n": LIB_PATH + "i18n.js/src/i18n",
            "text": "//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min"
		},
		shim: {
			"bootstrap": {
				deps: ["jquery", "css!https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"]
			},
			"leaflet-draw" : {
				deps: ["cartodb", "css!//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw.css"]
			},
			"leaflet-maskcanvas" : {
				deps: ["cartodb", "quadtree"]
			},
			"cartodb" : {
				deps: ["css!//libs.cartocdn.com/cartodb.js/v3/3.15/themes/css/cartodb.css"]
			},
			"i18n" : {
				deps: ["text"]
			}
            
		}
	};
})();

