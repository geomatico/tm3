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

    // for API
    var taxonId = (params.hasOwnProperty('id') ? params.id : 'Mammalia');
    var level = (params.hasOwnProperty('level') ? params.level : '3');
    var zoom = (params.hasOwnProperty('zoom') ? params.zoom : '4');
    var lat = (params.hasOwnProperty('lat') ? params.lat : '29.085599');
    var lon = (params.hasOwnProperty('lon') ? params.lon : '0.966797');
    var currentTaxon;
    // for the moment, it's only one filter
    var activeFilter = {};
    
    var setTaxon = function(newTaxon) {
    	
		// make sure that taxon is changing
	    if(currentTaxon && currentTaxon.id == newTaxon.id && currentTaxon.level == newTaxon.level) return;
    	    	
    	//change the cartoDB taxon layer
    	map.setSql(newTaxon.getSqlWhere());
    	
    	updateUI(newTaxon);
    	
    	//update taxon_id
    	currentTaxon = newTaxon;
	};
	
    var updateMenu = function(div, taxon, noresults) {

        //delete everything
        $(div).html("");
        
        var parent = taxon.getParent();
        var child = taxon.getChild();
        var level = taxon.level;
        //direction = (UI.taxon && (level > UI.taxon.level)) ? "right" : "left";

        if(level) $(div).append(drawMenuParent(parent, level));
        
        // title (active taxon): last level has no 'child' element, we use 'children of parent'
        var active_taxon = (child ? child['name'] : parent['children'][0]['name']);
        
        if (noresults) {
            $(div).append(drawTitle(active_taxon));
            var msg = $( "<li/>");
            msg.append(i18n.t(noresults));
            $(div).append(msg);
            return;
        }
        
        $(div).append(drawTitle(active_taxon));

        if(child && child["children"]) $(div).append(drawMenuChildren(child["children"], level));

        //$(div + " ul").show(effect, { direction: direction}, 500);
    };
    
    var drawTitle = function(title) {
        var html = "<li><a href='#' class='active'>" + title + "</a></li>";
        return html;
    }

    var drawMenuChildren = function(childArray, parentLevel) {
        var level = parseInt(parentLevel) + 1;
        var data = [];

        for(var i=0; i<childArray.length; i++) {
            //if no id, we don't want to show the possibility to go further: there's no information
            if(childArray[i]['id']) data.push(drawMenuItem({ "name": childArray[i]['name'], "id": childArray[i]['id'], "level": level, "count": childArray[i]['count']}));
        }
        return data;
    };
    
    var drawBreadcrumbItem = function(item) {
        var link = $( "<a/>", {
    		href: "#",
    		"class": item.className });
		
		var link = setLink(link, item);

        var div =  $( "<div/>", {
            html: item.name,
        }).appendTo(link);
        
		return link;
    };
    
    var drawMenuItem = function(item) {
    	var title = item.name + (item.count? " <small>(" + item.count + ")<small>" : "");
		var li = $( "<li/>");
        var link =  $( "<a/>", {
		    html: title,
            href: "#",
    		"class": item.className }).appendTo(li);
        
        link = setLink(link, item);
        
		return li;
    };   
        
    var setLink = function(el, item) {

		el.data("id", item.id);
		el.on("click", function(){
			setTaxon(new taxon($(this).data("id"), item.level));
		});
        
        return el;
    };
    
    var drawMenuParent = function(parent, level) {
        return drawMenuItem({"name": "↩", "id": parent.id, "level": level-1, "className": "parent"});
    };
    
    var updateBreadcrumb = function(div, taxon) {
    	$(div).html(drawBreadcrumb(taxon.tree));
    };
    
    var flatten = function(children, newArray) {
    	if(!newArray) newArray = [];	      
        if(!children["children"]) return newArray;
        newArray.push({"name": children["name"], "id": children["id"]});
        return flatten(children["children"][0], newArray);
	};
    
    var drawBreadcrumb = function(childArray) {
        level = parseInt(level);// must be a number!
        var html = [];
        html.push(drawBreadcrumbItem({
            name: "Eukaryota",
            id: "Eukaryota",
            className: "btn",
            level: 0}));
        html.push('<div class="btn dots">...</div>');
        var ancestry = flatten(childArray);
		
		for(var k=1; k < ancestry.length; k++) {
			ancestry[k].level = k;
            ancestry[k].className = "btn";
			html.push(drawBreadcrumbItem(ancestry[k]));
		}
		
        return html;
    };
    
    var makeBreadcrumbResponsive = function(div) {
        var ellipses = $(div + " :nth-child(2)");
        if ($(div + " a:hidden").length >0) {ellipses.show()} else {ellipses.hide()};
    };
	
	var updateUI = function(taxon, filter) {
		
		if(!taxon) taxon = currentTaxon;

		//menu loading
		var loadingDiv = $("<div/>", {
			"class": "menuLoading" 
		});
		$("#menuTaxon").html(loadingDiv);
    	
    	//make the JSON query
    	var query = "SELECT COUNT(*), "+taxon.getSqlFields()+" FROM " + map.getCartoDBTable() + " " + taxon.getSqlWhere();
    	//if filter is null or undefined, we don't change it
    	if(!filter) filter = activeFilter;
    	else activeFilter = filter;
    	//if filter is empty, we remove the filter
    	if(Object.keys(filter).length) {
    		//circle query
    		query += " AND ST_Distance_Sphere(the_geom, ST_SetSRID(ST_MakePoint("+activeFilter.lon+","+activeFilter.lat+"),4326)) < " + activeFilter.radius;
            //rectangle query
	    	//query += " AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+activeFilter.lon+","+activeFilter.lat+"),ST_Point("+(activeFilter.lon+1)+","+(activeFilter.lat + 1)+")),4326))";
	    }
    	//group bys and orders
    	query += "  group by " + taxon.getSqlFields() + " order by count(*) desc";
    	
    	$.getJSON(map.getCartoDBApi() + "callback=?", //for JSONP
        {
          q: query
        },
        function(data){
            //got results
            if(data && data.total_rows) {
                
                // we must convert from cartodb JSON format (rows) to TaxoMap JSON format (children objects)
                taxon.convertFromCartodb(data);
               // update Menu 
                updateMenu("#menuTaxon", taxon);
                //update breadcrumb
                var div = "#breadcrumbTaxon";
                updateBreadcrumb(div, taxon);
                makeBreadcrumbResponsive(div);
                $(window).resize(function() {
                    makeBreadcrumbResponsive(div);
                });
                
            //error
            } else if(data.error) {
                updateMenu("#menuTaxon", taxon, "An error occured");
            //no results
            } else {
                updateMenu("#menuTaxon", taxon, "No results");
            }
        }).error(function(jqXHR, textStatus, errorThrown) {
            var msg = "An error occured: ";
            if (jqXHR.status == "404") msg += "404 (" + map.getCartoDBApi() + " not found)";
            else if(textStatus) msg += errorThrown;
            updateMenu("#menuTaxon", taxon, msg); });
    	 
	};
	
	currentTaxon = new taxon(taxonId, level);
	updateUI(currentTaxon);
    var options = {
        where: currentTaxon.getSqlWhere(),
        lat: lat,
        lon: lon,
        zoom: zoom
    }
    map.createMap(options);
	map.createFilter("#circleFilter", updateUI);
	
	//translate DOM on click
	$(document).on("click", ".setLang", function() {
		var langId = $(this).data("id");
		i18n.setLang(langId);
		i18n.translateDocTree();
	});

	i18n.translateDocTree();
	
});