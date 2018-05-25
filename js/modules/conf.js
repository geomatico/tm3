/**
 * @author Martí Pericay <marti@pericay.com>
 */
define([], function() {
    "use strict";
    
    var cartoTable = 'mcnb_prod_data';
	var cartoUser = 'marti';
    
    return {
       getTable: function() {
            return cartoTable;
       },
       getUser: function() {
            return cartoUser;
       },
       getApi: function() {
            return 'http://' + cartoUser + '.carto.com/api/v2/sql?';
       }
    }
});