/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['cartodb'], function() {
    "use strict";
    	
	var hyddaBase = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
		attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});
	var orto = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
		type: 'sat',
		ext: 'jpg',
		attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
		subdomains: '1234'
	});
	var topo = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	});
	    
	var baseLayers = {
	    "Schematic": topo,
	    "Ortophoto": orto,
	    "Terrain" : hyddaBase
	};
	
     //create additional overlays
     var hillshade2 =  L.tileLayer.wms("http://www.opengis.uab.cat/cgi-bin/world/MiraMon.cgi?", {
		layers: 'glcc-world',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
	});
		
	var temperature =  L.tileLayer.wms("http://spatial-dev.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_5',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
		/*http://spatial-dev.ala.org.au/geoserver/wms?request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=worldclim_bio_5*/
	});
		
	var rain =  L.tileLayer.wms("http://spatial-dev.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_12',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
		/*http://spatial-dev.ala.org.au/geoserver/wms?request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=worldclim_bio_12*/
	});
	
	
	// Initialise the FeatureGroup to store editable layers
	var overlayLayers = {
		'Annual temperature': temperature,
		'Annual rain': rain,
		'Land Cover': hillshade2
	};
	
	return {
	   getBaseLayers: function() {
       		return baseLayers;
       },
       getOverlayLayers: function() {
       		return overlayLayers;
       } 
	};
	
});