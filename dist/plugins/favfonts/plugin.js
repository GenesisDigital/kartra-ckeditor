(function() {
  allFonts = [];
  function FavFonts() {
    function addButton(editor) {
      editor.addCommand( 'insertTimestamp', {
        exec: function( editor ) {
            var now = new Date();
            editor.insertHtml( 'The current date and time is: <em>' + now.toString() + '</em>' );
        }
      });
      editor.ui.addButton( 'Timestamp', {
          label: 'Insert Timestamp',
          command: 'insertTimestamp',
          toolbar: 'insert'
      });
    }

    function addPlugin() {
      CKEDITOR.plugins.add('favfonts', {
        icons: 'timestamp',
        init(editor) {
          addButton(editor);
        },
      });
    }
    return {
      init() {
        addPlugin();
      }
    };
  }
  var plugin = new FavFonts();
  plugin.init();
})();