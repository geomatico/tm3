/**
 * @author Martí Pericay <marti@pericay.com>
 */


define(['slider'], function() {
	
	var create = function(div, map, callback) {
			
		var slider = $("#slider").slider({
			tooltip: 'always',
			min: 1900,
			max: 2018,
			value: [1900, 2018],
			//value: moments.length - 1,
			step: 1,
		});
		
		disableDragging($(div)[0], map);
		
		slider.change(function() {
			callback(this.value);
		});
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
       create: function(div, map, callback) {
       		return create(div, map, callback);
       }
	};
	
});