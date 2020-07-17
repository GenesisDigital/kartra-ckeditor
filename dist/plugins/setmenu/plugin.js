CKEDITOR.plugins.add( 'setmenu', {
	afterInit: function( editor ) {

		editor.on('selectionChange', function (e) {
			var $element = $(e.data.path.elements[0].$);
			selectionChange(e, $element);
        });

		var fontSizes = editor.config.fontSize_sizes.split(';');
		$.each(fontSizes, function(index, val) {
			fontSizes[index] = parseFloat(val, 10);
		});

		var closest = function(num, arr) {
            var curr = arr[0];
            var diff = Math.abs (num - curr);
            for (var val = 0; val < arr.length; val++) {
                var newdiff = Math.abs (num - arr[val]);
                if (newdiff < diff) {
                    diff = newdiff;
                    curr = arr[val];
                }
            }
            return curr;
        }



		var selectionChange = function(e, $element) {

	        //We have to sleep this to get it to run after CKE's built in one
	        setTimeout(function() {

	        	var baseSize = null;
				if (editor.config.use_em === true) {
					$('#ckeditor-test-font-size').remove();
					$baseline = $('<div id="ckeditor-test-font-size" style="font-size: 1em;"></div>');
					var $wrapper = $element.parents('.js_ckeditor_wrapper');
					$wrapper.after($baseline);
					baseSize = parseInt($('#ckeditor-test-font-size').css('font-size'), 10);
					$('#ckeditor-test-font-size').remove();
				}

	            var fontMenu = e.editor.ui.get('favfonts') || e.editor.ui.get('Font') //The fontMenu
	                , fontSizeMenu = e.editor.ui.get('FontSize') //the FontSize Menu
	                , fontSize
	                ;
				if (fontMenu) {
					if (fontMenu.getValue() == '' && $element.css("font-family") !== undefined) {
						setRichCombo(e.editor,fontMenu,$element.css("font-family").replace("'","").split(',')[0]);
					}
				}
	            fontSize = (parseFloat($element.css("font-size"))).toFixed(0);
	            if (fontSizeMenu.getValue() == '') {

	                fontSize = $element.css("font-size");

	                //Good old IE, sometimes returns us the font sizes from font tags (eg 1,2,3,4,5) and other times the px font size
	                if (fontSize !== undefined && fontSize.indexOf('px') === -1) {
	                    //So it's a 1,2,3,4,5 in IE

	                    switch(parseInt(fontSize)) {
	                        case 1:
	                            fontSize = 7.5;
	                            break;

	                        case 2:
	                            fontSize = 10;
	                           break;

	                        case 3:
	                            fontSize = 12;
	                            break;

	                        case 4:
	                            fontSize = 13.5;
	                            break;

	                        case 5:
	                            fontSize = 18;
	                            break;

	                        case 6:
	                            fontSize = 24;
	                            break;

	                        case 7:
	                            fontSize = 36;
	                            break;

	                        default:
	                            break;
	                    }

	                } else {
	                    fontSize = (parseFloat($element.css("font-size"))).toFixed(0);
	                }

	                if (editor.config.fontSize_sizes.indexOf('rem') !== -1 && fontSize !== '') {
	                	fontSize = Math.round(fontSize/26*100)/100;
	                	fontSize = closest(fontSize, fontSizes)+'rem';
	                } else if (editor.config.use_em === true) {
	                	fontSize = (fontSize/baseSize).toFixed(2)+'em';
	                }


	                setRichCombo(e.editor,fontSizeMenu,fontSize);
	            }
	        },0);
	    }

		var setRichCombo = function(editor, combo, value) {

	        var matched = false;

	        //The fun part about this is the list may not exist yet
	        if ($.isEmptyObject(combo._.items)) {
	            //So it's not present yet!
	            combo.createPanel(editor); //This creates it!
	        }

	        //Okay so items is now our list, get our value and go through it
	        //Loop the object and see if we have a match on any keys
	        $.each(combo._.items, function( index, v ) {

	            if (v.toLowerCase() === value )  {
	                matched = true;
	                value = v;
	                return false;
	            }
	        });

	        //If we match it we set it, else we set it's display with nothing selected!
	        if (matched)
	            combo.setValue(value);
	        else
	            combo.setValue('',value);

	    }
	}
} );