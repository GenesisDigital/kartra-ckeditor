(function () {
  'use strict';

  (function () {
    function BackgroundColorBtn() {
      var doc = new CKEDITOR.dom.window(window);
      var jsVars = doc.$.parent.jsVars;

      function addButton(editor) {
        var config = editor.config;
        editor.addCommand("kspectrum_bg_color", {
          exec: function exec(e) {
            e.insertHtml('bgcolor');
          }
        });
        editor.ui.addButton('BgColor', {
          label: "Background Color",
          command: 'kspectrum_bg_color',
          toolbar: 'basicstyles',
          icon: 'bgcolor'
        });
      }

      function addPlugin() {
        CKEDITOR.plugins.add('BgColorKspectrum', {
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

    var plugin = new BackgroundColorBtn();
    plugin.init();
  })();

}());
//# sourceMappingURL=plugin.js.map
