/**
 * @author Martí Pericay <marti@pericay.com>
 */

define(['text!../../sections/about.ca.html', 'text!../../sections/disclaimer.ca.html', 'text!../../sections/help.ca.html', 'i18n', 'taxon', 'map', 'bootstrap'], function(about_ca, disclaimer_ca, help_ca, i18n, taxon) {
	
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

	i18n.translateDocTree();
	
});