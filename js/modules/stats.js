/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['i18n', 'c3js', 'd3', 'conf', 'leafletjs'], function(i18n, c3, d3, conf) {
    "use strict";

    function getQuery(taxon, type, filters) {

        var level = taxon.level;
        var childrenLevel = (taxon.levels[level+1]) ? level + 1 : level;
        var parent = level ? "," + taxon.levelsId[level-1] + " as parent " : "";
        var parent2 = parent ? ", parent " : "";

        if (type == "subtaxa") {
          var q = conf.getApi() + "stats/taxon/" + taxon.id + "/" + taxon.level + "/?";
          if(filters) q += getFiltersREST(filters, ["circle", "fieldvalue", "minmax"]);
        }  else {
            // any "normal" field that doesn't require transformation
            var q = conf.getApi() + "stats/" + type + "/" + taxon.id + "/" + taxon.level + "/?";
            if(filters) q += getFiltersREST(filters, ["circle", "fieldvalue", "minmax"]);
        }

        return q;
    };

    var getCircleSQL = function(circle) {
        // for some reason WFS 1.0 flips the coordinates (lon lat)
        return "DWITHIN(geom,Point("+circle.lon+" "+circle.lat+")," + circle.radius + ",meters)";
        //return "ST_DWithin(the_geom::geography, ST_SetSRID(ST_MakePoint("+circle.lon+","+circle.lat+"),4326)::geography," + circle.radius + ")";
    };

    var getFiltersSQL = function(filters, filterArray) {
        var query = "";
        for (var property in filters) {
            if (filters.hasOwnProperty(property)) {
                var filter = filters[property].data;
                if (filters[property].active) {
                    switch (filter.type) {
                        case "circle":
                            if (filterArray.indexOf("circle") != -1) {
                                //circle query
                                query += " AND "+ getCircleSQL(filter);
                            }
                            break;
                        case "rectangle":
                            if (filterArray.indexOf("rectangle") != -1) {
                                //rectangle query
                                //query += " AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+activeFilter.lon+","+activeFilter.lat+"),ST_Point("+(activeFilter.lon+1)+","+(activeFilter.lat + 1)+")),4326))";
                            }
                            break;
                        case "fieldvalue":
                            if (filterArray.indexOf("fieldvalue") != -1) {
                                if (filter.value) {
                                    query += " AND "+ filter.field + "='" + filter.value.replace('\x27', '\x27\x27') + "'";
                                }
                            }
                            break;
                        case "minmax":
                            if (filterArray.indexOf("minmax") != -1) {
                                if (filter.min) {
                                    query += " AND "+ filter.field + ">=" + filter.min;
                                }
                                if (filter.max) {
                                    query += " AND "+ filter.field + "<=" + filter.max;
                                }
                            }
                            break;
                    }
                }
            }
        }
        return query;
    };

    var getFiltersREST = function(filters, filterArray) {
        var query = "";
        for (var property in filters) {
            if (filters.hasOwnProperty(property)) {
                var filter = filters[property].data;
                if (filters[property].active) {
                    if(query) query += "&";
                    switch (filter.type) {
                        case "circle":
                            if (filterArray.indexOf("circle") != -1) {
                                //circle query
                                query += "circle=" +  filter.lon + "," + filter.lat + "," + filter.radius;
                            }
                            break;
                        case "rectangle":
                            if (filterArray.indexOf("rectangle") != -1) {
                                //rectangle query
                                //query += " AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+activeFilter.lon+","+activeFilter.lat+"),ST_Point("+(activeFilter.lon+1)+","+(activeFilter.lat + 1)+")),4326))";
                            }
                            break;
                        case "fieldvalue":
                            if (filterArray.indexOf("fieldvalue") != -1) {
                                if (filter.value) {
                                    query += filter.field + "=" + filter.value.replace('\x27', '\x27\x27');
                                }
                            }
                            break;
                        case "minmax":
                            if (filterArray.indexOf("minmax") != -1) {
                                query += "minmax="+ filter.field + "," + filter.min + "," + filter.max;
                            }
                            break;
                    }
                }
            }
        }
        return query;
    };

    function drawPie(div, q, type) {

        //loading
        $(div).html('<div id="loading" class="text-center"><img src="img/load.svg" /></div>');

        //JSON call
        var jsonData = $.ajax({
            url: q,
            dataType: 'json',
          }).done(function (results) {

            if (results) {

                 //generate chart
                 if (type == "bar") {
                    // Rearrange data
                    var data=['occurrences'];
                    var x=['x'];
                    results.forEach(function(row) {
                      data.push(row.count);
                      x.push(row.name);
                    });

                    var chart = c3.generate({
                        bindto: div,
                        data: {
                            x: 'x',
                            columns: [
                                x, data
                            ],
                            types: {
                                occurrences: 'bar'
                            }
                        },
                        bar: {
                            width: 10 // this makes bar width 100px
                        }
                    });
                 } else {
                    // Rearrange data
                    var data=[];
                    results.forEach(function(row) {
                      data.push([row.name, row.count]);
                    });
                    var chart = c3.generate({
                        bindto: div,
                        data: {
                            columns: data,
                            labels: false,
                            type : type,
                        }
                    });
                 }

            } else {
                $(div).html("No results");
                //console.log("Query " + q + " brought no results")
            }
        });
    };

    function isUselessStat(activeFilters, k) {

        // we don't want to show a stat if we filter by it: the graphic would be 100%
        if (jQuery.isEmptyObject(activeFilters)) return false;
        var filters = activeFilters["#fvFilter"];
        var isUseless = false;

        if (filters && filters.active && filters.data && filters.data.value) {
            return (filters.data.field == k);
        }

        return false;
    };

	return {
       create: function(div, taxon, activeFilters) {
            // create here all stats
            var stats = {
                "subtaxa": {
                    text: "by subtaxon",
                    type: "pie"
                },
                "institutioncode": {
                    text: "by institution",
                    type: "pie"
                },
                "basisofrecord": {
                    text: "by basis of record",
                    type: "pie"
                },
                "year": {
                    text: "by year (only time referenced results)",
                    type: "bar"
                }
            }

            for (var k in stats) {
                if (stats.hasOwnProperty(k) && !isUselessStat(activeFilters, k)) {
                    $("<h4/>", {
                        html: stats[k].text,
                        "class": "chartTitle"
                    }).appendTo(div);
                    $("<div/>", {
                        id: 'chart'+k,
                        width: "100%"
                    }).appendTo(div);

                    drawPie("#chart"+k, getQuery(taxon, k, activeFilters), stats[k].type);
                }
            }
       },
       getFiltersSQL: function(filters, filterArray) {
            return getFiltersSQL(filters, filterArray)
       },
       getFiltersREST: function(filters, filterArray) {
            return getFiltersREST(filters, filterArray)
       }
	};

});
