/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['i18n', 'taxon', 'map', 'text!../../sections/about.ca.html', 'text!../../sections/help.ca.html', 'bootstrap', 'typeahead', 'select'], function(i18n, taxon, map, about_ca, help_ca) {
    "use strict";
    	
	var params = {};
    location.search.substr(1).split("&").forEach(function(item) {
        var kv = item.split("=");
        params[kv[0]] = kv[1];
    });

    // for API
    var taxonId = (params.hasOwnProperty('id') ? params.id : 'Mammalia');
    var level = ((params.hasOwnProperty('level') && parseInt(params.level)) ? params.level : '3');
    var zoom = (params.hasOwnProperty('zoom') ? params.zoom : '3');
    var lat = (params.hasOwnProperty('lat') ? params.lat : '29.085599');
    var lon = (params.hasOwnProperty('lon') ? params.lon : '0.966797');
    var currentTaxon;
    // store filters
    var activeFilters = [];
    
    var setTaxon = function(newTaxon, filters, firstload) {
    	
		// check if filters are changing
	    if (!filters) filters = activeFilters;
        
        if (!newTaxon) newTaxon = currentTaxon;
        else {
            //make the JSON query to get taxon
            var total_query = buildQuery(newTaxon, false, false);
            
            makeQuery(total_query, function(data) {
                if (data.error) {
                    if (data.error == "empty") data.error = "Taxon does not exist";
                    updateMenu("#menuTaxon", taxon, data.error);
                // we need to update info for new taxon
                } else { 
                    // we must convert from cartodb JSON format (rows) to TaxoMap JSON format (children objects)
                    newTaxon.convertFromCartodb(data);
                    updateBreadcrumb("#breadcrumbTaxon", newTaxon);
                }
            });
        }
        
        if (!firstload) {
            //change the cartoDB taxon layer
            var query = newTaxon.getSqlWhere() + map.getFiltersSQL(filters, ["fieldvalue"]);
            map.setSql(query);
            updateUI(newTaxon, filters);
            
            //update taxon_id
            currentTaxon = newTaxon;
        }
	};
    
    var updateStats = function(div, taxon) {
        $(div).html("<br>Under construction");
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
        $(div).append(drawDownload(taxon, activeFilters));

        if(child && child["children"]) $(div).append(drawMenuChildren(child["children"], level));

        //$(div + " ul").show(effect, { direction: direction}, 500);
    };
    
    var drawTitle = function(title) {
        var html = "<li><a href='#' class='active'>" + title + "</a></li>";
        return html;
    }
    
    var drawDownload = function(taxon, filters) {
        var li =  $( "<li/>");
        
        var link =  $( "<a/>", {
		    html: "", // Marc: treure text
            href: "#",
            "class": "downloadLink"
        }).appendTo(li);
        
        link.click(function() {
            map.getQuotes(taxon, filters, 'csv');
        });
        
        return li;
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
        makeBreadcrumbResponsive(div);
        $(window).resize(function() {
            makeBreadcrumbResponsive(div);
        });
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
    
    var buildQuery = function(taxon, children, filters) {
        var fields = taxon.getSqlFields('child');
        if (!children) fields = taxon.getSqlFields('parent');
        var query = "SELECT COUNT(*), "+ fields +" FROM " + map.getCartoDBTable() + " " + taxon.getSqlWhere();
        if(filters) query += map.getFiltersSQL(filters, ["circle", "fieldvalue"]);
        //group bys and orders
    	query += "  group by " + fields + " order by count(*) desc";
        console.log(query);
        return query;
    };
    
    var makeQuery = function(query, callback) {
        $.getJSON(map.getCartoDBApi() + "callback=?", //for JSONP
            {
              q: query
            },
            function(data){
                //got results
                if(data && data.total_rows) {
                    callback(data);
                } else {
                    callback({ error: "empty" });
                }
            }).error(function(jqXHR, textStatus, errorThrown) {
                var msg = "An error occured: ";
                if (jqXHR.status == "404") msg += "404 (" + map.getCartoDBApi() + " not found)";
                else if(textStatus) msg += errorThrown;
                callback({ error: msg });
        });
    };
	
	var updateUI = function(taxon, filters) {
		
		if(!taxon) taxon = currentTaxon;

		//menu loading
		var loadingDiv = $("<div/>", {
			"class": "menuLoading" 
		});
		$("#menuTaxon").html(loadingDiv);
    	
        //if filter is null or undefined, we don't change it
    	if(!filters) filters = activeFilters;
    	else activeFilters = filters;
        
        //query to get children
        var query = buildQuery(taxon, true, filters);
        makeQuery(query, function(data) {
            if (data.error) {
                if (data.error == "empty") data.error = "No results";
                updateMenu("#menuTaxon", taxon, data.error);
            } else {
                taxon.convertFromCartodb(data);
                // update Menu
                updateMenu("#menuTaxon", taxon);
            }
        });
	};
	
	currentTaxon = new taxon(taxonId, level);
	setTaxon(currentTaxon, null, 'firstload');
    var options = {
        where: currentTaxon.getSqlWhere(),
        lat: lat,
        lon: lon,
        zoom: zoom
    }
    map.createMap(options);
	map.createGeoFilter("#circleFilter", updateUI);
    map.createComboFilter("#fvFilter", setTaxon);
    
    $("#toggleButton").click(function(e) {
	    e.preventDefault();
        //needs some logic to be combined with sidebar auto-hiding
        //$(this).html(">>");
	    $("#wrapper").toggleClass("toggled");
	});
    
    // text modal management
 	var texts = {
 		"about": {
 			"ca": about_ca 
 		},
 		"help": {
 			"ca": help_ca 
 		}
 	};
 	$(document).on("click", ".open-textModal", function () {
 	     var pageId = $(this).data("id");
 	     var html = texts[pageId]["ca"];
 	     $('#textModal .modal-content').css('height',$( window ).height()*0.8);
 	     $("#textModal .modal-body").html(html);
 	     // it is superfluous to have to manually call the modal.
 	})
    
    //search
    var createSearch = function() {
        var results;
        $("#noresults").hide();
        $('#taxon').typeahead({
            delay: 300,
            dynamic: true,
            source: function (query, process) {            
                $.get(map.getCartoDBApi() + 'q=' + encodeURIComponent(currentTaxon.getSqlSearch(query, map.getCartoDBTable())), function (data) {
                    results = data.rows;
                    var array = $.map(results, function(value, index) {
                        return [value.id]
                    });
                    if (array.length == 0) $("#noresults").show(); //no results
                    return process(array);
                });
            },
            matcher: function(item) {
                return true;
            },
            highlighter: function(id) {
                //must be rewritten
                var result = $.grep(results, function(e){ return e.id == id; });
                $("#noresults").hide();
                return result[0].label;
            },
            updater: function(id) {
                var result = $.grep(results, function(e){ return e.id == id; });
                var newTaxon = new taxon(id, result[0].level);
                setTaxon(newTaxon);
            }
        });
    };
    
    createSearch();
	
	//translate DOM on click
	$(document).on("click", ".setLang", function() {
		var langId = $(this).data("id");
		i18n.setLang(langId);
		i18n.translateDocTree();
	});

	i18n.translateDocTree();
	
});