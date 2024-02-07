import { View, LabeledFieldView, ButtonView, createLabeledInputText} from 'ckeditor5/src/ui';
import { EmitterMixin, mix } from '@ckeditor/ckeditor5-utils';
import { icons } from 'ckeditor5/src/core.js';

export class FontSearchView extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

        this.fontFamilyInputView = this._createInput( 'Search font...' );
		this.clearInputView = this._createButton( 'Clear', icons.cancel, 'ck-button-cancel', 'clearInput');

        this.childViews = this.createCollection( [
            this.fontFamilyInputView,
            this.clearInputView
        ] );
        // this.fontFamilyInputView.bind('value').to(val)
		this.setTemplate( {
            tag: 'form',
            attributes: {
                class: [ 'ck', 'ck-media-form', 'ck-responsive-form' ],
                tabindex: '-1'
            },
            children: this.childViews
        } );

        this.on('clearInput', () => {
            this.fontFamilyInputView.fieldView.value = '';
            console.log('clear from view')
        });
	}

    _createInput( label ) {
        const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputField = labeledInput.fieldView;

        labeledInput.label = label;
		inputField.on( 'input', (event) => {
            this.fireInputEvent(event.source.element.value);
		} );

        return labeledInput;
    }
	_createButton( label, icon, className, cb ) {
		const button = new ButtonView( this.locale );
		const bind = this.bindTemplate;

		button.set( {
			label,
			icon,
			tooltip: true
		} );
        

		button.extendTemplate( {
			attributes: {
				class: className
			}, 
            on: {
                click: bind.to(cb)
            }
		} );

		return button;
	}

    fireInputEvent(event) {
        this.fire('typed', event);
    }
}

mix(FontSearchView, EmitterMixin)

