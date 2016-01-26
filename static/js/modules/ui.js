/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['text!../../sections/about.ca.html', 'text!../../sections/disclaimer.ca.html', 'text!../../sections/help.ca.html', 'i18n', 'taxon', 'map', 'bootstrap'], function(about_ca, disclaimer_ca, help_ca, i18n, taxon, map) {
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
        $(div).append("<li class='menuTitle'><a href=\"#\">" + active_taxon + "</a></li>");

        if(child && child["children"]) $(div).append(drawMenuChildren(child["children"], level));

        //$(div + " ul").show(effect, { direction: direction}, 500);
    };

    var drawMenuChildren = function(childArray, parentLevel) {
        var level = parseInt(parentLevel) + 1;
        var data = [];

        for(var i=0; i<childArray.length; i++) {
            //if no id, we don't want to show the possibility to go further: there's no information
            if(childArray[i]['id']) data.push(drawMenuItem(childArray[i]['name'], childArray[i]['id'], level));
        }
        return data;
    };
    
    var drawMenuItem = function(name, id, level) {
		var item = $( "<li/>");
        var link =  $( "<a/>", {
		    html: name,
    		href: "#"
		}).appendTo(item);
		link.data("id", id);
		link.on("click", function(){
			setTaxon(new taxon($(this).data("id"), level));
		});
		return item;    	
    };
    
    var drawMenuParent = function(parent, level) {
        return drawMenuItem("Taxon superior", parent.id, level-1);
    };
	
	var updateUI = function(taxon) {
		//menu loading
    	
    	//make the JSON query
    	var query = "SELECT COUNT(*), "+taxon.getSqlFields()+" FROM " + map.getCartoDBTable() + " " + taxon.getSqlWhere() + " group by " + taxon.getSqlFields() + " order by count(*) desc";;
    	//if there was filtering
    	// " WHERE (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+bounds.left+","+bounds.bottom+"),ST_Point("+bounds.right+","+bounds.top+")),4326))
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
                updateMenu(".sidebar-nav", taxon);
                //create breadcrumb
                //$("#divBreadcrumb").html(UI.drawBreadcrumb(taxon.tree,0, taxon.level));
                
            } else {
                //Menu.error();
            }
        }).error(function(jqXHR, textStatus, errorThrown) { Menu.error(); });
    	
    	//change breadcrumb (TODO)
    	$("#breadcrumbTaxon").on("click", function(){
			setTaxon('Mammalia', '3');    	
		});
    	 
	};
	
	updateUI(new taxon(taxonId, level));
	
	$("#toggle-button").click(function(e) {
	    e.preventDefault();
	    $("#wrapper").toggleClass("toggled");
	});
	
	// text modal management
	var texts = {
		"about": {
			"ca": about_ca 
		},
		"disclaimer": {
			"ca": disclaimer_ca 
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
	});
	
	// cannot be used because keys of translations.json are the English ones and we may have changed them ...
	/*$(document).on("click", ".setLang", function() {
		var langId = $(this).data("id");
		i18n.setLang(langId);
		i18n.translateDocTree();
	});*/

	i18n.translateDocTree();
	
});