/**
 * @author Martí Pericay <marti@pericay.com>
 */


define(['i18n', 'slider'], function(i18n) {
	
	var create = function(div, map, minmax) {
			
		if (!minmax) {
            minmax = [1900, 2000];
        }
		var slider = $("#slider").slider({
			tooltip: 'always',
			formatter: function(value) {
				return i18n.t('Years') + ': ' + value[0] + ' - ' + value[1];
			},
			min: minmax[0],
			max: minmax[1],
			value: minmax,
			step: 1,
		});
		
		disableDragging($(div)[0], map);
		
		return slider;
	};
	
    var disableDragging = function(element, map) {
        // Disable dragging when user's cursor enters the element
        element.addEventListener('pointerover', function () {
            map.dragging.disable();
        });
    
        // Re-enable dragging when user's cursor leaves the element
        element.addEventListener('pointerout', function () {
            map.dragging.enable();
        });        
    }
	
	return {
       create: function(div, map, minmax) {
       		return create(div, map, minmax);
       }
	};
	
});