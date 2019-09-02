/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'mapfilters', 'conf'], function(layers, mapfilters, conf) {
    "use strict";

	var wmsLayer;
    var map;

    var createMap = function(options) {

        var lat = parseInt(options.lat) ? options.lat : 0;
        var lon = parseInt(options.lon) ? options.lon : 0;
        var zoom = parseInt(options.zoom) ? parseInt(options.zoom) : 2;
        var sqlWhere = options.where ? options.where : "";

        map = L.map('map', {maxZoom: 11,minZoom: 1}).setView([lat, lon], zoom);

        wmsLayer = L.tileLayer.wms(conf.getWMSServer(), {
            layers: 'taxomap:mcnb_prod',
            attribution: "MCNB",
            format: 'image/png',
            cql_filter: sqlWhere,
            transparent: true
        });

        var overlays = layers.getOverlayLayers();
        var base = layers.getBaseLayers();
        base['Terrain'].addTo(map);
        L.control.layers(base, overlays).addTo(map);
        wmsLayer.addTo(map).bringToFront();

        return map;
    };

    var getQuotes = function(taxon, getFiltersSQL, format) {
 		if(!format) format = "csv";

        var query = taxon.levelsId[taxon.level] + "='"+taxon.id+"'";
        if(Object.getOwnPropertyNames(filters).length > 0) {
            //circular filter
            query += getFiltersSQL;
        }
        var service = conf.getWFSServer() + "request=GetFeature&typeName=taxomap:mcnb_prod&version=1.1.0" + "cqlfilter=" + encodeURIComponent(query) + "&outputFormat=" + format;
        //if(locale) service += "&LANG=" + locale;
        location.href = service;
    };

    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();

    var createGeoFilter = function(div, callback) {
        mapfilters.createCircle(div, drawnItems, map, callback);
    };

    var createSliderFilter = function(div, callback) {
      $.getJSON(conf.getApi() + "years/",
          {

          },
          function(data){
              //got results
              if(data) {
                  var minmax = [data[0].minyear, data[0].maxyear];
              } else {
                  var minmax = [1800, 2018];
              }
              mapfilters.createSlider(div, map, callback, minmax);
          });
    };

    var createComboFilter = function(div, callback) {
        var service = conf.getApi() + "unique/";
        mapfilters.createFieldValue(div, service, callback);
    };

	return {
	   setSql: function(sqlWhere) {
			return wmsLayer.setParams({'cql_filter': sqlWhere});
       },
       getApi: function() {
       		return conf.getApi();
       },
       createGeoFilter: function(div, cb) {
       		return createGeoFilter(div, cb);
       },
       createTimeSlider: function(div, cb) {
       		return createSliderFilter(div, cb);
       },
       createComboFilter: function(div, cb) {
       		return createComboFilter(div, cb);
       },
       createMap: function(options) {
       		return createMap(options);
       },
       getQuotes: function(taxon, filters, format) {
            return getQuotes(taxon, filters, format);
       }
	};

});
