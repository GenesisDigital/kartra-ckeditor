CKEDITOR.plugins.add( 'mergestyles', {
    afterInit: function( editor ) {
        //These are the properties we want to cascade down to child elements, not things like margin etc or block properties like text align
        var textProperties = ['font','font-family','font-stretch','font-variant','font-style','letter-spacing','color','background-color', 'line-height'];
        if (editor.config.use_em !== true) textProperties.push('font-size');
        //Used to check for closest block parent to set block properties (in this plugin, line-height) on
        var blockElements = 'p, li, ol, ul, h1, h2, h3, h4, h5, h6, dl, dt, div, tl, td, form, table, fieldset, div, hr, body, blockquote, address';

        var oldContent = null;

        var inlineStyle = function($element, prop) {
            return $element.prop("style")[$.camelCase(prop)];
        }

        //If you set styles on certain elements ckeditor freaks out
        var unwrapNonSpans = function ($element) {
            $element.find("*").not('span').not('iframe').not('img').not('div').not('p').not('ul').not('ol').not('li').each(function() {
                var style = $(this)[0].style.cssText;
                var processedStyles = getStyles($(this));
                if (processedStyles.identical) {
                    $(this).removeAttr('style');
                    if ($(this).contents().length > 0) {
                        $(this).contents().wrapAll('<span />');
                        $(this).children()[0].style.cssText = style;
                    }
                }
            });
        }

        var cascadeParameters = function ($element) {
            var parentStyles = getStyles($element);

            $element.children().each(function() {
                var childStyles = JSON.parse(JSON.stringify(parentStyles.styles));
                var stylesList = $(this).prop("style");
                var i = 0;

                while (stylesList[i] !== undefined) {
                    if (textProperties.indexOf(stylesList[i]) !== -1) {
                        childStyles[stylesList[i]] = inlineStyle($(this), stylesList[i]);
                    }
                    i++;
                }

                $(this).css(childStyles);
                cascadeParameters($(this));
            });

            var returnVal = $element;

            if ($element.clone().children().remove().end().text().trim() === '') {
                var onlyBr = true;

                returnVal = $element.clone();

                $element.children().each(function(){
                    if ($(this).prop('tagName') !== 'BR') {
                        onlyBr = false;
                    }
                });

                if ($element.prop("tagName") === 'SPAN' && parentStyles.identical && !onlyBr) {
                    $element.children().unwrap();
                }
            }

            return returnVal;
        }

        var getStyles = function ($element){
            var styles = {};
            var noOtherStyles = true;
            var stylesList = $element.prop("style");

            if (stylesList === undefined) {
                stylesList = [];
            }

            var i = 0;

            while (stylesList[i] !== undefined) {
                if (textProperties.indexOf(stylesList[i]) !== -1) {
                    styles[stylesList[i]] = inlineStyle($element, stylesList[i]);
                } else {
                    noOtherStyles = false;
                }
                i++;
            }

            return {styles: styles, identical: noOtherStyles};
        }

        var getSelectionPositions = function () {
            var selection = editor.getSelection().getStartElement();
            if (selection !== null) {
                var element = editor.getSelection().getRanges()[0].startContainer;
                var text = editor.getSelection().getSelectedText();
                var elementPosition = 0;
                var addElementLength = true;

                editor.editable().forEach( function( node ) {
                    if (node['$'] === element['$']) {
                        addElementLength = false;
                    }
                    if (addElementLength && node['$'].length !== undefined) {
                        elementPosition += node['$'].length;
                    }
                } );

                if ($(element['$']).text().length > text.length) {
                    return null;
                } else {
                    return {
                        length: text.length,
                        start: elementPosition
                    }
                }
            } else {
                return null;
            }
        }

        var getSelectionNodes = function (positions) {
            var elementPosition = 0;
            var startNode = null;
            var endNode = null;
            var prevNode = null;

            editor.editable().forEach( function( node ) {
                var samePosition = elementPosition === positions.start;
                var nodeLength = $(node['$']).text().length;
                if (samePosition && nodeLength <= positions.length && startNode === null) {
                    startNode = node;
                }
  				if (startNode === null && elementPosition > positions.start && nodeLength === positions.length) {
  					startNode = node;
  				}

                if (node['$'].length !== undefined) {
                    elementPosition += node['$'].length;
			    	if (startNode !== null && endNode === null && elementPosition > positions.length + positions.start && $(startNode['$']).text().length < positions.length) {
                        endNode = prevNode;
                    }
                }
                prevNode = node;
            });

			return [startNode, endNode];
        };

		var setSelectionPositions = function (startNode, endNode) {
            if (startNode !== null) {
                var range = editor.createRange();
                if (endNode === null) {
                    range.selectNodeContents( startNode );
                } else {
                    range.setStart(startNode, 0);
                    range.setEndAfter(endNode);
                }
                editor.getSelection().selectRanges( [range] );
            }
        };

        var setLineHeight = function($content) {
            if (editor.getSelection().getStartElement() === null) {
                return;
            }

            var $selection = $(editor.getSelection().getStartElement()['$']);
            var lineHeight = inlineStyle($selection, 'line-height');

            while (lineHeight === '' && !$selection.is(blockElements)){
                $selection = $selection.parent();
                lineHeight = inlineStyle($selection, 'line-height');
            }

            if (lineHeight !== '') {
                $("[style*='line-height']", $content).each(function() {
                    if (inlineStyle($(this), 'line-height') === lineHeight) {
                        $(this).find("*").css({'line-height': lineHeight});

                        if ($(this).parent().is(blockElements)) {
                            $(this).parent().css({'line-height': lineHeight});
                        } else {
                            if ($(this).parent().prop("tagName") === 'SPAN') {
                                $(this).parent().css({'line-height': lineHeight});
                            }
                            $(this).parentsUntil(blockElements).each(function() {
                                if ($(this).parent().prop("tagName") === 'SPAN' || $(this).parent().is(blockElements)) {
                                    $(this).parent().css({'line-height': lineHeight});
                                }
                            });
                        }
                    }
                });
            }
        }

        var setFontSize = function($content) {
            if (editor.getSelection().getStartElement() === null) {
                return;
            }

            var $selection = $(editor.getSelection().getStartElement()['$']),
                fontSize = inlineStyle($selection, 'font-size'),
                selectionPositions = getSelectionPositions(),
                nodes = null;

            if (selectionPositions !== null) {
                nodes = getSelectionNodes(selectionPositions);
            }

            while (fontSize === '' && !$selection.is(blockElements)){
                $selection = $selection.parent();
                fontSize = inlineStyle($selection, 'font-size');
            }

            if (fontSize !== '') {
                $("[style*='font-size']", $content).each(function() {
                    if (inlineStyle($(this), 'font-size') === fontSize && nodes !== null) {
                        var selectedNode = $(nodes[0]['$']);

                        if (selectedNode.prop('tagName') === 'P' || selectedNode.prop('tagName') === 'DIV') {
                            if ($(this).parent().prop('tagName') === 'P') {
                                $(this).parent().css({'font-size': fontSize});
                            }
                        }
                    }
                });
            }
        };

        var mergeStyles = function(currentContent) {
            if (typeof editor.element === 'undefined') {
                return currentContent;
            }

            var newContent = editor.element.getHtml();
            var inline = true;

            if (editor.elementMode === 1){
                inline = false;
                newContent = editor.document['$'].body.innerHTML;
            }

            if (currentContent !== newContent && newContent.indexOf('span') !== -1) {
                var $newContentObject = $(newContent).wrapAll('<div />').parent();
                currentContent = cascadeParameters($newContentObject);

                if (editor.config.use_em !== true) {
                    setFontSize(currentContent);
                }

                setLineHeight(currentContent);
                unwrapNonSpans(currentContent);
                currentContent = $(currentContent[0]).html();

                var selectionPositions = getSelectionPositions();

                if (selectionPositions !== null) {
                    if (inline) {
                        editor.setData(currentContent);
                        currentContent = editor.element.getHtml();
                    } else {
                        editor.document['$'].body.innerHTML = currentContent;
                    }

                    getSelectionNodes(selectionPositions);
            		var nodes = getSelectionNodes(selectionPositions);
            		setSelectionPositions(nodes[0], nodes[1]);
                }
            }

            return currentContent;
        }

        var contentChangedBefore = false;
        var contentChangedAfter = false;
        var currentLength = 0;

        editor.on('change', function(event) {
            if (editor.elementMode === 1){
                var length = $(editor.document['$'].body.innerHTML).length ? $(editor.document['$'].body.innerHTML)[0].textContent.length : 0;
                if (length === currentLength) {
                    oldContent = mergeStyles(oldContent);
                    contentChangedBefore = true;
                    contentChangedAfter = true;
                } else {
                    currentLength = length;
                }
            }
        });

        editor.on('contentDom', function() {
            if (editor.elementMode === 3){
                this.document.on('click', function(event){
                    if ($(event.data['$'].target).parents('.cke_toolbox').length > 0) {
                        if (oldContent === null) {
                            if (editor.elementMode === 1){
                                oldContent = editor.document['$'].body.innerHTML;
                            } else {
                                oldContent = editor.element.getHtml();
                            }
                        }

                        editor.fire( 'saveSnapshot' );
                        oldContent = mergeStyles(oldContent);
                        contentChangedBefore = true;
                        contentChangedAfter = true;
                    }
                });
            }
        });

        editor.on('saveSnapshot', function (e) {
            if (contentChangedBefore && contentChangedAfter) {
                contentChangedBefore = false;
            } else if (contentChangedAfter) {
                contentChangedAfter = false;
                oldContent = mergeStyles(oldContent);
            }
        });
    }
} );