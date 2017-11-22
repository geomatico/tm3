/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'mapfilters', 'leaflet'], function(layers, mapfilters) {
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
        
        var gbif = L.tileLayer('https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=classic.poly&bin=hex&hexPerTile=70&publishingOrg=e8eada63-4a33-44aa-b2fd-4f71efb222a0');
        gbif.on("load",function() { $(".mapLoading").hide() }).addTo(map);
        var overlays = [gbif];
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