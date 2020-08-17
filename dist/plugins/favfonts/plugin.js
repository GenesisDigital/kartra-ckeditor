(function() {
  function BackgroundColorBtn() {
    var doc = new CKEDITOR.dom.window(window);
    var jsVars = doc.$.parent.jsVars;

    function addButton(editor) {
      var config = editor.config;

      editor.addCommand("kspectrum_bg_color", {
        exec: function(e) {
          e.insertHtml('bgcolor');
        }
      });

      editor.ui.addButton('BgColor', {
        label: "Background Color",
        command: 'kspectrum_bg_color',
        icon: CKEDITOR.plugins.getPath('textShadow') + 'icons/textShadow.png'
      });
    }

    function addPlugin() {
      CKEDITOR.plugins.add('favfonts', {
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
  var plugin = new BackgroundColorBtn();
  plugin.init();
})();
