import { Command } from 'ckeditor5/src/core';
import { createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import { Collection } from '@ckeditor/ckeditor5-utils';
import { FontFamilyView } from './fontFamilyView';
import { FontSearchView } from './fontSearchView';
import { EmitterMixin, mix } from '@ckeditor/ckeditor5-utils';
import { Plugin } from '@ckeditor/ckeditor5-core';
        
const jsVars = window.top.jsVars;
const secureBaseUrl = "https://local.kartradev.com/"; // jsVars && jsVars.secureBaseUrl;
const fetchUserFonts = true; //jsVars && jsVars.getUserFonts;
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
            
            // this.getUserFonts(fetchUserFonts, apiRoute, appFonts, (fonts) => {
                const fonts = appFonts.default;
                const searchBox = {
                    type: 'button',
                    model: new FontSearchView(locale)
                }
                itemsForDropdown = this.buildFontList(fonts, searchBox, apiRoute);
                addListToDropdown( dropdown, this.buildFontList(fonts, searchBox, apiRoute), {
                    role: 'menu',
                    ariaLabel: 'Font Family'
                } );
                dropdown.on('change:isOpen', (event, name, value) => 
                    console.log('list view', dropdown.listView.items)
                )
                
                searchBox.model.on('typed', (event, data) => {
                    console.log('typed', data);
                    console.log('all', appFonts.default);
                    const fonts = appFonts.default.filter((item) => {
                        if (!item.font) return true;
                        return item.font.toLowerCase().indexOf(data.toLowerCase()) > -1;
                    })
                    console.log('filtered', fonts);


                    // dropdown.listView.items.filter((item) => {
                    //     if (!item.element.innerText) return true;
                    //     return item.element.innerText.toLowerCase().indexOf(data.toLowerCase()) > -1;
                    // })

                    itemsForDropdown = this.buildFontList(fonts, searchBox, locale, apiRoute);
                    dropdown.listView.bind('items').to(itemsForDropdown);
                    // dropdown.listView.items = itemsForDropdown;
                    // dropdown.listView.destroy();
                    // dropdown.listView.render();
                    console.log('list view', dropdown.listView.items);
                    console.log('list itemsForDropdown', itemsForDropdown);
                });
        
            // });
    
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

        for (var i = 0; i < combinedFonts.length; i++) {
            const combinedFont = combinedFonts[i];
            loop: for (var j = 0; j < userFonts.length; j++) {
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
            var userFonts = data.fonts
                .map((f) => {
                    return { id: f.id, font: f.font_name, isFav: true };
                })
                .sort((a, b) => {
                    if (a.font < b.font) return -1;
                    if (a.font > b.font) return 1;
                    return 0;
                });

                // let combinedFonts = combineFonts(userFonts, appFonts);
                
                const _appFonts = JSON.parse(JSON.stringify(appFonts));
                const defaultFonts = _appFonts.default;
                const additionalFonts = _appFonts.additional;
                const combinedFonts = defaultFonts.concat(additionalFonts);

                for (var i = 0; i < combinedFonts.length; i++) {
                    const combinedFont = combinedFonts[i];
                    loop: for (var j = 0; j < userFonts.length; j++) {
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
                console.log('combined', allFonts);
                cb(combinedFonts);
        });
    }
}


function buildList() {
    if (buildListHasRunOnce && changesMade) {
      var iframe = $(this._.panel._.iframe.$);
      if (iframe[0].contentDocument || iframe[0].contentWindow) {
        iframe.contents().find('ul').remove();
      }
      this._.items = {};
      this._.list._.items = {};
    }
    var _this = this;
    if (buildListHasRunOnce && changesMade) {
      this._.committed = 0;
      this.commit();
    }
    buildListHasRunOnce = true;
}


    // allFonts = [];
    //   var doc = new CKEDITOR.dom.window(window);
    //   var changesMade = false;
    //   var buildListHasRunOnce = false;
    //   var fontsInitalised = false;
    //   var editorInstance = undefined;
    //   var idsSet = false;
    //   var dropdownLiIds = {};
    //   function saveFont(name) {
    //     $.ajax({
    //       url: apiRoute + '/create',
    //       type: 'POST',
    //       data: { font_name: name }
    //     }).done(function(data) {});
    //   }
    //   function deleteFont(id) {
    //     $.ajax({
    //       url: apiRoute + '/delete',
    //       type: 'POST',
    //       data: { font_id: id }
    //     }).done(function(data) {});
    //   }
  
  
  
    //   function changeListStructure() {
    //     var fontDropdownWrapper = this._.list.element.$;
    //     var $searchBox = $(fontDropdownWrapper).find('.cke_searchbox');
    //     var hasSearchBox = !!$searchBox.length;
    //     var $xBtn = $searchBox.find('#clear_search');
    //     var hasXbtn = !!$xBtn.length;
    //     var $list = $('ul', fontDropdownWrapper);
    //     var $itemsList = $list.children();
  
    //     var onClearSearch = function(e) {
    //       e.stopPropagation();
    //       e.preventDefault();
    //       $list.children().each(function(index, li) {
    //         $(li).show();
    //       });
    //       $searchBox.find('input').val('');
    //       $list.parent().find('.no-results').remove();
    //     };
  
    //     if (!hasSearchBox) {
    //       $searchBox = $(
    //           '<span class="cke_searchbox"><input type="text" placeholder="Search font..."></span>'
    //       );
    //       $xBtn = $('<a href="javascript:void(0)" id="clear_search" aria-label="Clear search" title="Clear search" class="clear-search"><i class="lineico-close"></i></a>');
    //       $searchBox.find('input').before($xBtn);
    //       $list.before($searchBox[0]);
    //       hasSearchBox = true;
    //     }
  
    //     $('ul li > a', fontDropdownWrapper).each(function() {
  
    //       var $anchor = $(this);
    //       var fontName = $anchor.attr('title');
    //       var $li = $anchor.parent();
    //       var fontId = $li.attr('id');
  
    //       var $label = $('label.heart-icon', $anchor[0]);
    //       $anchor.after($label[0]);
    //       $li.addClass('favourite_font_li');
  
    //       // if (!idsSet) {
    //       //   dropdownLiIds[fontName] = fontId;
    //       // } else {
    //       //   $li.attr('id', dropdownLiIds[fontName]);
    //       // }
    //     });
  
    //     // idsSet = true;
  
    //     if (hasSearchBox) {
    //       $xBtn.off('click').on('click', onClearSearch);
    //       var $searchInput = $('input', $searchBox[0]);
    //       $searchInput.off('keyup').on('keyup', function(e) {
    //         var searchValue = this.value.toLocaleLowerCase();
    //         var filteredList = $itemsList.filter(function(index, li) {
    //           var fontName = li.textContent.toLocaleLowerCase();
    //           var found = false;
    //           if (fontName.indexOf(searchValue) > -1) {
    //             $(li).show();
    //             found = true;
    //           } else if (fontName.indexOf(searchValue) === -1) {
    //             $(li).hide();
    //           }
    //           if (found) {
    //             return true;
    //           } else {
    //             return false;
    //           }
    //         });
    //         if (filteredList.length) {
    //           $list.parent().find('.no-results').remove();
    //         } else {
    //           var noResults = $list.parent().find('.no-results');
    //           if (!noResults.length) {
    //             $list.before('<span class="no-results">No results</span>');
    //           }
    //         }
    //       });
    //     }
    //   }
  
    //   function addCombo(editor) {
    //     var config = editor.config;
    //     var acfRules = 'span';
  
    //     editor.ui.addRichCombo('favfonts', {
    //       label: 'Fonts',
    //       title: 'Fonts',
    //       toolbar: 'styles,0',
    //       allowedContent: acfRules,
    //       requiredContent: acfRules,
    //       panel: {
    //         css: [CKEDITOR.skin.getPath('editor')].concat(config.contentsCss),
    //         multiSelect: false,
    //         attributes: { 'aria-label': "Font" }
    //       },
  
    //       init() {
    //         this.startGroup('Font Name');
    //         var rebuildList = CKEDITOR.tools.bind(buildList, this);
    //         $(editor).bind('rebuildList', rebuildList);
    //         getUserFonts();
    //       },
  
    //       onOpen() {
    //         if (changesMade) {
    //           $(editor).trigger('rebuildList');
    //           changesMade = false;
    //         }
    //         var _changeListStructure = CKEDITOR.tools.bind(
    //             changeListStructure,
    //             this
    //         );
    //         _changeListStructure();
  
    //         var fontDropdownWrapper = this._.list.element.$;
    //         $(fontDropdownWrapper).on('click', 'input', function() {
    //           var $checkbox = $(this);
    //           var fontName = $checkbox.val();
    //           var isChecked = $checkbox.prop('checked');
    //           var fontId = $checkbox.attr('data-fontid');
    //           if (isChecked) {
    //             saveFont(fontName);
    //           } else {
    //             deleteFont(fontId);
    //           }
    //           changesMade = true;
    //         });
    //       },
  
    //       onClose() {
    //         var fontDropdownWrapper = this._.list.element.$;
    //         var $list = $('ul', fontDropdownWrapper);
    //         $list.parent().find('.no-results').remove();
    //         $(fontDropdownWrapper).off('click');
    //         var searchInput = $(fontDropdownWrapper).find(
    //             '.cke_searchbox > input'
    //         )[0];
    //         if (searchInput) {
    //           searchInput.value = '';
    //         }
    //         if (changesMade) {
    //           getUserFonts();
    //         }
    //       },
  
    //       onClick(value, e) {
    //         editor.focus();
    //         editor.fire('saveSnapshot');
    //         editor.applyStyle(
    //             new CKEDITOR.style({
    //               element: 'span',
    //               styles: { 'font-family': value }
    //             })
    //         );
    //         editor.fire('saveSnapshot');
    //         this.setValue(value);
    //         var labelText = $('.cke_combo__favfonts .cke_combo_text')[0];
    //         labelText.innerText = labelText.innerText.replace(/"/g,'');
    //       }
    //     });
    //   }
  
    //   function addPlugin() {
    //     CKEDITOR.plugins.add('favfonts', {
    //       requires: 'richcombo',
    //       init(editor) {
    //         editorInstance = editor;
    //         var config = editor.config;
    //         addCombo(editor);
    //       },
    //     });
    //   }
    // //   return {
    // //     init() {
    // //       addPlugin();
    // //     }
    // //   };
    
    // var plugin = new FavFonts();
    // plugin.init();
mix(FavFonts, EmitterMixin);