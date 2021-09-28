CKEDITOR.plugins.add('mergestyles', {
    afterInit: function( editor ) {
        //These are the properties we want to cascade down to child elements, not things like margin etc or block properties like text align
        var textProperties = ['font', 'font-family', 'font-stretch', 'font-variant', 'font-style', 'letter-spacing', 'color', 'background-color', 'line-height'],
            //Used to check for closest block parent to set block properties (in this plugin, line-height) on
            blockElements = 'p, li, ol, ul, h1, h2, h3, h4, h5, h6, dl, dt, div, tl, td, form, table, fieldset, div, hr, body, blockquote, address, br',
            oldContent = null,
            contentChangedBefore = false,
            contentChangedAfter = false,
            currentLength = 0;

        if (editor.config.use_em !== true) textProperties.push('font-size');

        editor.on('change', function() {
            if (editor.elementMode === 1){
                var length = $(editor.getData()).length
                    ? $(editor.getData())[0].textContent.length :
                    0;

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
            if (editor.elementMode === 3) {
                this.document.on('click', function(event){
                    if ($(event.data['$'].target).parents('.cke_toolbox').length > 0) {
                        if (oldContent === null) {
                            if (editor.elementMode === 1){
                                oldContent = editor.getData();
                            } else {
                                oldContent = editor.element.getHtml();
                            }
                        }

                        editor.fire('saveSnapshot');
                        oldContent = mergeStyles(oldContent);
                        
                        contentChangedBefore = true;
                        contentChangedAfter = true;
                    }
                });
            }
        });

        editor.on('saveSnapshot', function (e) {
            if (
                contentChangedBefore
                && contentChangedAfter
            ) {
                contentChangedBefore = false;
            } else if (contentChangedAfter) {
                contentChangedAfter = false;

                oldContent = mergeStyles(oldContent);
            }
        });

        function mergeStyles(currentContent) {
            if (typeof editor.element === 'undefined') {
                return currentContent;
            }

            var newContent;
//                inline = true;

            if (editor.elementMode === 1){
//                inline = false;
                newContent = editor.getData();
            } else {
                newContent = editor.element.getHtml();
            }

            if (
                currentContent !== newContent
                && newContent.indexOf('span') !== -1
            ) {
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
                    editor.editable().setHtml(currentContent);

//                    if (inline) {
//                        editor.setData(currentContent);
//                        currentContent = editor.element.getHtml();
//                    } else {
//                        editor.document['$'].body.innerHTML = currentContent;
//                    }

                    var nodes = getSelectionNodes(selectionPositions);

                    setSelectionPositions(nodes[0], nodes[1]);
                }
            }

            return currentContent;
        }

        function inlineStyle($element, prop) {
            return $element.prop('style')[$.camelCase(prop)];
        }

        //If you set styles on certain elements ckeditor freaks out
        function unwrapNonSpans($element) {
            $element
                .find('*')
                .not('span, iframe, img, div, p, ul, ol, li')
                .each(function() {
                    var $el = $(this),
                        style = $el[0].style.cssText,
                        processedStyles = getStyles($el);

                    if (processedStyles.identical) {
                        $el.removeAttr('style');

                        if ($el.contents().length > 0) {
                            $el.contents().wrapAll('<span />');
                            $el.children()[0].style.cssText = style;
                        } else if (
                            $el.prop('tagName') === 'BR'
                            && style.trim().length
                        ) {
                            var $wrappedSpace = $el.wrap('<span />').parent();

                            $wrappedSpace[0].style.cssText = style;
                        }
                    }
                });
        }

        function cascadeParameters($element) {
            var parentStyles = getStyles($element);

            $element.children().each(function() {
                var $child = $(this),
                    childStyles = JSON.parse(JSON.stringify(parentStyles.styles)),
                    stylesList = $child.prop('style'),
                    i = 0;

                while ('undefined' !== typeof stylesList[i]) {
                    if (textProperties.indexOf(stylesList[i]) !== -1) {
                        childStyles[stylesList[i]] = inlineStyle($child, stylesList[i]);
                    }

                    i++;
                }

                $child.css(childStyles);
                cascadeParameters($child);
            });

            var returnVal = $element;

            if ($element.clone().children().remove().end().text().trim() === '') {
                returnVal = $element.clone();

                if (
                    $element.prop('tagName') === 'SPAN'
                    && parentStyles.identical
                ) {
                    $element.children().unwrap();
                }
            }

            return returnVal;
        }

        function getStyles($element){
            var styles = {},
                noOtherStyles = true,
                stylesList = $element.prop('style'),
                i = 0;

            if ('undefined' === typeof stylesList) {
                stylesList = [];
            }

            while ('undefined' !== typeof stylesList[i]) {
                if (textProperties.indexOf(stylesList[i]) !== -1) {
                    styles[stylesList[i]] = inlineStyle($element, stylesList[i]);
                } else {
                    noOtherStyles = false;
                }

                i++;
            }

            return {
                styles: styles,
                identical: noOtherStyles
            };
        }

        function getSelectionPositions() {
            var selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                selectedText = selection && selection.getSelectedText();

            if (
                selection !== null
                && startElement !== null
                && selectedText.trim() !== ''
            ) {
                var element = editor.getSelection().getRanges()[0].startContainer,
                    text = editor.getSelection().getSelectedText(),
                    textLength = text.length,
                    elementPosition = 0,
                    addElementLength = true;

                editor.editable().forEach( function(node) {
                    if (node['$'] === element['$']) {
                        addElementLength = false;
                    }

                    if (addElementLength && node['$'].length !== undefined) {
                        elementPosition += node['$'].length;
                    }
                });

                if ($(element['$']).text().length > textLength) {
                    return null;
                } else {
                    return {
                        length: textLength,
                        start: elementPosition
                    }
                }
            } else {
                return null;
            }
        }

        function getSelectionNodes(positions) {
            var elementPosition = 0;
            var startNode = null;
            var endNode = null;
            var prevNode = null;

            editor.editable().forEach(function(node) {
                var samePosition = elementPosition === positions.start;
                var nodeLength = $(node['$']).text().length;

                if (
                    samePosition
                    && nodeLength <= positions.length
                    && startNode === null
                ) {
                    startNode = node;
                }

                if (
                    startNode === null
                    && elementPosition > positions.start
                    && nodeLength === positions.length
                ) {
                    startNode = node;
                }

                if (node['$'].length !== undefined) {
                    elementPosition += node['$'].length;

                    if (
                        startNode !== null
                        && endNode === null
                        && elementPosition > positions.length + positions.start
                        && $(startNode['$']).text().length < positions.length
                    ) {
                        endNode = prevNode;
                    }
                }

                prevNode = node;
            });

            return [startNode, endNode];
        }

        function setSelectionPositions(startNode, endNode) {
            if (startNode !== null) {
                var range = editor.createRange();

                if (endNode === null) {
                    range.selectNodeContents( startNode );
                } else {
                    range.setStart(startNode, 0);
                    range.setEndAfter(endNode);
                }

                editor.getSelection().selectRanges([range]);
            }
        }

        function setLineHeight($content) {
            if (editor.getSelection().getStartElement() === null) {
                return;
            }

            var $selection = $(editor.getSelection().getStartElement()['$']),
                lineHeight = inlineStyle($selection, 'line-height');

            while (lineHeight === '' && !$selection.is(blockElements)){
                $selection = $selection.parent();
                lineHeight = inlineStyle($selection, 'line-height');
            }

            if (lineHeight !== '') {
                $('[style*="line-height"]', $content).each(function() {
                    var $el = $(this);

                    if (inlineStyle($el, 'line-height') === lineHeight) {
                        $el.find('*').css({'line-height': lineHeight});

                        if ($el.parent().is(blockElements)) {
                            $el.parent().css({'line-height': lineHeight});
                        } else {
                            if ($el.parent().prop('tagName') === 'SPAN') {
                                $el.parent().css({'line-height': lineHeight});
                            }

                            $el.parentsUntil(blockElements).each(function() {
                                if (
                                    $el.parent().prop('tagName') === 'SPAN'
                                    || $el.parent().is(blockElements)
                                ) {
                                    $el.parent().css({'line-height': lineHeight});
                                }
                            });
                        }
                    }
                });
            }
        }

        function setFontSize($content) {
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
                $('[style*="font-size"]', $content).each(function() {
                    var $el = $(this);

                    if (
                        inlineStyle($el, 'font-size') === fontSize
                        && nodes !== null
                    ) {
                        var selectedNode = $(nodes[0]['$']);

                        if (
                            selectedNode.prop('tagName') === 'P'
                            || selectedNode.prop('tagName') === 'DIV'
                        ) {
                            if ($el.parent().prop('tagName') === 'P') {
                                $el.parent().css({'font-size': fontSize});
                            }
                        }
                    }
                });
            }
        }
    }
} );