/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'mapfilters', 'legend', 'cartodb'], function(layers, mapfilters, legend) {
    "use strict";
    
    var map = L.map('map').setView([29.085599, 0.966797], 4);
	
	var cartoDBTable = 'mcnb_prod';
	var cartoDBApi = 'http://mcnb.cartodb.com/api/v2/sql?';
	var cartoDBSubLayer;
    
    var setCartoCSS = function(css) {
        return cartoDBSubLayer.setCartoCSS(css);
    };
    
    // create a layer with 1 sublayer
	cartodb.createLayer(map, {
	  user_name: 'mcnb',
	  type: 'cartodb',
	  sublayers: [{
	    sql: "SELECT * FROM " + cartoDBTable,
	    cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }',
        interactivity: 'cartodb_id'
	  }]
	}).addTo(map)
	
	.done(function(layer) {
		 cartoDBSubLayer = layer.getSubLayer(0);
	     layer.setZIndex(7);
         legend.createSwitcher(map, setCartoCSS);
         layer.bind('loading', function() {
             $(".mapLoading").show()
         });
         layer.bind('load',  function() {
             $(".mapLoading").hide();
         });
	     // info window
	     // if we need a different template: http://requirejs.org/docs/download.html#text
	     /*var sublayer = layer.getSubLayer(0);
	     sublayer.infowindow.set('template', $('#infowindow_template').html());*/
	     cdb.vis.Vis.addInfowindow(map, layer.getSubLayer(0), ['kingdom', 'phylum', 'class', '_order', 'family', 'genus', 'scientificname', 'locality', 'cartodb_id']);
     }).on('error', function(err) {
            console.log('cartoDBerror: ' + err);
     });
     
    
 	 // Initialise the FeatureGroup to store editable layers
	 var drawnItems = new L.FeatureGroup();
		   
     var createFilter = function(div, callback) {
		mapfilters.createCircle(div, drawnItems, map, callback);
	};
	
	var overlays = layers.getOverlayLayers();
	var base = layers.getBaseLayers();
	base['Terrain'].addTo(map);
	L.control.layers(base, overlays).addTo(map);
    
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
       }
	};
	
});