/**
 * @author Martí Pericay <marti@pericay.com>
 */
define(['jquery', 'i18n', 'mustache'], function($, i18n) {
    "use strict";
	
	var divWiki;
    var localeWiki = 'en';
    var wikiApi = "wikipedia.org/wiki/";
    
    var drawWikiSheet = function(div, data){
	     
         var title = data.parse.title;
         div.find("#title").html(title);
         var moreinfo = i18n.t("More info");
         var here = i18n.t("here");
         
         div.find("#subtitle").html(moreinfo + " <a href='http://" + localeWiki + '.' + wikiApi + title + "' target='_blank'>" + here + "</a>").show();

         // get raw HTML text ... but we need to do a few hacks
         div.find("#desc").html(data.parse.text["*"]);
         
         //HACKS
         //remove links
         $('#desc a').replaceWith(function() {
             return this.childNodes;
         });
         //remove areas (with links)
         $('#desc area').remove();         
         //remove references
         $('#desc .reference ').remove();
         //remove references errors
         $('#desc .mw-ext-cite-error').remove();
         //remove disambiguations 
         $('#desc .noprint').remove();
     };
     
     var drawLinksSheet = function(title){
         var div = $("#links");
         div.find("#wikispecies").attr("href", "http://species.wikimedia.org/wiki/"+title);
         div.find("#gbif").attr("href", "http://www.gbif.org/species/search?q="+title);
         div.find("#eol").attr("href", "http://www.eol.org/search?q="+title.replace(" ","+"));
     };
     
     var createSheetDiv = function(){
        
        var html= ['<div id="divSheetModal">',
                    '<div id="content">',
                    '    <div id="title"></div>',
                    '    <div id="subtitle"></div>',
                    '    <div id="textColumn">',
                    '        <div id="desc"></div>',
                    '    </div>',
                    ' </div>',
                    ' <div id="loading" class="text-center">',
                    '    <img src="img/load.svg" />',
                    '{{loadingtext}}',
                    '<br/>',
                    '    <img alt="Wikipedia Logo" src="img/logos/wiki.png" />',
                    ' </div>',
                    ' </div>'].join("\n");
        
        var data = {
            loadingtext: i18n.t('Loading from Wikipedia')
        };
        
        var footer = '<div id="links"><a id="wikispecies" target="_blank"><img alt="Wikispecies Logo" title="Consultar Wikispecies" src="img/logos/wikispecies.png" /></a><a id="eol" target="_blank"><img alt="Encyclopedia Of Life Logo" title="Consultar Encyclopedia Of Life" src="img/logos/eol.png" /></a><a id="gbif" target="_blank"><img alt="GBIF Logo" title="Consultar GBIF" src="img/logos/gbif.jpg" /></a></div>';
        
        return Mustache.render(html, data) + footer;
     };
     
     var getWikiInfo = function(div, taxon){
         
         var wiki_url = "http://" + localeWiki + ".wikipedia.org/w/api.php?action=parse&prop=text&section=0&format=json&page="+ taxon + "&contentformat=text%2Fx-wiki&redirects=";
         div.find("#links").hide();
             
         $.getJSON(wiki_url+"&callback=?", //for JSONP
            {
                //additional params
                //ID: UI.taxon.id
            },
            function(data){
            // parse JSON data
                if(data.parse) drawWikiSheet(div, data);
                else {
                    div.find("#title").html("No results");
                    div.find("#desc").html("No results found for " + " " + taxon + " " + " at Wikipedia");
                    div.find("#subtitle").hide();
                }
                div.find("#content").show();
                div.find("#links").show();
                div.find("#loading").hide();
                drawLinksSheet(taxon);
        });
             

     };
    
	return {
       showSheet: function(div, taxon, locale) {
            divWiki = div;
            if(locale) localeWiki = locale;
            $(div).html(createSheetDiv());
			return getWikiInfo(div, taxon);
       }
	};
	
});