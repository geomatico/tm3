/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['cartodb', 'leaflet-draw', 'leaflet-maskcanvas'], function() {
	
	var map = L.map('map').setView([29.085599, 0.966797], 4);
	
	var terrain = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
		maxZoom: 8
	});
	var orto = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
		type: 'sat',
		ext: 'jpg',
		attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
		subdomains: '1234'
	}).addTo(map);
	var topo = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	});
	    
	var baseLayers = {
	    "Schematic": topo,
	    "Ortophoto": orto,
	    "Terrain" : terrain
	};
	    
	// create a layer with 1 sublayer
	var cartoLayer = cartodb.createLayer(map, {
	  user_name: 'mcnb',
	  type: 'cartodb',
	  sublayers: [{
	    sql: "SELECT * FROM mcnb_prod",
	    cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }',
        interactivity: 'cartodb_id'
	  }]
	}).addTo(map)
	
	.done(function(layer) {
	     layer.setZIndex(7);
	     // info window
	     // if we need a different template: http://requirejs.org/docs/download.html#text
	     /*var sublayer = layer.getSubLayer(0);
	     sublayer.infowindow.set('template', $('#infowindow_template').html());*/
	     cdb.vis.Vis.addInfowindow(map, layer.getSubLayer(0), ['kingdom', 'phylum', 'class', '_order', 'family', 'genus', 'scientificname', 'locality', 'cartodb_id']);
     }).on('error', function(err) {
            console.log('cartoDBerror: ' + err);
     });
     
     //create additional overlays
     var hillshade2 =  L.tileLayer.wms("http://www.opengis.uab.cat/cgi-bin/world/MiraMon.cgi?", {
		layers: 'glcc-world',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
	});
		
	var temperature =  L.tileLayer.wms("http://spatial-dev.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_5',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
		/*http://spatial-dev.ala.org.au/geoserver/wms?request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=worldclim_bio_5*/
	});
		
	var rain =  L.tileLayer.wms("http://spatial-dev.ala.org.au/geoserver/wms?", {
		layers: 'worldclim_bio_12',
		format: 'image/png',
		opacity: 0.40,
		transparent: true,
		/*http://spatial-dev.ala.org.au/geoserver/wms?request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=worldclim_bio_12*/
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
	
	var overlayLayers = {
		'Annual temperature': temperature,
		'Annual rain': rain,
		'Land Cover': hillshade2,
		'-mask-': maskLayer
		};
	
	L.control.layers(baseLayers, overlayLayers).addTo(map);	
	
	//var circleDrawer = new L.Draw.Circle(map, drawControl.options.circle).enable();
	
});