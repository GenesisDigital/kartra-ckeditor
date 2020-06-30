(function() {
    allFonts = [];
    function FavFonts() {
      var doc = new CKEDITOR.dom.window(window);
      var jsVars = doc.$.parent.jsVars;
      var appFonts = {
        default:
          jsVars && jsVars.fonts && jsVars.fonts.default
            ? jsVars.fonts.default
            : [],
        additional:
          jsVars && jsVars.fonts && jsVars.fonts.available
            ? jsVars.fonts.available
            : []
      };
      var apiRoute = jsVars.secureBaseUrl + '/v2/favouriteFonts';
      var changesMade = false;
      var buildListHasRunOnce = false;
      function getUserFonts() {
        if (!jsVars.getUserFonts) return;
        $.ajax({
          url: apiRoute + '/get',
          type: 'GET'
        }).done(function(data) {
          var userFonts = data.fonts
            .map(function(f) {
              return { id: f.id, font: f.font_name, isFav: true };
            })
            .sort(function(a, b) {
              if (a.font < b.font) return -1;
              if (a.font > b.font) return 1;
              return 0;
            });
          combineFonts(userFonts);
        });
      }
      function saveFont(name) {
        $.ajax({
          url: apiRoute + '/create',
          type: 'POST',
          data: { font_name: name }
        }).done(function(data) {});
      }
      function deleteFont(id) {
        $.ajax({
          url: apiRoute + '/delete',
          type: 'POST',
          data: { font_id: id }
        }).done(function(data) {});
      }
  
      function combineFonts(userFonts) {
        var _appFonts = JSON.parse(JSON.stringify(appFonts));
        var defaultFonts = _appFonts.default;
        var additionalFonts = _appFonts.additional;
        var combinedFonts = defaultFonts.concat(additionalFonts);
  
        for (var i = 0; i < combinedFonts.length; i++) {
          var combinedFont = combinedFonts[i];
          loop: for (var j = 0; j < userFonts.length; j++) {
            var userFont = userFonts[j];
            if (combinedFont.font === userFont.font) {
              combinedFonts[i].id = userFont.id;
              combinedFonts[i].isFav = true;
              break loop;
            }
          }
        }
  
        combinedFonts.sort(function compare(a, b) {
          if (typeof a.id === 'undefined') a.id = 9999;
          if (typeof b.id === 'undefined') b.id = 9999;
          return a.id - b.id || a.font.localeCompare(b.font);
        });
  
        allFonts = combinedFonts;
      }
  
      function buildList() {
        if (buildListHasRunOnce && changesMade) {
          var ul = $(this._.panel._.iframe.$)
            .contents()
            .find('ul');
          ul.remove();
          this._.items = {};
          this._.list._.items = {};
        }
        var _this = this;
        allFonts.forEach(function(f) {
          var fontSlug = f.font;
          var fontFamily = fontSlug.split('+').join(' ');
          var isFav = f.isFav === true;
          var fontId = f.id;
          _this.add(
            fontFamily,
            '<span style="font-family:\'' +
              fontFamily +
              '\';">' +
              fontFamily +
              '</span><label class="heart-icon"><input type="checkbox" ' +
              (isFav ? 'checked' : '') +
              ' value="' +
              fontSlug +
              '" data-fontid="' +
              fontId +
              '"/><small></small></label>',
            fontFamily
          );
        });
  
        if (buildListHasRunOnce & changesMade) {
          this._.committed = 0;
          this.commit();
        }
        buildListHasRunOnce = true;
      }
  
      function changeListStructure() {
        var fontDropdownWrapper = this._.list.element.$;
        var $searchBox = $(fontDropdownWrapper).find('.cke_searchbox');
        var hasSearchBox = !!$searchBox.length;
        var $list = $('ul', fontDropdownWrapper);
        var $itemsList = $list.children();
  
        $('ul li > a', fontDropdownWrapper).each(function() {
          var $anchor = $(this);
          var $li = $anchor.parent();
          var $label = $('label.heart-icon', $anchor[0]);
          $anchor.after($label[0]);
          $li.addClass('favourite_font_li');
        });
  
        if (!hasSearchBox) {
          $searchBox = $(
            '<span class="cke_searchbox"><input type="text" placeholder="Search font..."><i></i></span>'
          );
          var $xBtn = $('<a href="javascript:void(0)" style="width: 10px; height: 10px; font-size: 10px; display: block; background: red"><i class="lineico-close"></i></a>').on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $itemsList.forEach(function(index, li) {
                $(li).show();
            });
            $searchBox.find('input').val('');
        });
          $searchBox.find('input').before($xBtn);
          $list.before($searchBox[0]);
          hasSearchBox = true;
        }
  
        if (hasSearchBox) {
          var $searchInput = $('input', $searchBox[0]);
          $searchInput.off('keyup').on('keyup', function(e) {
            // if (!this.value) return;
            var searchValue = this.value.toLocaleLowerCase();
            var filteredList = $itemsList.filter(function(index, li) {
              var fontName = li.textContent.toLocaleLowerCase();
              var found = false;
              if (fontName.indexOf(searchValue) > -1) {
                $(li).show();
                found = true;
              } else if (fontName.indexOf(searchValue) === -1) {
                $(li).hide();
              }
              if (found) {
                return true;
              } else {
                return false;
              }
            });
            if (filteredList.length) {
              $list.parent().find('.no-results').remove();
            } else {
              $list.before('<span class="no-results">No results</span>');
            }
          });
        }
      }
  
      function addCombo(editor) {
        var config = editor.config;
        var acfRules = 'span';
  
        editor.ui.addRichCombo('favfonts', {
          label: 'Fonts',
          title: 'Fonts',
          toolbar: 'styles,0',
          allowedContent: acfRules,
          requiredContent: acfRules,
          panel: {
            css: [CKEDITOR.skin.getPath('editor')].concat(config.contentsCss),
            multiSelect: false
          },
  
          init() {
            this.startGroup('Font Name');
            var rebuildList = CKEDITOR.tools.bind(buildList, this);
            rebuildList();
            $(editor).bind('rebuildList', rebuildList);
          },
  
          onOpen() {
            if (changesMade) {
              $(editor).trigger('rebuildList');
              changesMade = false;
            }
            var _changeListStructure = CKEDITOR.tools.bind(
              changeListStructure,
              this
            );
            _changeListStructure();
            var fontDropdownWrapper = this._.list.element.$;
            $(fontDropdownWrapper).on('click', 'input', function() {
              var $checkbox = $(this);
              var fontName = $checkbox.val();
              var isChecked = $checkbox.prop('checked');
              var fontId = $checkbox.attr('data-fontid');
              if (isChecked) {
                saveFont(fontName);
              } else {
                deleteFont(fontId);
              }
              changesMade = true;
            });
          },
  
          onClose() {
            var fontDropdownWrapper = this._.list.element.$;
            $(fontDropdownWrapper).off('click');
            var searchInput = $(fontDropdownWrapper).find(
              '.cke_searchbox > input'
            )[0];
            searchInput.value = '';
            if (changesMade) {
              getUserFonts();
            }
          },
  
          onClick(value, e) {
            editor.focus();
            editor.fire('saveSnapshot');
            editor.applyStyle(
              new CKEDITOR.style({
                element: 'span',
                styles: { 'font-family': value }
              })
            );
            editor.fire('saveSnapshot');
            this.setValue(value);
          }
        });
      }
  
      function addPlugin() {
        CKEDITOR.plugins.add('favfonts', {
          requires: 'richcombo',
          init(editor) {
            var config = editor.config;
            addCombo(editor);
          },
        });
      }
      return {
        init() {
          getUserFonts();
          addPlugin();
        }
      };
    }
    var plugin = new FavFonts();
    plugin.init();
  })();
  