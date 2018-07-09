/**
 * @author Martí Pericay <marti@pericay.com>
 */


define(['slider'], function() {
	
	var create = function(div, map, minmax) {
			
		if (!minmax) {
            minmax = [1900, 2000];
        }
		var slider = $("#slider").slider({
			tooltip: 'always',
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
        element.addEventListener('mouseover', function () {
            map.dragging.disable();
        });
    
        // Re-enable dragging when user's cursor leaves the element
        element.addEventListener('mouseout', function () {
            map.dragging.enable();
        });        
    }
	
	return {
       create: function(div, map, minmax) {
       		return create(div, map, minmax);
       }
	};
	
});