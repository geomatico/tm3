/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['text!../../sections/legends/temp.html', 'text!../../sections/legends/rain.html', 'text!../../sections/legends/landcover.html', 'leafletjs'], function(temp_leg, rain_leg, landcover_leg) {
    "use strict";

	var orto = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var positron = 	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB'
	});

  //create additional overlays
	var temperature =  L.tileLayer.wms("https://spatial.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_5',
		format: 'image/png'
		//opacity: 0.40,
		//transparent: true
	});

	var rain =  L.tileLayer.wms("https://spatial.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_12',
		format: 'image/png'
		//opacity: 0.40,
		//transparent: true
	});

    var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var euroSpaceAgency =  L.tileLayer.wms("https://maps.elie.ucl.ac.be/cgi-bin/mapserv?map=%2Fmaps_server%2FCCI%2Fmapfiles%2Flc2015_v207.map", {
		layers: 'lc2015_v2',
		format: 'image/png',
        crs: L.CRS.EPSG900913
		//opacity: 0.40,
		//transparent: true
	});

    var baseLayers = {
        "Map": positron,
        //"Map2": openTopoMap,
	    "Ortophoto": orto,
        //"Toner": stamenToner,
        "Temperature (<a id='tempLeg' data-toggle='modal' href='#textModal'>leg</a>)": temperature,
        "Rain (<a id='rainLeg' data-toggle='modal' href='#textModal'>leg</a>)": rain,
        "Land cover (<a id='landLeg' data-toggle='modal' href='#textModal'>leg</a>)": euroSpaceAgency

	};

    var buildLegendLink = function(id, page_html) {
       $(document).on("click", id, function () {
            $("#textModal .modal-body").html(page_html);
        });
    };


	// Initialise the FeatureGroup to store editable layers
	var overlayLayers = {

	};

    // external legends
    buildLegendLink("#tempLeg", temp_leg);
    buildLegendLink("#rainLeg", rain_leg);
    buildLegendLink("#landLeg", landcover_leg);

	return {
	   getBaseLayers: function() {
       		return baseLayers;
       },
       getOverlayLayers: function() {
       		return overlayLayers;
       }
	};

});
