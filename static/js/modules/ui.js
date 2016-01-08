/**
 * @author Martí Pericay <marti@pericay.com>
 */


define(['map', 'bootstrap'], function() {
	
	$("#toggle-button").click(function(e) {
	    e.preventDefault();
	    $("#wrapper").toggleClass("toggled");
	});
	
});