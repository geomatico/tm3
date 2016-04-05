/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['cartodb', 'leaflet-draw'], function() {
    "use strict";
    
    // we store filters here
    var filters = [];
    
    // we store controls here
    var controls = [];    
    
    var defaultData = {
		type: 'circle',
		lat: 33.977646,
		lon: 4.067001,
		radius: 500000		
    };
    
    var draw = function(div, type) {
    	$(div).append('<div class="input-group"><span class="input-group-addon" id="basic-addon3">Round filter</span><span class="input-group-addon"><input type="checkbox" aria-label="Checkbox for following text input"></span></div>');
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
        
        controls[div] = drawControl;
		
		map.on('draw:edited', function (e) {
		    var layers = e.layers;
		    layers.eachLayer(function (layer) {
		    	filters[div].data = getFilter('circle', layer);
		    	callback(null, filters[div].data);
		    });
		});
		
		//draw first circle
        var circleCenter = [filters[div].data.lat, filters[div].data.lon];
		var circle = new L.circle(circleCenter, filters[div].data.radius, { clickable: false }).addTo(drawnItems);
		
		$(div + " input").on("click", function() {
			toggleFilter(div, map, drawnItems, callback);
		});
    };
    
    var featureInView = function(feat, map, partially) {
        if(map.getBounds().contains(feat.getBounds())) return true;
        if(map.getBounds().intersects(feat.getBounds())) return partially; //partially contains
        return false;
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
    
    var toggleFilter = function(div, map, drawnItems, callback) {
    	var active = filters[div].active;
    	if(active) {
    		var filter = {}; //empty filter
    		map.removeLayer(drawnItems);
            map.removeControl(controls[div]);
            
    	} else {
    		var filter = filters[div].data;
    		map.addLayer(drawnItems);
            map.addControl(controls[div]);
            
            //if circle is not on the map, we should move to there?
            /*var data = filters[div].data;
            var circleCenter = [data.lat, data.lon];
            var circle = new L.circle(circleCenter, data.radius);
            if(!featureInView(circle, map)) map.panTo(circleCenter);*/
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
