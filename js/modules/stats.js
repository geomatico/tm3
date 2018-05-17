/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['i18n', 'c3js', 'd3', 'cartodb'], function(i18n, c3, d3) {
    "use strict";

    var cartoDBTable = 'mcnb_prod';
	var cartoDBApi = 'http://mcnb.cartodb.com/api/v2/sql?';
        
    function getQuery(taxon, type, filters) {
        
        var level = taxon.level;
        var childrenLevel = (taxon.levels[level+1]) ? level + 1 : level;
        var parent = level ? "," + taxon.levelsId[level-1] + " as parent " : "";
        var parent2 = parent ? ", parent " : "";
       
        if (type == "subtaxa") {
            var q = cartoDBApi + "q=select count(*)," + taxon.levelsId[childrenLevel] + " as id," + taxon.levels[childrenLevel] + " as name" + parent + " from " + cartoDBTable +
            " WHERE " + taxon.levelsId[level] + "='"+ taxon.getChild()['id'] +"'" + getFiltersSQL(filters, ["circle", "fieldvalue"]) + " group by id, name " + parent2 + " order by count(*) desc";
        } else if (type == "decade") {
            //by decade
            q = cartoDBApi + "q=select count(*), cast(cast(year AS integer)/10 as varchar)||'0' AS name " + " from " + cartoDBTable +
            " WHERE " + taxon.levelsId[level] + "='"+ taxon.getChild()['id'] + "' AND year IS NOT NULL" + getFiltersSQL(filters, ["circle", "fieldvalue"]) + " group by cast(year AS integer)/10 order by cast(year AS integer)/10";
        } else {
            // any "normal" field that doesn't require transformation
            q = cartoDBApi + "q=select count(*), " + type + " as name from " + cartoDBTable +
            " WHERE " + taxon.levelsId[level] + "='"+ taxon.getChild()['id'] +"'" + getFiltersSQL(filters, ["circle", "fieldvalue"]) + " group by name order by count(*) desc";            
        }
        
        return q;
    };
    
    var getCircleSQL = function(circle) {
        return "ST_DWithin(the_geom::geography, ST_SetSRID(ST_MakePoint("+circle.lon+","+circle.lat+"),4326)::geography," + circle.radius + ")";
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
                    }
                }
            }
        }
        return query;
    };    
    
    function drawPie(div, q) {
        
        //loading
        $(div).html('<div id="loading" class="text-center"><img src="img/load.svg" /></div>');
        
        //JSON call
        var jsonData = $.ajax({
            url: q,
            dataType: 'json',
          }).done(function (results) {
        
            if (results["total_rows"]) {
                
                 // Rearrange data
                 var data=[];
                 results["rows"].forEach(function(row) {
                   data.push([row.name, row.count]);
                 });
                 
                 //generate chart
                 var chart = c3.generate({
                     bindto: div,
                     data: {
                         // iris data from R
                         columns: data,
                         labels: false,
                         type : 'pie',
                     },
                     pie: {
                         /*label: {
                             format: function (value, ratio, id) {
                                 var formatPercent = d3.format(",.0%");
                                 return (id + ": "+ formatPercent(ratio));
                             }
                         }*/
                     }
                 });
                 
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
            //all stats (key:label)
            var stats = {
                "subtaxa": "by subtaxon",
                "institutioncode": "by institution",
                "basisofrecord": "by basis of record"
            }
            
            for (var k in stats) {
                if (stats.hasOwnProperty(k) && !isUselessStat(activeFilters, k)) {
                    $("<h4/>", {
                        html: stats[k]
                    }).appendTo(div);
                    $("<div/>", {
                        id: 'chart'+k,
                        "class": "charts",
                        width: "100%"
                    }).appendTo(div);
                    
                    drawPie("#chart"+k, getQuery(taxon, k, activeFilters));
                }
            } 
       },
       getFiltersSQL: function(filters, filterArray) {
            return getFiltersSQL(filters, filterArray)
       },
	};
	
});