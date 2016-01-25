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
    var taxon_id = (params.hasOwnProperty('id') ? params.id : 'Eukaryota');
    var level = (params.hasOwnProperty('level') ? params.level : '0');
    
    var setTaxon = function(newtaxon, newlevel) {
    	
		// make sure that taxon is changing
	    if(taxon_id == newtaxon && level == newlevel) return;
    	
    	var activeTaxon = new taxon(newtaxon, newlevel);
    	
    	//change the cartoDB taxon layer
    	map.setSql(activeTaxon.getSqlWhere());
    	
    	updateUI(activeTaxon);
    	
    	//update taxon_id?
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
                    alert(error);
                    return;
                } 
                
                // we must convert from cartodb JSON format (rows) to TaxoMap JSON format (children objects)
                taxon.convertFromCartodb(data);
               // update Menu
                //Menu.update(taxon);
                //create breadcrumb
                //$("#divBreadcrumb").html(UI.drawBreadcrumb(taxon.tree,0, taxon.level));
                //update taxon
                //UI.taxon = taxon;
                
            } else {
                //Menu.error();
                alert(error);
            }
        }).error(function(jqXHR, textStatus, errorThrown) { Menu.error(); });
        	
    	//change menu (TODO)
    	$(".sidebar-nav > li > a").each(function(index, el) {
    		$(el).on("click", function(){
				setTaxon('Arthropoda', '2');
			});    	
		});
    	
    	//change breadcrumb (TODO)
    	$("#breadcrumbTaxon").on("click", function(){
			setTaxon('Mammalia', '3');    	
		});
    	 
	};
	
	updateUI(new taxon(taxon_id, level));
	
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