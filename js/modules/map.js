/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'mapfilters', 'legend', 'conf', 'cartodb'], function(layers, mapfilters, legend, conf) {
    "use strict";

	var cartoDBSubLayer;
    var map;
    
    var createMap = function(options) {
        
        var lat = parseInt(options.lat) ? options.lat : 0;
        var lon = parseInt(options.lon) ? options.lon : 0;
        var zoom = parseInt(options.zoom) ? parseInt(options.zoom) : 2;
        var sqlWhere = options.where ? options.where : "";
        
        map = L.map('map', {maxZoom: 13,minZoom: 1}).setView([lat, lon], zoom);
        
        // create a layer with 1 sublayer
        cartodb.createLayer(map, {
          user_name: conf.getUser(),
          type: 'cartodb',
          cartodb_logo:false,
          attribution: "MCNB",
          sublayers: [{
            sql: "SELECT * FROM " + conf.getTable() + sqlWhere,
            cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }',
            interactivity: 'cartodb_id'
          }]
        }).addTo(map)
        
        .done(function(layer) {
             cartoDBSubLayer = layer.getSubLayer(0);
             layer.setZIndex(20);
             legend.createSwitcher(map, cartoDBSubLayer, true);
             layer.bind('loading', function() {
                 $(".mapLoading").show()
             });
             layer.bind('load',  function() {
                 $(".mapLoading").hide();
             });
             // info window
             cdb.vis.Vis.addInfowindow(map, layer.getSubLayer(0), ['kingdom', 'class', 'family', 'scientificname', 'catalognumber']);
             
         }).on('error', function(err) {
                console.log('cartoDBerror: ' + err);
         });
    
        var overlays = layers.getOverlayLayers();
        var base = layers.getBaseLayers();
        base['Terrain'].addTo(map);
        L.control.layers(base, overlays).addTo(map);
    };
    
    var getQuotes = function(taxon, getFiltersSQL, format) {
 		if(!format) format = "csv";
        
        var query = "select " + taxon.getSqlDownload(format) + " from " + conf.getTable() + " where " + taxon.levelsId[taxon.level] + "='"+taxon.id+"'";
        if(Object.getOwnPropertyNames(filters).length > 0) {
            //circular filter
            query += getFiltersSQL;
        }
        var service = conf.getApi() + "q=" + encodeURIComponent(query) + "&format=" + format;
        //if(locale) service += "&LANG=" + locale;
        location.href = service; 
    };
    
    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    
    var createGeoFilter = function(div, callback) {
        mapfilters.createCircle(div, drawnItems, map, callback);
    };
    
    var createSliderFilter = function(div, callback) {
        var q = "select max(year) as maxyear, min(year) as minyear from " + conf.getTable();
        $.getJSON(conf.getApi() + "callback=?", //for JSONP
            {
              q: q
            },
            function(data){
                //got results
                if(data && data.total_rows) {
                    var minmax = [data.rows[0].minyear, data.rows[0].maxyear];
                } else {
                    var minmax = [1800, 2018];
                }
                mapfilters.createSlider(div, map, callback, minmax);
            });        
    };
    
    var createComboFilter = function(div, callback) {
        var query = "select distinct __field__ AS value from " + conf.getTable() + " order by __field__";
        var service = conf.getApi() + "q=" + encodeURIComponent(query);
        mapfilters.createFieldValue(div, service, callback);
    };
    
	return {
	   setSql: function(sqlWhere) {
			return cartoDBSubLayer.setSQL("select * from " + conf.getTable() + sqlWhere);
       },
       getCartoDBTable: function() {
       		return conf.getTable();
       },
       getCartoDBApi: function() {
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