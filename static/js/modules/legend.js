/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['cartodb'], function() {
    "use strict";

    var phylumLegend = new cdb.geo.ui.Legend.Custom({
        title: "Llegenda (fílum)",
        data: [
          { name: "Tracheophyta",  value: "#58A062" },
          { name: "Chordata",       value: "#F07971" },
          { name: "Mollusca",         value: "#54BFDE" },
          { name: "Arthropoda",         value: "#AAAAAA" },
          { name: "Altres",          value: "#FABB5C" }
        ]
    });
    
    var bubbleLegend = new cdb.geo.ui.Legend.Bubble({
        title: "Llegenda (clúster)",
        min: 21, max: 20, color: "red"
    });

    var intensityLegend = new cdb.geo.ui.Legend.Intensity({
        title: "Llegenda (intensitat)",
        left: "1", right: "10", color: "#FFCC00"
    });
    
    var legends = { 'phylum': phylumLegend, 'cluster': bubbleLegend, 'intensity': intensityLegend};
    
	var create = function(div, sym) {

	    legends[sym].addTo(div);
	      
	      		
		//var combo = L.DomUtil.create( "ul", "dropdown-menu cssSelector");
        //var  li =  L.DomUtil.create( "li", null, combo );
        //var  a =  L.DomUtil.create( "a" );

		var sel = L.DomUtil.create("div", "cssSelector");
		sel.innerHTML = '<br/><select><option>Fílum</option><option>Densitat</option><option>Cluster</option></select>';
		$(".cartodb-legend").append(sel);
			
	};
    
	return {
       getCartoCss: function(symbology) {
       		return legends[symbology].cartocss;
       },
       create: function(div, symbology) {
       		return create(div, symbology);
       }
	};
	
});