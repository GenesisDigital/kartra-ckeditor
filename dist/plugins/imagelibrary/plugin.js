CKEDITOR.plugins.add('imagelibrary', {
    icons: 'imagelibrary',
    init: function(editor) {
        editor.ui.addButton('imageLibrary', {
            label: 'Image library',
            command: 'imageLibraryCommand',
            toolbar: 'insert',
            icon: 'imagelibrary'
        });

        editor.addCommand('imageLibraryCommand', {
            exec: function(editor) {
                var event = new CustomEvent('ck:open-image-library', {
                    detail: {
                        editor,
                    },
                });
                document.dispatchEvent(event);
                return false;
            }
        });
    },
})