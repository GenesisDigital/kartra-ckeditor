import { View } from 'ckeditor5/src/ui';

export class FontFamilyView extends View {
	constructor( locale, fontItem ) {
		super( locale );

		const bind = this.bindTemplate;

		this.setTemplate( {
            tag: 'ul',
            children: [{
                tag: 'button',
                role: 'menuitemradio',
                attributes: {
                    class: ['ck', 'ck-button', 'ck-off', 'ck-button_with-text', fontItem.fontFamily]
                },
                children: [{
                    tag: 'span',
                    attributes: {
                        style: {
                            'font-family': fontItem.fontFamily
                        }
                    },
                    on: {
                        click: bind.to('clickedFontFamily')
                    },
                    children: [
                        fontItem.fontFamily,
                    ]
                },
                {
                    tag: 'label',
                    attributes: {
                        class: ['heart-icon', 'favourite_font_li']
                    },
                    children: [{
                        tag: 'input',
                        attributes: {
                            type: 'checkbox',
                            checked: fontItem.isFav === true,
                            value: fontItem.fontSlug,
                            id: fontItem.fontId
                        },
                        on: {
                            click: bind.to('clickedCheckbox'),
                        }
                    }, {
                        tag: 'small'
                    }],
                }],
            }],
		} );
	}
}