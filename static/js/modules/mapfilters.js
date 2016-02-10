/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['cartodb', 'leaflet-draw'], function() {
    "use strict";
    
    var draw = function(div, layer, map) {
    	$(div).append('<div class="input-group"><span class="input-group-addon" id="basic-addon3">Filtre circular</span><span class="input-group-addon"><input type="checkbox" aria-label="Checkbox for following text input"></span></div>');
    };
    
    var addEvents = function(div, drawnItems, map, callback) {
		var drawControl = new L.Control.Draw({
			draw: false,
		    edit: {
		        featureGroup: drawnItems,
		        remove: false
		    }
		});
		map.addControl(drawControl);
		
		map.on('draw:edited', function (e) {
		    var layers = e.layers;
		    layers.eachLayer(function (layer) {
		    	var newFilter = {
		    		lat: layer._latlng.lat,
		    		lon: layer._latlng.lng,
		    		radius: layer._mRadius
		    	};
		        callback(null, newFilter);
		    });
		});	
		
		var radius = 50000;
		var center = [39.977646, 4.067001];
		var circle = null;
		
		if(circle == null) circle = new L.circle(center, radius).addTo(drawnItems); 
		
		$(div + " input").on("click", function() {
			map.addLayer(drawnItems);
		}); 	
    };
    
    return {
    	create: function(div, layer, map, callback) {
    		draw(div);
    		addEvents(div, layer, map, callback);
    	}
    };
    		
});
