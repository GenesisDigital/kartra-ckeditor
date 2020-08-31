CKEDITOR.plugins.add('favfonts', {
  icons: 'bold',
  init(editor) {
    editor.addCommand( 'insertTimestamp', {
      exec: function( editor ) {
          var now = new Date();
          editor.insertHtml( 'The current date and time is: <em>' + now.toString() + '</em>' );
      }
    });
  },
});

for(var i in CKEDITOR.instances){
    CKEDITOR.instances[i].ui.addButton( 'Timestamp', {
      label: 'Insert Timestamp',
      command: 'insertTimestamp',
      icon    : 'bold'
    });
}