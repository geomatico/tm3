/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['i18n', 'c3js', 'd3', 'cartodb'], function(i18n, c3, d3) {
    "use strict";

    var cartoDBTable = 'mcnb_prod';
	var cartoDBApi = 'http://mcnb.cartodb.com/api/v2/sql?';
        
    function getQuery(taxon, type) {
        
        var level = taxon.level;
        var childrenLevel = (taxon.levels[level+1]) ? level + 1 : level;
        var parent = level ? "," + taxon.levelsId[level-1] + " as parent " : "";
        var parent2 = parent ? ", parent " : "";
       
        // by subtaxon
        var q = cartoDBApi + "q=select count(*)," + taxon.levelsId[childrenLevel] + " as id," + taxon.levels[childrenLevel] + " as name" + parent + " from " + cartoDBTable +
        " WHERE " + taxon.levelsId[level] + "='"+ taxon.getChild()['id'] +"' group by id, name " + parent2 + " order by count(*) desc";
        
        if (type == "decade") {
            //by decade
            q = cartoDBApi + "q=select count(*), cast(cast(year AS integer)/10 as varchar)||'0' AS name " + " from " + cartoDBTable +
            " WHERE " + taxon.levelsId[level] + "='"+ taxon.getChild()['id'] + "' AND year IS NOT NULL group by cast(year AS integer)/10 order by cast(year AS integer)/10";
        }
        
        return q;
    }
    
    function drawPie(div, q) {
        
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
                console.log("No data for " + q)
            }
        });
    };
    
    
	return {
       createPie: function(div, taxon) {                
            //draw the charts
            //chart subtaxa
            $("<h4/>", {
                html: "per subtàxon"
            }).appendTo(div);
            $("<div/>", {
                id: 'chart',
                "class": "charts",
                width: "100%"
            }).appendTo(div);
       		drawPie("#chart", getQuery(taxon, "subtaxa"));
            
            //chart dècades
            $("<h4/>", {
                html: "per dècada"
            }).appendTo(div);
            $("<div/>", {
                id: 'chart2',
                "class": "charts",
                width: "100%"
            }).appendTo(div);

       		drawPie("#chart2", getQuery(taxon, "decade"));
       }
	};
	
});