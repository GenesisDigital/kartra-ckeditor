(function() {
    function ColorPicker() {
      var doc = new CKEDITOR.dom.window(window);
      var jsVars = doc.$.parent.jsVars;
  
      function addButton(editor) {
        var config = editor.config;
        
      }

      function addPlugin() {
        CKEDITOR.plugins.add('colorpicker', {
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
    var plugin = new ColorPicker();
    plugin.init();
  })();
  