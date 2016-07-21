/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['cartodb'], function() {
    "use strict";
    	
	var hyddaBase = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
		//attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        attribution: 'Tiles courtesy of OpenStreetMap Sweden &mdash; Map data &copy; OpenStreetMap'
	});
	var orto = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
	var topo = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
		//attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        attribution: 'Map tiles by Stamen Design, CC BY 3.0 &mdash; Map data &copy; OpenStreetMap',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	});
    var positron = 	L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB'
	});
	    
	var baseLayers = {
	    "Schematic": topo,
        "Topographic": positron,
	    "Ortophoto": orto,
	    "Terrain" : hyddaBase
	};
	
     //create additional overlays
     /*var hillshade2 =  L.tileLayer.wms("http://www.opengis.uab.cat/cgi-bin/world/MiraMon.cgi?", {
		layers: 'glcc-world',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
	});
		
	var temperature =  L.tileLayer.wms("http://spatial-dev.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_5',
		format: 'image/png',
		opacity: 0.40,
		transparent: true
	});
		
	var rain =  L.tileLayer.wms("http://spatial-dev.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_12',
		format: 'image/png',
		opacity: 0.40,
		transparent: true
	});*/
	
	
	// Initialise the FeatureGroup to store editable layers
	var overlayLayers = {
		//'Annual temperature': temperature,
		//'Annual rain': rain,
		//'Land Cover': hillshade2
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