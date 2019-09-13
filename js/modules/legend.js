/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['i18n', 'leafletjs', 'select'], function(i18n) {
    "use strict";

    var legends = {
        'intensity': {
            style: "point_intensity",
            name: "Intensity",
            active: true
        },
        'phylum': {
            style: "point_phylum",
            name: "Phylum"
        },
        'basisofrecord': {
            style: "point_fossil",
            name: "Basis of Record"
        },
        'institutioncode': {
            style: "point_institution",
            name: "Institution"
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
        $(legendDiv).append("<div class='image-legend'><img src='"+getLegendWMS(sym)+"'/></div>");
    }

    var getLegendWMS = function(sym) {
      return wmsLayer._url + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=fontName:Arial;fontAntiAliasing:true&LAYER=" + wmsLayer.wmsParams.layers + "&STYLE=" + legends[sym].style;
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
