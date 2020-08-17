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

      for(var i in CKEDITOR.instances){
        CKEDITOR.instances[i].ui.addButton('BgColorX', {
          label: "Background Color",
          command: 'kspectrum_bg_color',
          icon: 'https://avatars1.githubusercontent.com/u/5500999?v=2&s=16'
        });
      } 
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
