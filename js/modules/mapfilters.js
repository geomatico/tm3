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
    	$(div).append('<div class="input-group"><span class="input-group-addon" id="basic-addon3">Round filter</span><span class="input-group-addon"><input type="checkbox" aria-label="Activate taxon"></span></div>');
    	filters[div] = {"active": false, "data": defaultData};
    };
    
    var addCircleFilter = function(div, drawnItems, map, callback) {
		$(div + " input").on("click", function() {
			toggleFilter(div, map, drawnItems, callback);
		});
    };
    
    var getFilter = function(type, layer){
    	var newFilter;
    	if(type == 'circle') {
    		newFilter = {
    			type: 'circle',
	    		lat: layer._latlng.lat,
	    		lon: layer._latlng.lng,
	    		radius: layer._mRadius
	    	};
	    }
        return newFilter;
    };
    
    var getSuitableRadius = function(zoom) {
        //should be refactored, probably to a continuous function
        if (zoom < 6) return 800000;
        else if( zoom < 9) return 100000;
        else return 20000;
        
    };
    
    var toggleFilter = function(div, map, drawnItems, callback) {
    	var active = filters[div].active;
        drawnItems.clearLayers();
    	if(active) {
    		var filter = {}; //empty filter
            
    	} else {
    		var filter = filters[div].data;
    		map.addLayer(drawnItems);
            
            filters[div].data.lat = map.getCenter().lat; //we ignore default values
            filters[div].data.lon = map.getCenter().lng;
            filters[div].data.radius =  getSuitableRadius(map.getZoom());
            //draw circle
            var circleCenter = [filters[div].data.lat, filters[div].data.lon];
            var circle = new L.circle(circleCenter, filters[div].data.radius, { clickable: false }).addTo(drawnItems);
            
            drawnItems.eachLayer(function (layer) {
                layer.editing.enable();
                layer.on('edit', function(e) {
                	filters[div].data = getFilter('circle', layer);
                    callback(null, filters[div].data);
                });
            });
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
