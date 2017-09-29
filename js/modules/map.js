/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'mapfilters', 'legend', 'cartodb'], function(layers, mapfilters, legend) {
    "use strict";
	
	var cartoDBTable = 'mcnb_prod';
	var cartoDBApi = 'http://mcnb.cartodb.com/api/v2/sql?';
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
          user_name: 'mcnb',
          type: 'cartodb',
          cartodb_logo:false,
          attribution: "MCNB",
          sublayers: [{
            sql: "SELECT * FROM " + cartoDBTable + sqlWhere,
            cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }',
            interactivity: 'cartodb_id'
          }]
        }).addTo(map)
        
        .done(function(layer) {
             cartoDBSubLayer = layer.getSubLayer(0);
             layer.setZIndex(7);
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
    
    var getCircleSQL = function(circle) {
        return "ST_DWithin(the_geom::geography, ST_SetSRID(ST_MakePoint("+circle.lon+","+circle.lat+"),4326)::geography," + circle.radius + ")";
    };
    
    var getFiltersSQL = function(filters, filterArray) {
        var query = "";
        for (var property in filters) {
            if (filters.hasOwnProperty(property)) {
                var filter = filters[property].data;
                if (filters[property].active) {
                    switch (filter.type) {
                        case "circle":
                            if (filterArray.indexOf("circle") != -1) {
                                //circle query
                                query += " AND "+ getCircleSQL(filter);
                            }
                            break;
                        case "rectangle":
                            if (filterArray.indexOf("rectangle") != -1) {
                                //rectangle query
                                //query += " AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+activeFilter.lon+","+activeFilter.lat+"),ST_Point("+(activeFilter.lon+1)+","+(activeFilter.lat + 1)+")),4326))";
                            }
                            break;
                        case "fieldvalue":
                            if (filterArray.indexOf("fieldvalue") != -1) {
                                if (filter.value) {
                                    query += " AND "+ filter.field + "='" + filter.value.replace('\x27', '\x27\x27') + "'";
                                }
                            }
                            break;    
                    }
                }
            }
        }
        return query;
    };
    
    var getQuotes = function(taxon, filters, format) {
 		if(!format) format = "csv";
        
        var query = "select " + taxon.getSqlDownload(format) + " from " + cartoDBTable + " where " + taxon.levelsId[taxon.level] + "='"+taxon.id+"'";
        if(Object.getOwnPropertyNames(filters).length > 0) {
            //circular filter
            query += getFiltersSQL(filters, ["circle", "fieldvalue"]);
        }
        var service = cartoDBApi + "q=" + encodeURIComponent(query) + "&format=" + format;
        //if(locale) service += "&LANG=" + locale;
        location.href = service; 
    };
    
    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    
    var createGeoFilter = function(div, callback) {
        mapfilters.createCircle(div, drawnItems, map, callback);
    };
    
    var createComboFilter = function(div, callback) {
        var query = "select distinct __field__ AS value from " + cartoDBTable + " order by __field__";
        var service = cartoDBApi + "q=" + encodeURIComponent(query);
        mapfilters.createFieldValue(div, service, callback);
    };
    
	return {
	   setSql: function(sqlWhere) {
			return cartoDBSubLayer.setSQL("select * from " + cartoDBTable + sqlWhere);
       },
       getCartoDBTable: function() {
       		return cartoDBTable;
       },
       getCartoDBApi: function() {
       		return cartoDBApi;
       },
       createGeoFilter: function(div, cb) {
       		return createGeoFilter(div, cb);
       },
       createComboFilter: function(div, cb) {
       		return createComboFilter(div, cb);
       },
       getFiltersSQL: function(filters, filterArray) {
            return getFiltersSQL(filters, filterArray)
       },
       createMap: function(options) {
       		return createMap(options);
       },
       getQuotes: function(taxon, filters, format) {
            return getQuotes(taxon, filters, format);
       }
	};
	
});