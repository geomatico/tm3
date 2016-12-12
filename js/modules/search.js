/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['jquery', 'map', 'taxon', 'i18n'], function($, map, taxon, i18n) {
    "use strict";
    
    // we store filters here
    var results; 
    
    var create = function(callback) {
        $("#noresults").hide();
        $('#taxon').typeahead({
            delay: 300,
            dynamic: true,
            source: function (query, process) {            
                $.get(map.getCartoDBApi() + 'q=' + encodeURIComponent(new taxon().getSqlSearch(query, map.getCartoDBTable())), function (data) {
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
                callback(newTaxon);
            }
        });
    };
    
    return {
    	create: function(options) {
    		create(options);
    	}
    };
    		
});
