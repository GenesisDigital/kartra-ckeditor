/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here.
    // For complete reference see:
    // http://docs.ckeditor.com/#!/api/CKEDITOR.config

    // The toolbar groups arrangement, optimized for two toolbar rows.
    config.toolbarGroups = [
        { name: 'links', groups: ['Link', 'Unlink']},
        { name: 'insert' },
        { name: 'forms' },
        { name: 'alignment', groups : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
        
        { name: 'basicstyles', groups: [ 'basicstyles' ] },
        { name: 'paragraph',    groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
        { name: 'styles' },
        { name: 'colors' },
    ];

    config.toolbar_basic =
        [
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline','Strike'] },
            { name: 'paragraph', items : [ 'NumberedList','BulletedList','Blockquote']},
            { name: 'alignment', items : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
            { name: 'colors', items: [ 'TextColor' ,'BGColor'] },
            { name: 'indent', items: ['Outdent', 'Indent'] },
            { name: 'links', items : [ 'Link','Unlink'] },
            { name: 'insert', items : [ 'addImage','Youtube','HorizontalRule','EmojiPanel'] },
            { name: 'styles', items: [ 'FontSize', 'lineheight', 'Font' ] }
        ];

    config.toolbar_basic_with_mediaLibrary =
        [
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline','Strike'] },
            { name: 'paragraph', items : [ 'NumberedList','BulletedList','Blockquote']},
            { name: 'alignment', items : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
            { name: 'colors', items: [ 'TextColor' ,'BGColor'] },
            { name: 'indent', items: ['Outdent', 'Indent'] },
            { name: 'links', items : [ 'Link','Unlink'] },
            { name: 'insert', items : [ 'imageLibrary','Youtube','HorizontalRule','EmojiPanel'] },
            { name: 'styles', items: [ 'FontSize', 'lineheight', 'Font' ] }
        ];

    config.toolbar_inline =
        [
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline','Strike'] },
            { name: 'paragraph', items : [ 'NumberedList','BulletedList']},
            { name: 'alignment', items : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
            { name: 'links', items : [ 'Link','Unlink'] },
            { name: 'colors', items: [ 'TextColor' ,'BGColor'] },
            { name: 'insert', items: [ 'EmojiPanel'] }
        ];

        

    config.toolbar_Pages = [
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'textShadow', 'Bold', 'Italic', 'Underline','Strike'] },
        { name: 'paragraph', items : [ 'NumberedList','BulletedList']},
        { name: 'alignment', items : [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
        { name: 'links', items : [ 'Link','Unlink'] },
        { name: 'colors', items: [ 'TextColor' ,'BGColor'] },
        { name: 'styles', items: [ 'favfonts', 'FontSize', 'lineheight', 'TextShadow', 'Format'] }, // we leave favfonts here because we want it in Page Builder
        { name: 'insert', items: [ 'EmojiPanel'] }
    ];

    config.toolbar = 'basic';
    config.line_height = "60%;80%;100%;120%;140%;160%;180%;200%";
    config.fontSize_sizes = '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;60/60px;72/72px;96/96px;120/120px';
    config.font_names = 'Arial/Arial, Helvetica, sans-serif;Comic Sans MS/Comic Sans MS, cursive;Courier New/Courier New, Courier, monospace;Georgia/Georgia, serif; Lato/Lato; Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif; Roboto/Roboto; Tahoma/Tahoma, Geneva, sans-serif;Times New Roman/Times New Roman, Times, serif;Trebuchet MS/Trebuchet MS, Helvetica, sans-serif;Verdana/Verdana, Geneva, sans-serif';
    // Remove some buttons provided by the standard plugins, which are
    // not needed in the Standard(s) toolbar.
    config.removeButtons = 'Subscript,Superscript';

    // Set the most common block elements.
    config.format_tags = 'p;h1;h2;h3;h4;h5;h6';
    
    //config.extraPlugins = 'uploadimage';
//  config.uploadUrl = '/upload/upload_to_vendor/image';
    config.extraPlugins = 'simpleuploads,justify,dropdownFix,youtube,lineheight,colorbutton,colordialog,textShadow,mergestyles,setmenu,emoji,font,imagelibrary';
    config.removePlugins = 'liststyle,scayt';
    config.emoji_minChars = 3;
    config.textShadow_minValue = -50;
    config.textShadow_maxValue = 50;
    config.filebrowserUploadUrl = '/upload/upload_to_vendor/image';
    // Simplify the dialog windows.
    //config.removeDialogTabs = 'image:advanced;link:advanced';
//  config.extraAllowedContent = 'img[width,height]';
//  config.disallowedContent = 'img{width,height}';
    config.allowedContent = true;
    config.disableNativeSpellChecker = false;
    //responsive option shoud be checked by default
    config.youtube_responsive = true;
    config.youtube_older = false;
    if (window.jsVars) {
        config.skin = window.jsVars.theme === 'dark-mode' ? 'kartra-backend-dark,/css/new/css/v5/3rd_party/kartra-ckeditor/dark/' : 'kartra-backend,/css/new/css/v5/3rd_party/kartra-ckeditor/default/';
    } else {
        config.skin = 'kartra-backend,/css/new/css/v5/3rd_party/kartra-ckeditor/default/';
    }
    config.language = 'en';

    CKEDITOR.on('instanceReady', function (ev) {
        // Ends self closing tags the HTML4 way, like <br>.
        ev.editor.dataProcessor.htmlFilter.addRules(
            {
                elements:
                {
                    $: function (element) {
                        // Output dimensions of images as width and height
                        if (element.name == 'img') {
                            var style = element.attributes.style;

                            if (style) {
                                // Get the width from the style.
                                var match = /(?:^|\s)width\s*:\s*(\d+)px/i.exec(style),
                                    width = match && match[1];

                                // Get the height from the style.
                                match = /(?:^|\s)height\s*:\s*(\d+)px/i.exec(style);
                                var height = match && match[1];

                                if (width) {
                                    element.attributes.style = element.attributes.style.replace(/(?:^|\s)width\s*:\s*(\d+)px;?/i, '');
                                    element.attributes.width = width;
                                }

                                if (height) {
                                    element.attributes.style = element.attributes.style.replace(/(?:^|\s)height\s*:\s*(\d+)px;?/i, '');
                                    element.attributes.height = height;
                                }
                            }
                        }



                        if (!element.attributes.style)
                            delete element.attributes.style;

                        return element;
                    }
                }
            });
            ev.editor.on('paste', function(evt) {
                evt.data.dataValue = evt.data.dataValue.replace( /id=(("|')[^"]*("|')|^[^"]*$)/ig, '' );
            }, ev.editor.element.$);

        });
};
