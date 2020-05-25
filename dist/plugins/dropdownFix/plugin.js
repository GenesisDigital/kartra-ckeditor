CKEDITOR.plugins.add( 'dropdownFix', {
    init: function( editor ) {
        
        CKEDITOR.ui.panel.block.prototype.show = function () {

			var theThing = this;

			if ($(this.element.$).attr('aria-label') === 'Font Name' || $(this.element.$).attr('aria-label') === 'Font Size') {
				setTimeout( function () {

					theThing.element.setStyle("display", "");

				}, 200 );
			} else {
				this.element.setStyle("display", "block");
			}
		};

    }
});