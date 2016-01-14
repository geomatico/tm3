/**
 * @author Martí Pericay <marti@pericay.com>
 */

//define(['i18n', 'map', 'bootstrap'], function(i18n) {
define(['map', 'bootstrap'], function() {
	
	$("#toggle-button").click(function(e) {
	    e.preventDefault();
	    $("#wrapper").toggleClass("toggled");
	});
	
	/*var bundle = {
		About: {
			es: "¿Qué es?",
			ca: "Què és?"	
		}
	};
	i18n.addTranslations(bundle);
	i18n.translateDocTree();*/
	
});