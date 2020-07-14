import 'kspectrum/dist/kspectrum.jquery';

(function() {
    function ColorPicker() {
      var doc = new CKEDITOR.dom.window(window);
      var jsVars = doc.$.parent.jsVars;
  
      function addButton(editor) {
        var config = editor.config;

        editor.addCommand("kspectrum_text_color", {
          exec: function(e) {
            e.insertHtml('textcolor');
          }
        });

        editor.addCommand("kspectrum_bg_color", {
          exec: function(e) {
            e.insertHtml('bgcolor');
          }
        });

        editor.ui.addButton('TextColor', {
            label: "Text Color",
            command: 'kspectrum_text_color',
            toolbar: 'basicstyles',
            icon: 'textcolor'
        });
        editor.ui.addButton('BgColor', {
          label: "Background Color",
          command: 'kspectrum_bg_color',
          toolbar: 'basicstyles',
          icon: 'bgcolor'
      });
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
  