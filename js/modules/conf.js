/**
 * @author Martí Pericay <marti@pericay.com>
 */
define([], function() {
    "use strict";

    return {
       getApi: function() {
         return location.protocol + '//127.0.0.1:9999/api/v1/';
       },
       getWMSServer: function() {
         return location.protocol + '//localhost:8080/geoserver/wms?';
       },
       getWFSServer: function() {
         return location.protocol + '//localhost:8080/geoserver/wfs?';
       }
    }
});
