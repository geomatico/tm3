/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['text!../../sections/legends/temp.html', 'text!../../sections/legends/rain.html', 'text!../../sections/legends/landcover.html', 'leafletjs'], function(temp_leg, rain_leg, landcover_leg) {
    "use strict";

	var hyddaBase = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
		attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});
    var stamenTerrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 18,
        ext: 'png'
    });
    var stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });
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

    var modisTerra = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2016-01-29/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png', {
        attribution: 'Todo',
        format: 'image/png'
    });

    var NASAGIBS_ModisTerraChlorophyll = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Chlorophyll_A/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
        attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
        minZoom: 1,
        maxZoom: 7,
        format: 'png',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level',
    });

    var baseLayers = {
        "Map": positron,
        //"Map2": openTopoMap,
	    "Ortophoto": orto,
        //"Toner": stamenToner,
	    "Terrain" : stamenTerrain,
        //"Stamen Terrain": stamenTerrain,
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
