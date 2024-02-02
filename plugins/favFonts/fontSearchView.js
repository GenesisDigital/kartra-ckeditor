import { View, LabeledFieldView, createLabeledInputText} from 'ckeditor5/src/ui';
import { EmitterMixin, mix } from '@ckeditor/ckeditor5-utils';

export class FontSearchView extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

        this.abbrInputView = this._createInput( 'Search font...' );

        this.childViews = this.createCollection( [
            this.abbrInputView,
        ] );
		this.setTemplate( {
            tag: 'form',
            attributes: {
                class: [ 'ck', 'ck-abbr-form' ],
                tabindex: '-1'
            },
            children: this.childViews
        } );
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

    fireInputEvent(event) {
        this.fire('typed', event);
    }
}

mix(FontSearchView, EmitterMixin)

