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
        left: "1", right: "10+", color: "#FFCC00"
    });
    
    var legends = {
        'intensity': {
            cdbLegend: intensityLegend,
            cartoCSS: "#mcnb_dev{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }",
            name: "Intensitat",
            active: true
        },
        'cluster': {
            cdbLegend: bubbleLegend,
            cartoCSS: "#mcnb_dev{ marker-width: 12; marker-fill: #FD8D3C; marker-line-width: 1.5; marker-fill-opacity: 1; marker-line-opacity: 1; marker-line-color: #fff; marker-allow-overlap: true;  [src = 'bucketC'] { marker-line-width: 5; marker-width: 24;} [src = 'bucketB'] { marker-line-width: 5; marker-width: 44;}[src = 'bucketA'] { marker-line-width: 5; marker-width: 64;} }",
            name: "Cluster"
        },
        'phylum': {
            cdbLegend: phylumLegend,
            cartoCSS: '#mcnb_dev { marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-allow-overlap: true; #mcnb_dev[phylum="Tracheophyta"] { marker-fill: #58A062;} #mcnb_dev[phylum="Chordata"] { marker-fill: #F07971;}#mcnb_dev[phylum="Mollusca"] { marker-fill: #54BFDE;}#mcnb_dev[phylum="Arthropoda"] { marker-fill: #AAAAAA;}#mcnb_dev { marker-fill: #FABB5C;} }',
            name: "Fílum"
        }
    };
    
    var showLegend = function(sym){
        if (typeof sym === "undefined") {
            $.each(legends, function(key, value) {           
                if (legends[key].active) {
                    sym = key;
                }
            });
        }
        legends[sym].cdbLegend.addTo("#legends");
    };

    var createSwitcher = function(map, cssCallback, withLegend) {    
        var switcher = L.control({position: "bottomright"});
        switcher.onAdd = function(map) {
            var combo = L.DomUtil.create( "div", "cssSelector");
            var sel =  L.DomUtil.create( "select", "form-control", combo );
            $.each(legends, function(key, value) {
                var option =  L.DomUtil.create( "option", "", sel );
                option.value = key;
                option.innerHTML = value.name;
                
                if (legends[key].active) {
                    if(withLegend) showLegend(key);
                    option.selected = "selected";
                }
            });
            
            $(sel).change(function() {
                if(withLegend) showLegend(this.value);
                cssCallback(legends[this.value].cartoCSS);
            });                
            
            return combo;
        };
        switcher.addTo(map);
    };
    
	return {
       createSwitcher: function(map, cb) {
       		return createSwitcher(map, cb, true);
       },
       createLegend: function(sym) {
       		return showLegend(sym);
       }
	};
	
});