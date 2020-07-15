(function () {
  'use strict';

  (function () {
    function TextColorBtn() {
      var doc = new CKEDITOR.dom.window(window);
      var jsVars = doc.$.parent.jsVars;

      function addButton(editor) {
        var config = editor.config;
        editor.addCommand("kspectrum_text_color", {
          exec: function exec(e) {
            e.insertHtml('textcolor');
          }
        });
        editor.ui.addButton('TextColor', {
          label: "Text Color",
          command: 'kspectrum_text_color',
          toolbar: 'basicstyles',
          icon: 'textcolor'
        });
      }

      function addPlugin() {
        CKEDITOR.plugins.add('TextColorKspectrum', {
          init: function init(editor) {
            addButton(editor);
          }
        });
      }

      return {
        init: function init() {
          addPlugin();
        }
      };
    }

    var plugin = new TextColorBtn();
    plugin.init();
  })();

}());
//# sourceMappingURL=plugin.js.map
