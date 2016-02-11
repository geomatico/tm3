/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['cartodb', 'leaflet-draw'], function() {
    "use strict";
    
    // we store filters here
    var filters = [];
    
    var defaultData = {
		type: 'circle',
		lat: 33.977646,
		lon: 4.067001,
		radius: 500000		
    };
    
    var draw = function(div, type) {
    	$(div).append('<div class="input-group"><span class="input-group-addon" id="basic-addon3">Filtre circular</span><span class="input-group-addon"><input type="checkbox" aria-label="Checkbox for following text input"></span></div>');
    	filters[div] = {"active": false, "data": defaultData};
    };
    
    var addCircleFilter = function(div, drawnItems, map, callback) {
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
		    	filters[div].data = getFilter('circle', layer);
		    	callback(null, filters[div].data);
		    });
		});
		
		//draw first circle
		var circle = new L.circle([filters[div].data.lat, filters[div].data.lon], filters[div].data.radius).addTo(drawnItems);
		
		$(div + " input").on("click", function() {
			toggleFilter(div, map, drawnItems, callback);
		});
    };
    
    var getFilter = function(type, layer){
    	var newFilter;
    	if(type = 'circle') {
    		newFilter = {
    			type: 'circle',
	    		lat: layer._latlng.lat,
	    		lon: layer._latlng.lng,
	    		radius: layer._mRadius
	    	};
	    }
        return newFilter;
    };
    
    var toggleFilter = function(div, map, drawnItems, callback) {
    	var active = filters[div].active;
    	if(active) {
    		var filter = {}; //empty filter
    		map.removeLayer(drawnItems);
    	} else {
    		var filter = filters[div].data;
    		map.addLayer(drawnItems);
    	} 
    	callback(null, filter);
    	filters[div].active = !active; 
    };
    
    return {
    	createCircle: function(div, layer, map, callback) {
    		draw(div, 'circle');
    		addCircleFilter(div, layer, map, callback);
    	}
    };
    		
});
