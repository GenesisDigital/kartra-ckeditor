(function() {
    console.log('ccc');

    CKEDITOR.plugins.add('colorpickerbuttons', {
        requires: 'panelbutton,floatpanel',
        icons: 'bgpickercolor,textpickercolor',
        hidpi: true,
        init: function(editor) {
            var config = editor.config,
                doc = new CKEDITOR.dom.window(window),
                jsVars = doc.$.parent.jsVars;

//            console.log(doc);
//            console.log(jsVars);

            if (!CKEDITOR.env.hc) {
                addButton({
                    name: 'TextPickerColor',
                    type: 'fore',
                    commandName: 'textPickerColor',
                    title: 'Text Color',
                    order: 10,
                    contentTransformations: [
                        [
                            {
                                element: 'font',
                                check: 'span{color}',
                                left: function(element) {
                                    return !!element.attributes.color;
                                },
                                right: function(element) {
                                    element.name = 'span';
                                    element.attributes.color && (element.styles.color = element.attributes.color);

                                    delete element.attributes.color;
                                }
                            }
                        ]
                    ]
                });

                var contentTransformations,
                    normalizeBackground = editor.config['colorButton_normalizeBackground'];

                if (normalizeBackground === undefined || normalizeBackground) {
                    contentTransformations = [
                        [
                            {
                                // Transform span that specify background with color only to background-color.
                                element: 'span',
                                left: function( element ) {
                                    var tools = CKEDITOR.tools;

                                    if (element.name !== 'span' || !element.styles || !element.styles.background) {
                                        return false;
                                    }

                                    var background = tools.style.parse.background( element.styles.background );

                                    // We return true only if background specifies **only** color property, and there's only one background directive.
                                    return background.color && tools.object.keys( background ).length === 1;
                                },
                                right: function( element ) {
                                    var style = new CKEDITOR.style( editor.config.colorButton_backStyle, {
                                            color: element.styles.background
                                        } ),
                                        definition = style.getDefinition();

                                    // Align the output object with the template used in config.
                                    element.name = definition.element;
                                    element.styles = definition.styles;
                                    element.attributes = definition.attributes || {};

                                    return element;
                                }
                            }
                        ]
                    ];
                }

                addButton({
                    name: 'BGPickerColor',
                    type: 'back',
                    commandName: 'bgPickerColor',
                    title: 'Background Color',
                    order: 20,
                    contentTransformations: contentTransformations
                });
            }

            function addButton(options) {
                var name = options.name,
                    type = options.type,
                    title = options.title,
                    order = options.order,
                    commandName = options['commandName'],
                    contentTransformations = options.contentTransformations || {},
                    style = new CKEDITOR.style(config['colorPickerButton_' + type + 'Style']),
//                    colorBoxId = CKEDITOR.tools.getNextId() + '_colorPickerBox',
                    colorData = { type: type },
                    defaultColorStyle = new CKEDITOR.style(config['colorPickerButton_' + type + 'Style'], { color: 'inherit' }),
//                    clickFn = createClickFunction(),
//                    history = ColorHistory.getRowLimit( editor ) ? new ColorHistory(editor, type == 'back' ? 'background-color' : 'color', clickFn) : undefined,
                    panelBlock;

                editor.addCommand(commandName, {
                    contextSensitive: true,

                    exec: function(editor, data) {
                        if (editor.readOnly) {
                            return;
                        }

                        var newStyle = data['newStyle'];

                        console.log(newStyle);

                        editor.removeStyle(defaultColorStyle);
                        editor.focus();

                        if (newStyle) {
                            editor.applyStyle(newStyle);
                        }

                        editor.fire('saveSnapshot');
                    },

                    refresh: function(editor, path) {
//                        if (!defaultColorStyle.checkApplicable(path, editor, editor.activeFilter)) {
//                            this.setState(CKEDITOR.TRISTATE_DISABLED);
//                        } else if (defaultColorStyle.checkActive(path, editor)) {
//                            this.setState(CKEDITOR.TRISTATE_ON);
//                        } else {
//                            this.setState(CKEDITOR.TRISTATE_OFF);
//                        }
                        if (!editor.activeFilter.check(style)) {
                            this.setState(CKEDITOR.TRISTATE_DISABLED);
                        }
                    }
                });

                editor.ui.add(name, CKEDITOR.UI_PANELBUTTON, {
                    label: title,
                    title: title,
                    command: commandName,
                    editorFocus: 0,
                    modes: {
                        wysiwyg: 1
                    },
                    toolbar: 'colors,' + order,
                    allowedContent: style,
                    requiredContent: style,
                    contentTransformations: contentTransformations,

                    panel: {
                        css: CKEDITOR.skin.getPath('editor'),
                        attributes: {
                            role: 'listbox',
                            'aria-label': 'Colors'
                        }
                    },

                    select: function(callback) {
//                        var colors = config.colorButton_colors.split( ',' ),
//                            color = CKEDITOR.tools.array.find( colors, callback );
//
//                        color = normalizeColor( color );
//
//                        selectColor( panelBlock, color );
//                        panelBlock._.markFirstDisplayed();
                        console.log('select');
                    },

                    onBlock: function(panel, block) {
                        panelBlock = block;
                        block.autoSize = true;
                        block.element.addClass('cke_colorpickerblock');
                        block.element.setHtml(renderColorPicker(block));

                        block.element.getDocument().getBody().setStyle( 'overflow', 'hidden' );

                        CKEDITOR.ui.fire('ready', this);
                    },

                    onOpen: function() {
                        var selection = editor.getSelection(),
                            block = selection && selection.getStartElement(),
                            path = editor.elementPath( block ),
                            cssProperty = type === 'back' ? 'background-color' : 'color',
                            automaticColor;

                        console.log('on open');

                        if (!path) {
                            return;
                        }

                        console.log(path);

                        // Find the closest block element.
                        block = path.block || path.blockLimit || editor.document.getBody();

                        // The background color might be transparent. In that case, look up the color in the DOM tree.
                        do {
                            automaticColor = block && block.getComputedStyle( cssProperty ) || 'transparent';
                        }
                        while (type === 'back' && automaticColor === 'transparent' && block && (block = block.getParent()));

                        // The box should never be transparent.
                        if (!automaticColor || automaticColor === 'transparent') {
                            automaticColor = '#ffffff';
                        }

//                        if (config.colorButton_enableAutomatic) {
//                            panelBlock.element.findOne( '#' + colorBoxId ).setStyle( 'background-color', automaticColor );
//                        }

                        var range = selection && selection.getRanges()[0];

                        if (range) {
                            var walker = new CKEDITOR.dom.walker(range),
                                element = range.collapsed ? range.startContainer : walker.next(),
                                finalColor = '',
                                currentColor;

                            while (element) {
                                if (element.type !== CKEDITOR.NODE_ELEMENT) {
                                    element = element.getParent();
                                }

                                currentColor = normalizeColor(element.getComputedStyle(cssProperty));
                                finalColor = finalColor || currentColor;

                                if (finalColor !== currentColor) {
                                    finalColor = '';

                                    break;
                                }

                                element = walker.next();
                            }

                            if (finalColor === 'transparent') {
                                finalColor = '';
                            }

                            if (type === 'fore') {
                                colorData.automaticTextColor = '#' + normalizeColor(automaticColor);
                            }

                            colorData.selectionColor = finalColor ? '#' + finalColor : '';

//                            console.log(finalColor);

//                            selectColor(panelBlock, finalColor);
                        }

//                        console.log(automaticColor);

                        return automaticColor;
                    },
                });
            }

            function renderColorPicker(block) {
//                css/new/css/ckeditor_color_picker.css

//                CKEDITOR.document.appendStyleSheet('css/new/css/ckeditor_color_picker.css');

                var scriptJquery = document.createElement('script'),
                    doc = block.element.getDocument(),
                    head = doc.$.head,
                    output = [];

                scriptJquery.src = '/js/node_modules/kartra-jquery/jquery-1.10.2/jquery-1.10.2.min.js';
                scriptJquery.onload = function () {
                    var scriptKspectrum = document.createElement('script');

                    scriptKspectrum.src = '/js/node_modules/kspectrum/dist/kspectrum.jquery.js';

                    scriptKspectrum.onload = function () {
                        var colorPaletteInputs = block.element.find('.js_ckeditor_colorpalette_input');

                        console.log(colorPaletteInputs.$[0].ownerDocument)

                        $(colorPaletteInputs.$[0]).kspectrum({
                            spectrumOptions: {
                                showInput: false,
                                showAlpha: false
                            }
                        });
                    };

                    head.appendChild(scriptKspectrum);
                };

                head.appendChild(scriptJquery);

                output.push('<div class="js_ckeditor_colorpalette"><input class="js_ckeditor_colorpalette_input" /></div>' );

                return output.join('');
            }

            /*
			* Converts a CSS color value to an easily comparable form.
			*
			* @private
			* @member CKEDITOR.plugins.colorbutton
			* @param {String} color
			* @returns {String}
			*/
            function normalizeColor(color) {
                // Replace 3-character hexadecimal notation with a 6-character hexadecimal notation (#1008).
                return normalizeHex('#' + CKEDITOR.tools.convertRgbToHex( color || '')).replace(/#/g, '');
            }

            function normalizeHex(styleText) {
                return styleText.replace( /#(([0-9a-f]{3}){1,2})($|;|\s+)/gi, function( match, hexColor, hexColorPart, separator ) {
                    var normalizedHexColor = hexColor.toLowerCase();

                    if (normalizedHexColor.length === 3) {
                        var parts = normalizedHexColor.split( '' );

                        normalizedHexColor = [ parts[ 0 ], parts[ 0 ], parts[ 1 ], parts[ 1 ], parts[ 2 ], parts[ 2 ] ].join( '' );
                    }

                    return '#' + normalizedHexColor + separator;
                } );
            }
        }
    });

    CKEDITOR.config.colorPickerButton_foreStyle = {
        element: 'span',
        styles: {
            'color': '#(color)'
        },
        overrides: [{
            element: 'font',
            attributes: {
                'color': null
            }
        }]
    };

    CKEDITOR.config.colorPickerButton_backStyle = {
        element: 'span',
        styles: { 'background-color': '#(color)' }
    };
})();
//(function() {
//    function BackgroundColorBtn() {
//        var doc = new CKEDITOR.dom.window(window);
//        var jsVars = doc.$.parent.jsVars;
//
//        function addButton(editor) {
//            var config = editor.config;
//
//            editor.addCommand('kspectrum_bg_color', {
//                exec: function(e) {
//                    e.insertHtml('bgcolor');
//                }
//            });
//
//            for(var i in CKEDITOR.instances){
//                CKEDITOR.instances[i].ui.addButton('BgColorX', {
//                    label: 'Background Color',
//                    command: 'kspectrum_bg_color',
//                    icon: 'https://avatars1.githubusercontent.com/u/5500999?v=2&s=16'
//                });
//            }
//        }
//
//        function addPlugin() {
//            CKEDITOR.plugins.add('colorpickerbutton', {
//                init(editor) {
//                    addButton(editor);
//                },
//            });
//        }
//        return {
//            init() {
//                addPlugin();
//            }
//        };
//    }
//
//    var plugin = new BackgroundColorBtn();
//
//    plugin.init();
//})();