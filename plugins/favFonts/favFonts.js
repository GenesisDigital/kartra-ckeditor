import { Command } from 'ckeditor5/src/core';
import { createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import { Collection } from '@ckeditor/ckeditor5-utils';
import { FontFamilyView } from './fontFamilyView';
import { FontSearchView } from './fontSearchView';
import { EmitterMixin, mix } from '@ckeditor/ckeditor5-utils';
import { Plugin } from '@ckeditor/ckeditor5-core';
        
const jsVars = window.top.jsVars;
const secureBaseUrl = jsVars && jsVars.secureBaseUrl;
const fetchUserFonts = jsVars && jsVars.getUserFonts;
const apiRoute = secureBaseUrl && (secureBaseUrl + '/v2/favouriteFonts');
let allFonts = [];

export class FavFonts extends Plugin {
    
    constructor(editor) {
        super(editor);
    }

    init() {
        let itemsForDropdown = new Collection();
        const appFonts = {
            default: 
                jsVars && jsVars.fonts && jsVars.fonts.default
                    ? jsVars.fonts.default
                    : [],
        // default: [
        //         {
        //             "font": "Arial",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Tahoma",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Verdana",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Helvetica",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Times+New+Roman",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Georgia",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Courier+new",
        //             "googleFont": false
        //         },
        //         {
        //             "font": "Lucida+Sans+Unicode",
        //             "googleFont": false
        //         }
        //     ],
        additional:
            jsVars && jsVars.fonts && jsVars.fonts.available
                ? jsVars.fonts.available
                : []
        };

        this.editor.ui.componentFactory.add('favFonts', (locale) => {
            const dropdown = createDropdown(locale);
            const command = this.editor.commands.get( 'fontFamily' );
    
            dropdown.buttonView.set({
                label: 'List dropdown',
                withText: true,
            });

            dropdown.buttonView.bind( 'label' ).to( command, 'value', value => {
                return value ? value : 'Lato';
            } );
    
            dropdown.extendTemplate({
                attributes: {
                    class: 'ck-font-family-dropdown'
                }
            });
            
            this.getUserFonts(fetchUserFonts, apiRoute, appFonts, (fonts) => {
                // const fonts = appFonts.default;
                const searchBox = {
                    type: 'button',
                    model: new FontSearchView(locale)
                }
                itemsForDropdown = this.buildFontList(fonts, searchBox, apiRoute);
                addListToDropdown( dropdown, this.buildFontList(fonts, searchBox, apiRoute), {
                    role: 'menu',
                    ariaLabel: 'Font Family'
                } );

                dropdown.on('change:isOpen', (event, name, value) => {
                    console.log('list view', dropdown)
                    console.log('list view', dropdown.listView)
                })
                
                searchBox.model.on('clearInput', () => console.log('clear input'));
                
                searchBox.model.on('typed', (event, data) => {
                    const fonts = appFonts.default.filter((item) => {
                        if (!item.font) return true;
                        return item.font.toLowerCase().indexOf(data.toLowerCase()) > -1;
                    })
                    itemsForDropdown.filter((item) => {
                            if (!item.font) return true;
                            return item.font.toLowerCase().indexOf(data.toLowerCase()) > -1;
                    })

                    itemsForDropdown = this.buildFontList(fonts, searchBox, locale, apiRoute);
                });
        
            });
    
            dropdown.render();
    
            return dropdown;
        });
    }

    buildFontList(fonts, searchBox, locale) {
        const itemsForDropdown = new Collection();
        itemsForDropdown.add(searchBox);
        fonts.forEach((f, index) => {
            const fontItem = {
                fontSlug: f.font,
                fontFamily: f.font.split('+').join(' '),
                isFav: f.isFav === true,
                fontId: f.id || index
            }
            const item = {
                type: 'button',
                font: fontItem.fontFamily,
                model: new FontFamilyView(locale, fontItem)
            }
            
            item.model.on('clickedCheckbox', (eventInfo, event) => {
                if (event.target.checked) {
                    this.saveFont(event.target.value)
                } else {
                    this.deleteFont(event.target.id);
                }
            });

            item.model.on('clickedFontFamily', (eventInfo, event) => {
                console.log('clicked font');
                this.editor.execute( 'fontFamily', { value: event.target.style['font-family'] } );
            });

            itemsForDropdown.add(item);
        });
        return itemsForDropdown;
    }
    
    saveFont(name) {
        $.ajax({
            url: apiRoute + '/create',
            type: 'POST',
            data: { font_name: name }
        }).done((data) => {});
    }

    deleteFont(id) {
        $.ajax({
            url: apiRoute + '/delete',
            type: 'POST',
            data: { font_id: id }
        }).done((data) => {});
    }

    combineFonts(userFonts, appFonts) {
        const _appFonts = JSON.parse(JSON.stringify(appFonts));
        const defaultFonts = _appFonts.default;
        const additionalFonts = _appFonts.additional;
        const combinedFonts = defaultFonts.concat(additionalFonts);
        console.log('combined first', combinedFonts);

        for (let i = 0; i < combinedFonts.length; i++) {
            const combinedFont = combinedFonts[i];
            loop: for (let j = 0; j < userFonts.length; j++) {
                const userFont = userFonts[j];
                if (combinedFont.font === userFont.font) {
                    combinedFonts[i].id = userFont.id;
                    combinedFonts[i].isFav = true;
                    break loop;
                }
        }
        }

        combinedFonts.sort((a, b) => {
            if (typeof a.id === 'undefined') a.id = 99999999;
            if (typeof b.id === 'undefined') b.id = 99999999;
            return a.id - b.id || a.font.localeCompare(b.font);
        });
        allFonts = combinedFonts;
        console.log('combined', combinedFonts);
        return combinedFonts;
    }

    getUserFonts(fetchUserFonts, apiRoute, appFonts, cb) {
        if (!fetchUserFonts) return;
        $.ajax({
            url: apiRoute + '/get',
            type: 'GET'
        }).done((data) => {
            let userFonts = data.fonts
                .map((f) => {
                    return { id: f.id, font: f.font_name, isFav: true };
                })
                .sort((a, b) => {
                    if (a.font < b.font) return -1;
                    if (a.font > b.font) return 1;
                    return 0;
                });

                cb(this.combineFonts(userFonts, appFonts));
        });
    }
}

mix(FavFonts, EmitterMixin);