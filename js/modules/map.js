/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'mapfilters', 'conf', 'legend'], function(layers, mapfilters, conf, legend) {
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
            format: 'image/png8',
            cql_filter: sqlWhere,
            transparent: true,
            zIndex: 100 //must always be on front
        });

        map.on('click', getFeatureInfo);

        legend.createSwitcher(map, wmsLayer, true);

        var overlays = layers.getOverlayLayers();
        var base = layers.getBaseLayers();
        base['Terrain'].addTo(map);
        L.control.layers(base, overlays).addTo(map);

        wmsLayer.addTo(map);

        return map;
    };

    var getFeatureInfo = function (evt) {
        // Make an AJAX request to the server and hope for the best
        var url = getFeatureInfoUrl(evt.latlng),
            showResults = L.Util.bind(showGetFeatureInfo);
        $.ajax({
          url: url,
          success: function (data, status, xhr) {
            var err = typeof data === 'string' ? null : data;
            showResults(err, evt.latlng, data);
          },
          error: function (xhr, status, error) {
            showResults(error);
          }
        });
      };

     var getFeatureInfoUrl = function (latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = map.latLngToContainerPoint(latlng, map.getZoom()),
            size = map.getSize(),

            params = {
              request: 'GetFeatureInfo',
              service: 'WMS',
              srs: 'EPSG:4326',
              styles: wmsLayer.wmsParams.styles,
              transparent: wmsLayer.wmsParams.transparent,
              version: wmsLayer.wmsParams.version,
              format: wmsLayer.wmsParams.format,
              bbox: map.getBounds().toBBoxString(),
              height: size.y,
              width: size.x,
              layers: wmsLayer.wmsParams.layers,
              query_layers: wmsLayer.wmsParams.layers,
              info_format: 'text/html'
            };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        var url = conf.getWMSServer() + L.Util.getParamString(params, conf.getWMSServer(), true);
        return url;
      };

      var showGetFeatureInfo = function (err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error

        // Otherwise show the content in a popup, or something.
        L.popup({ maxWidth: 800})
          .setLatLng(latlng)
          .setContent(content)
          .openOn(map);
      };

    var getQuotes = function(taxon, filters, format) {
 		   if(!format) format = "csv";

        var query = taxon.levelsId[taxon.level] + "='"+taxon.id+"'";
        if(Object.getOwnPropertyNames(filters).length > 0) {
            //circular filter
            query += filters;
        }
        var service = conf.getWFSServer() + "request=GetFeature&typeName=taxomap:mcnb_prod&version=1.0.0" + "&cql_filter=" + encodeURIComponent(query) + "&outputFormat=" + format;
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

    var createComboFilter = function(div, callback, activeFilters) {
        var service = conf.getApi() + "unique/";
        mapfilters.createFieldValue(div, service, callback, activeFilters);
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
       createComboFilter: function(div, cb, activeFilters) {
       		return createComboFilter(div, cb, activeFilters);
       },
       createMap: function(options) {
       		return createMap(options);
       },
       getQuotes: function(taxon, filters, format) {
            return getQuotes(taxon, filters, format);
       }
	};

});
