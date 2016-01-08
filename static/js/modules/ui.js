/**
 * @author Martí Pericay <marti@pericay.com>
 */

// cartodb includes Jquery, and we don't want to load jquery again, so CartoDB is a dependency
define(['cartodb', 'map'], function() {
	
	$("#toggle-button").click(function(e) {
	    e.preventDefault();
	    $("#wrapper").toggleClass("toggled");
	});
	
});