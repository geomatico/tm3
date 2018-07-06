/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['timeslider', 'cartodb', 'leaflet-draw'], function(timeslider) {
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
    	switch(type) {
            case "circle":
                $(div).append('<div class="input-group"><span class="input-group-addon" id="basic-addon3">Round filter</span><span class="input-group-addon"><input type="checkbox" aria-label="Activate taxon"></span></div>');
                filters[div] = {"active": false, "data": defaultData};
                break;
            case "fieldvalue":
                $(div).append('<select class="selectpicker" id="fieldFilter" title="-- select filter --">'+
                              '<option value="institutioncode">Institution</option>'+
                              '<option value="basisofrecord">Basis of record</option>'+
                              '</select><select class="selectpicker" id="valueFilter"><option value="">-</option></select>');
                filters[div] = {"active": false, "data": ""};
                $('.selectpicker').selectpicker();
                break;
        }
        
    };
    
    var addCircleFilter = function(div, drawnItems, map, callback) {
		$(div + " input").on("click", function() {
			toggleFilter(div, map, drawnItems, callback);
		});
    };

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    var addSliderEvents = function(div, slider, callback) {
        filters[div] = {"active": false, "data": ""};
        slider.change(debounce(function() {
            var values = this.value.split(",");
            filters[div].data = {
    			type: 'minmax',
	    		field: 'year',
	    		min: values[0],
                max: values[1]
	    	};
            filters[div].active = true; 
            callback(null, filters);
		}, 500));
    };
    
    var addFVEvents = function(div, service, callback) {
		$(div + " #fieldFilter").on("change", function() {
            var field = $(div + " #fieldFilter").val();
            var realService = service.replace(/__field__/g, field);

			$.getJSON(realService + "&callback=?", //for JSONP,
                function(data){
                    //got results
                    if(data && data.total_rows) {
                        $(div + " #valueFilter").empty();
                        // "All" value
                        $(div + " #valueFilter").append($('<option>', {
                                value: "",
                                text: "All"
                            }));
                        for(var i = 0; i < data.rows.length; i++) {
                            if (data.rows[i].value) {
                                $(div + " #valueFilter").append($('<option>', {
                                    value: data.rows[i].value,
                                    text: data.rows[i].value
                                }));
                            }
                        }
                        $(div + " #valueFilter").selectpicker('refresh');
                    }
                });
		});
        
        $(div + " #valueFilter").on("change", function() {
            filters[div].data = {
    			type: 'fieldvalue',
	    		field: $(div + " #fieldFilter").val(),
	    		value: $(div + " #valueFilter").val()
	    	};
            filters[div].active = true; 
            callback(null, filters);
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
    
    var getSuitableRadius = function(map) {
        var bounds = map.getBounds();
        var height = bounds._northEast.lat - bounds._southWest.lat;
        return height * 20000;
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
            filters[div].data.radius =  getSuitableRadius(map);
            //draw circle
            var circleCenter = [filters[div].data.lat, filters[div].data.lon];
            var circle = new L.circle(circleCenter, filters[div].data.radius, { clickable: false }).addTo(drawnItems);
            
            drawnItems.eachLayer(function (layer) {
                layer.editing.enable();
                layer.on('edit', function(e) {
                	filters[div].data = getFilter('circle', layer);
                    callback(null, filters);
                });
            });
    	}
        filters[div].active = !active; 
    	callback(null, filters);
    };
    
    return {
    	createCircle: function(div, layer, map, callback) {
    		draw(div, 'circle');
    		addCircleFilter(div, layer, map, callback);
    	},
        createFieldValue: function(div, service, callback) {
    		draw(div, 'fieldvalue');
    		addFVEvents(div, service, callback);
    	},
        createSlider: function(div, map, callback) {
    		var slider = timeslider.create(div, map, callback);
            addSliderEvents(div, slider, callback);
    	}
    };
    		
});
