/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['i18n', 'taxon', 'map', 'bootstrap'], function(i18n, taxon, map) {
    "use strict";
    	
	var params = {};
    location.search.substr(1).split("&").forEach(function(item) {
        var kv = item.split("=");
        params[kv[0]] = kv[1];
    });

    // for future API
    var taxonId = (params.hasOwnProperty('id') ? params.id : 'Eukaryota');
    var level = (params.hasOwnProperty('level') ? params.level : '0');
    var currentTaxon;
    var activeFilter;
    
    var setTaxon = function(newTaxon) {
    	
		// make sure that taxon is changing
	    if(currentTaxon && currentTaxon.id == newTaxon.id && currentTaxon.level == newTaxon.level) return;
    	    	
    	//change the cartoDB taxon layer
    	map.setSql(newTaxon.getSqlWhere());
    	
    	updateUI(newTaxon);
    	
    	//update taxon_id
    	currentTaxon = newTaxon;
	};
	
    var updateMenu = function(div, taxon) {
        var parent = taxon.getParent();
        var child = taxon.getChild();
        var level = taxon.level;
        //direction = (UI.taxon && (level > UI.taxon.level)) ? "right" : "left";

        //delete everything
        $(div + " > li").remove();

        if(level) $(div).append(drawMenuParent(parent, level));
        // title (active taxon): last level has no 'child' element, we use 'children of parent'
        var active_taxon = (child ? child['name'] : parent['children'][0]['name']);
        $(div).append("<li><a href='#' class='active'>" + active_taxon + "</a></li>");

        if(child && child["children"]) $(div).append(drawMenuChildren(child["children"], level));

        //$(div + " ul").show(effect, { direction: direction}, 500);
    };

    var drawMenuChildren = function(childArray, parentLevel) {
        var level = parseInt(parentLevel) + 1;
        var data = [];

        for(var i=0; i<childArray.length; i++) {
            //if no id, we don't want to show the possibility to go further: there's no information
            if(childArray[i]['id']) data.push(drawMenuItem({ "name": childArray[i]['name'], "id": childArray[i]['id'], "level": level, "count": childArray[i]['count']}));
        }
        return data;
    };
    
    var drawMenuItem = function(item) {
    	
    	var title = item.name + (item.count? " <small>(" + item.count + ")<small>" : "");
		var li = $( "<li/>");
        var link =  $( "<a/>", {
		    html: title,
    		href: "#",
    		"class": item.className }).appendTo(li);
		link.data("id", item.id);
		link.on("click", function(){
			setTaxon(new taxon($(this).data("id"), item.level));
		});
		return li;    	
    };
    
    var drawMenuParent = function(parent, level) {
        return drawMenuItem({"name": "< Parent taxon", "id": parent.id, "level": level-1, "className": "parent"});
    };
    
    var updateBreadcrumb = function(div, taxon) {
    	$(div).html(drawBreadcrumb(taxon.tree, 0, taxon.level));
    };
    
    var flatten = function(children, newArray) {
    	if(!newArray) var newArray = [];	      
        if(!children["children"]) return newArray;
        newArray.push({"name": children["name"], "id": children["id"]});
        return flatten(children["children"][0], newArray);
	};
    
    var drawBreadcrumb = function(childArray, level, maxlevel) {
        level = parseInt(level);// must be a number!
        var html = [];
        var ancestry = flatten(childArray);
		
		for(var k=0; k < ancestry.length; k++) {
			ancestry[k].level = k;
			html.push(drawMenuItem(ancestry[k]));
		}
		
        return html;
    };
	
	var updateUI = function(taxon, filter) {
		
		if(!taxon) taxon = currentTaxon;
		//menu loading
    	
    	//make the JSON query
    	var query = "SELECT COUNT(*), "+taxon.getSqlFields()+" FROM " + map.getCartoDBTable() + " " + taxon.getSqlWhere();
    	//if there was filtering
    	if(filter) activeFilter = filter;
    	//circle query
    	if(activeFilter) query += " AND ST_Distance(ST_Transform(the_geom, 900913), ST_Transform(ST_SetSRID(ST_MakePoint("+activeFilter.lon+","+activeFilter.lat+"),4326), 900913)) < " + activeFilter.radius;
    	//rectangle query
    	//query += " AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+activeFilter.lon+","+activeFilter.lat+"),ST_Point("+(activeFilter.lon+1)+","+(activeFilter.lat + 1)+")),4326))";
    	//group bys and orders
    	query += " group by " + taxon.getSqlFields() + " order by count(*) desc";
    	
    	$.getJSON(map.getCartoDBApi() + "callback=?", //for JSONP
        {
          q: query
        },
        function(data){
            if(data && data.total_rows) {
                if(data.error) {
                    //Menu.error(data.error);
                    alert(data.error);
                    return;
                } 
                
                // we must convert from cartodb JSON format (rows) to TaxoMap JSON format (children objects)
                taxon.convertFromCartodb(data);
               // update Menu 
                updateMenu("#menuTaxon", taxon);
                //update breadcrumb
                updateBreadcrumb("#breadcrumbTaxon", taxon);
                
            } else {
                //Menu.error();
            }
        }).error(function(jqXHR, textStatus, errorThrown) { alert("Error getting taxon data"); });
    	 
	};
	
	currentTaxon = new taxon(taxonId, level);
	updateUI(currentTaxon);
	map.createFilter(updateUI);
	
	//translate DOM on click
	$(document).on("click", ".setLang", function() {
		var langId = $(this).data("id");
		i18n.setLang(langId);
		i18n.translateDocTree();
	});

	i18n.translateDocTree();
	
});