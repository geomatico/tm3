/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['cartodb', 'select'], function() {
    "use strict";

   var phylumLegend = new cdb.geo.ui.Legend.Custom({
        title: "Legend",
        data: [
          { name: "Tracheophyta",  value: "#58A062" },
          { name: "Chordata",       value: "#F07971" },
          { name: "Mollusca",         value: "#54BFDE" },
          { name: "Arthropoda",         value: "#AAAAAA" },
          { name: "Altres",          value: "#FABB5C" }
        ]
    });

    var intensityLegend = new cdb.geo.ui.Legend.Intensity({
        title: "Legend",
        left: "1", right: "10+", color: "#FFCC00"
    });
    
    var legends = {
        'intensity': {
            cdbLegend: intensityLegend,
            cartoCSS: "#mcnb_dev{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }",
            name: "Intensity",
            active: true
        },
        'phylum': {
            cdbLegend: phylumLegend,
            cartoCSS: '#mcnb_dev { marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-allow-overlap: true; #mcnb_dev[phylum="Tracheophyta"] { marker-fill: #58A062;} #mcnb_dev[phylum="Chordata"] { marker-fill: #F07971;}#mcnb_dev[phylum="Mollusca"] { marker-fill: #54BFDE;}#mcnb_dev[phylum="Arthropoda"] { marker-fill: #AAAAAA;}#mcnb_dev { marker-fill: #FABB5C;} }',
            name: "Phylum"
        }
    };
    
    var legendDiv;
    
    var createLegend = function(sym, parent){
        if (typeof sym === "undefined") {
            $.each(legends, function(key, value) {           
                if (legends[key].active) {
                    sym = key;
                }
            });
        }

        legendDiv = L.DomUtil.create( "div", "legend", parent);
        setLegend(sym);
    };
    
    var setLegend = function(sym) {
        if (!legendDiv) return;
        $(legendDiv).empty();
        $(legendDiv).append(legends[sym].cdbLegend.render().el);
    }

    var createSwitcher = function(map, sublayer, withLegend) {    
        var switcher = L.control({position: "bottomright"});
        switcher.onAdd = function(map) {
            var combolegend = L.DomUtil.create( "div", "combolegend");
            var combo = L.DomUtil.create( "div", "cssSelector", combolegend);
            var sel =  L.DomUtil.create( "select", "form-control dropup", combo );
            $.each(legends, function(key, value) {
                var option =  L.DomUtil.create( "option", "", sel );
                option.value = key;
                option.innerHTML = value.name;
                
                if (legends[key].active) {
                    if(withLegend) createLegend(key, combolegend);
                    option.selected = "selected";
                }
            });
            
            $(sel).change(function() {
                if(withLegend) setLegend(this.value);
                sublayer.setCartoCSS(legends[this.value].cartoCSS);
                //sublayer.infowindow.set('template', legends[this.value].template);
            });
            
            // make select responsive and mobile-friendly with https://silviomoreto.github.io/bootstrap-select/
            $(sel).selectpicker({
                size: 4
            });
            
            return combolegend;
        };
        switcher.addTo(map);
        
    };
    
	return {
       createSwitcher: function(map, sublayer, withLegend) {
       		return createSwitcher(map, sublayer, withLegend);
       }
	};
	
});