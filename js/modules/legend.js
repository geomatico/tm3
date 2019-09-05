/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['i18n', 'leafletjs', 'select'], function(i18n) {
    "use strict";

   /*var phylumLegend = new cdb.geo.ui.Legend.Custom({
        title: "Legend",
        data: [
          { name: "Tracheophyta",  value: "#58A062" },
          { name: "Chordata",       value: "#F07971" },
          { name: "Mollusca",         value: "#54BFDE" },
          { name: "Arthropoda",         value: "#AAAAAA" },
          { name: "Others",          value: "#FABB5C" }
        ]
    });

   var institutionLegend = new cdb.geo.ui.Legend.Custom({
        title: "Legend",
        data: [
          { name: "IBB",  value: "#58A062" },
          { name: "MVHN", value: "#343FCE" },
          { name: "IMEDEA", value: "#F02921" },
          { name: "UB", value: "#5A9DDA" },
          { name: "MCNB", value: "#FABB5C" }
        ]
    });

   var basisLegend = new cdb.geo.ui.Legend.Custom({
        title: "Legend",
        data: [
          { name: "Non-fossil",  value: "#58A062" },
          { name: "Fossil",       value: "#F07971" }
        ]
    });

    var intensityLegend = new cdb.geo.ui.Legend.Intensity({
        title: "Legend",
        left: "1", right: "10+", color: "#FFCC00"
    });*/

    var legends = {
        'intensity': {
            style: "point",
            name: "Intensity",
            active: true
        },
        'phylum': {
            style: "point_green",
            name: "Phylum"
        }

    };

    var legendDiv;
    var wmsLayer;

    var createLegend = function(sym, parent){
        if (typeof sym === "undefined") {
            $.each(legends, function(key, value) {
                if (legends[key].active) {
                    sym = key;
                }
            });
        }

        legendDiv = L.DomUtil.create( "div", "legend", parent);
        disableEvent(legendDiv, 'click');
        disableEvent(legendDiv, 'dblclick');
        setLegend(sym);
    };

    var disableEvent = function(div, event) {
        $(div).bind(event, function(e) {
            e.stopPropagation();
        });
    }

    var setLegend = function(sym) {
        if (!legendDiv) return;
        $(legendDiv).empty();
        $(legendDiv).append("<img src='"+getLegendWMS(sym)+"'/>'");
    }

    var getLegendWMS = function(sym) {
      return wmsLayer._url + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" + wmsLayer.wmsParams.layers + "&STYLE=" + legends[sym].style;
    }

    var disableDragging = function(element, map) {
        // Disable dragging when user's cursor enters the element
        element.addEventListener('mouseover', function () {
            map.dragging.disable();
        });

        // Re-enable dragging when user's cursor leaves the element
        element.addEventListener('mouseout', function () {
            map.dragging.enable();
        });
    }

    var createSwitcher = function(map, sublayer, withLegend) {
        var switcher = L.control({position: "bottomright"});
        wmsLayer = sublayer;

        switcher.onAdd = function(map) {
            var combolegend = L.DomUtil.create( "div", "combolegend");
            disableEvent(combolegend, 'mousewheel DOMMouseScroll MozMousePixelScroll');
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

            disableDragging(combolegend, map);

            $(sel).change(function() {
                if(withLegend) setLegend(this.value);
                sublayer.setParams({'styles' : legends[this.value].style});

                // translate legend
                // should be refactored: this onchange function better be a callback in ui module
                var leg = document.getElementsByClassName("legend")[0];
                leg.lang = "";
                i18n.translateDocTree(leg);
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
