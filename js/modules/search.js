/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['jquery', 'map', 'taxon', 'i18n'], function($, map, taxon, i18n) {
    "use strict";

    // we store filters here
    var results;

    var create = function(searchDiv, noresultsDiv, callback) {
        $(noresultsDiv).hide();
        $(searchDiv).typeahead({
            delay: 500,
            dynamic: true,
            source: function (query, process) {
                $.get(map.getApi() + 'search/' + encodeURIComponent(query) + '/', function (data) {
                    results = data;
                    var array = $.map(results, function(value, index) {
                        return [value.id]
                    });
                    if (array.length == 0) $(noresultsDiv).show(); //no results
                    return process(array);
                });
            },
            matcher: function(item) {
                return true;
            },
            highlighter: function(id) {
                //must be rewritten
                var result = $.grep(results, function(e){ return e.id == id; });
                $(noresultsDiv).hide();
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
    	create: function(searchDiv, noresultsDiv, callback) {
    		create(searchDiv, noresultsDiv, callback);
    	}
    };

});
