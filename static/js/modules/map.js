/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['maplayers', 'cartodb', 'leaflet-draw', 'leaflet-maskcanvas'], function(layers) {
    "use strict";
    	
	var map = L.map('map').setView([29.085599, 0.966797], 4);
	
	var cartoDBTable = 'mcnb_prod';
	var cartoDBApi = 'http://mcnb.cartodb.com/api/v2/sql?';
	var cartoDBSubLayer;
	    
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
	map.addLayer(drawnItems);
	
	var drawControl = new L.Control.Draw({
		draw: false,
	    edit: {
	        featureGroup: drawnItems,
	        remove: false
	    }
	});
	map.addControl(drawControl);
	
	var radius = 50000;
	var center = [39.977646, 4.067001];
	var circle = null;
	
	//mask
	var maskLayer = L.TileLayer.maskCanvas({ radius: radius });
	maskLayer.setZIndex(100).setData([center]);
	maskLayer.on('load', function() {
		//default editable polygon
		if(circle == null) circle = new L.circle(center, radius).addTo(drawnItems);
	});
	//map.addLayer(maskLayer); // we don't want it as default
	
	var overlays = layers.getOverlayLayers();
	var base = layers.getBaseLayers();
	overlays['-mask-'] = maskLayer;
	base['Terrain'].addTo(map);
	L.control.layers(base, overlays).addTo(map);	
	
	//var circleDrawer = new L.Draw.Circle(map, drawControl.options.circle).enable();
	
	return {
		setSql: function(sqlWhere) {
			return cartoDBSubLayer.setSQL("select * from " + cartoDBTable + sqlWhere);
       },
       getCartoDBTable: function() {
       		return cartoDBTable;
       },
       getCartoDBApi: function() {
       		return cartoDBApi;
       } 
	};
	
});