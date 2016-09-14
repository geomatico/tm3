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
        
        var lat = options.lat ? options.lat : 0;
        var lon = options.lon ? options.lon : 0;
        var zoom = options.zoom ? options.zoom : 2;
        var sqlWhere = options.where ? options.where : "";
        
        map = L.map('map', {maxZoom: 13,minZoom: 1}).setView([lat, lon], zoom);
        
        // ONLY FOR EXPO! disable attribution links    
        $(".leaflet-control-attribution").bind('DOMSubtreeModified', function() {
            $(".leaflet-control-attribution a").click(function(e) {
                e.preventDefault();
            });
        }); 
        
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
    
    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    
    var createFilter = function(div, callback) {
        mapfilters.createCircle(div, drawnItems, map, callback);
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
       createFilter: function(div, cb) {
       		return createFilter(div, cb);
       },
       createMap: function(options) {
       		return createMap(options);
       }
	};
	
});