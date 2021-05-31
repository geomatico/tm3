/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['i18n', 'maplayers', 'mapfilters', 'conf', 'legend', 'taxon'], function(i18n, layers, mapfilters, conf, legend, taxon) {
    "use strict";

	var wmsLayer;
    var map;
    var infoCallback;
    var cql_filter;

    var createMap = function(options, callback) {

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
        infoCallback = callback;

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
            var err = typeof data === 'json' ? null : data;
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
              info_format: 'application/json',
              feature_count: '25',
              cql_filter: cql_filter ? cql_filter : ''
            };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        var url = conf.getWMSServer() + L.Util.getParamString(params, conf.getWMSServer(), true);
        return url;
      };

     var drawFeatureInfo = function (features) {
        var html = $( "<ul/>");
         for(var i=0; i<features.length; i++) {
            var li = $( "<li/>");
            li.append($("<div/>", { html: "<b>" + features[i].properties.catalognumber + "</b>"} ));
            var taxonName = features[i].properties.species;
            if(!taxonName) taxonName = features[i].properties.genus;
            if(!taxonName) taxonName = features[i].properties.family;
            li.append($("<div/>", { html: taxonName} ));
            var link =  $( "<a/>", {
                html: i18n.t("-- activate taxon"),
                href: "#"
            });

            link = setTaxonLink(link, features[i].properties);
            link.appendTo(li);
            li.append($("<div/>", { html: features[i].properties.institutioncode} ));
            li.appendTo(html);
        }
        return html;
     }

    var setTaxonLink = function(el, feature) {
         var taxonId = feature.speciesid;
         var level = 7;
         if(!taxonId) {
             taxonId = feature.genusid;
             level = 6;
         }
		 el.data("id", taxonId);
		 el.on("click", function(){
			infoCallback(new taxon($(this).data("id"), level));
		});

        return el;
    };

      var showGetFeatureInfo = function (err, latlng, content) {
        //if (err) { console.log(err); return; }

        var features = content.features;
        if(features.length == 0) content = "No s'ha trobat informació en aquest punt";
        else content = $(drawFeatureInfo(features))[0];

        // Otherwise show the content in a popup, or something.
        var popup = L.popup({ maxWidth: 800, maxHeight:600})
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
	        //hack for GetFeatureInfo
	        cql_filter = sqlWhere;
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
       createMap: function(options, cb) {
       		return createMap(options, cb);
       },
       getQuotes: function(taxon, filters, format) {
            return getQuotes(taxon, filters, format);
       }
	};

});
