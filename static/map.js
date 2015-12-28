var map = L.map('map').setView([29.085599, 0.966797], 3);
var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
    }).addTo(map);
    
// create a layer with 1 sublayer
cartodb.createLayer(map, {
  user_name: 'mcnb',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM mcnb_dev",
    cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }'
  }]
}).addTo(map);