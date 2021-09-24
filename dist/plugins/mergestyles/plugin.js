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

        editor.on('change', function(event) {
            if (editor.elementMode === 1){
                var length = $(editor.document['$'].body.innerHTML).length
                    ? $(editor.document['$'].body.innerHTML)[0].textContent.length :
                    0;

                if (length === currentLength) {
                    oldContent = mergeStyles(oldContent);

//                    var selectionPositions = getSelectionPositions();


                    contentChangedBefore = true;
                    contentChangedAfter = true;
                } else {
                    currentLength = length;
                }
            }
        });

//        editor.on('contentDom', function() {
//            if (editor.elementMode === 3) {
//                this.document.on('click', function(event){
//                    console.log('contentDom');
//
//                    if ($(event.data['$'].target).parents('.cke_toolbox').length > 0) {
//                        if (oldContent === null) {
//                            if (editor.elementMode === 1){
//                                oldContent = editor.document['$'].body.innerHTML;
//                            } else {
//                                oldContent = editor.element.getHtml();
//                            }
//                        }
//
//                        editor.fire( 'saveSnapshot' );
//                        oldContent = mergeStyles(oldContent);
//                        contentChangedBefore = true;
//                        contentChangedAfter = true;
//                    }
//                });
//            }
//        });

//        editor.on('saveSnapshot', function (e) {
//            if (contentChangedBefore && contentChangedAfter) {
//                contentChangedBefore = false;
//            } else if (contentChangedAfter) {
//                contentChangedAfter = false;
//
//                console.log('save snapshot');
//
//                oldContent = mergeStyles(oldContent);
//            }
//        });

        function mergeStyles(currentContent) {
            if (typeof editor.element === 'undefined') {
                return currentContent;
            }

            var newContent,
                inline = true;

            if (editor.elementMode === 1){
                inline = false;
                newContent = editor.document['$'].body.innerHTML;
            } else {
                newContent = editor.element.getHtml();
            }

//            console.log('before cascade: ', newContent);

            if (
                currentContent !== newContent
                && newContent.indexOf('span') !== -1
            ) {
                var $newContentObject = $(newContent).wrapAll('<div />').parent();

                currentContent = cascadeParameters($newContentObject);

//                if (editor.config.use_em !== true) {
//                    setFontSize(currentContent);
//                }
//
//                setLineHeight(currentContent);
                unwrapNonSpans(currentContent);
                currentContent = $(currentContent[0]).html();

//                console.log('after unwrap: ', currentContent);

                var selectionPositions = getSelectionPositions();

                console.log(selectionPositions);

                if (selectionPositions !== null) {
                    if (inline) {
                        editor.setData(currentContent);
                        currentContent = editor.element.getHtml();
                    } else {
                        editor.document['$'].body.innerHTML = currentContent;
                    }

                    var nodes = getSelectionNodes(selectionPositions);

                    console.log('selection nodes: ', nodes);

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
                selectedText = selection && selection.getSelectedText(),


                ranges = selection && selection.getRanges(),
                iterator = ranges.createIterator(),
                range;

//            if (!ranges) {
//                return null;
//            }
//
//            while (range = iterator.getNextRange()) {
//                range.enlarge(CKEDITOR.ENLARGE_INLINE);
//
//                // Bookmark the range so we can re-select it after processing.
//                var bookmark = range.createBookmark(),
//                    // The style will be applied within the bookmark boundaries.
//                    startNode = bookmark.startNode,
//                    endNode = bookmark.endNode,
//                    currentNode;
//
//                console.log(bookmark);
//                console.log(startNode);
//                console.log(endNode);
//
////                range.moveToBookmark(bookmark);
//            }

//            console.log('selection: ', selection);
//            console.log('start el', startElement);
//            console.log('Ranges', ranges);


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
//                    console.log('node: ', node['$']);
//                    console.log('node length: ', node['$'].length);

                    if (node['$'] === element['$']) {
                        addElementLength = false;
                    }

                    if (addElementLength && node['$'].length !== undefined) {
                        elementPosition += node['$'].length;
                    }
                });

//                console.log('element text length: ', $(element['$']).text().length);
//                console.log('text length: ', textLength);

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
        };

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
        };

//        function setLineHeight($content) {
//            if (editor.getSelection().getStartElement() === null) {
//                return;
//            }
//
//            var $selection = $(editor.getSelection().getStartElement()['$']);
//            var lineHeight = inlineStyle($selection, 'line-height');
//
//            while (lineHeight === '' && !$selection.is(blockElements)){
//                $selection = $selection.parent();
//                lineHeight = inlineStyle($selection, 'line-height');
//            }
//
//            if (lineHeight !== '') {
//                $("[style*='line-height']", $content).each(function() {
//                    if (inlineStyle($(this), 'line-height') === lineHeight) {
//                        $(this).find("*").css({'line-height': lineHeight});
//
//                        if ($(this).parent().is(blockElements)) {
//                            $(this).parent().css({'line-height': lineHeight});
//                        } else {
//                            if ($(this).parent().prop("tagName") === 'SPAN') {
//                                $(this).parent().css({'line-height': lineHeight});
//                            }
//
//                            $(this).parentsUntil(blockElements).each(function() {
//                                if ($(this).parent().prop("tagName") === 'SPAN' || $(this).parent().is(blockElements)) {
//                                    $(this).parent().css({'line-height': lineHeight});
//                                }
//                            });
//                        }
//                    }
//                });
//            }
//        }
//
//        function setFontSize($content) {
//            if (editor.getSelection().getStartElement() === null) {
//                return;
//            }
//
//            var $selection = $(editor.getSelection().getStartElement()['$']),
//                fontSize = inlineStyle($selection, 'font-size'),
//                selectionPositions = getSelectionPositions(),
//                nodes = null;
//
//            if (selectionPositions !== null) {
//                nodes = getSelectionNodes(selectionPositions);
//            }
//
//            while (fontSize === '' && !$selection.is(blockElements)){
//                $selection = $selection.parent();
//                fontSize = inlineStyle($selection, 'font-size');
//            }
//
//            if (fontSize !== '') {
//                $("[style*='font-size']", $content).each(function() {
//                    if (inlineStyle($(this), 'font-size') === fontSize && nodes !== null) {
//                        var selectedNode = $(nodes[0]['$']);
//
//                        if (selectedNode.prop('tagName') === 'P' || selectedNode.prop('tagName') === 'DIV') {
//                            if ($(this).parent().prop('tagName') === 'P') {
//                                $(this).parent().css({'font-size': fontSize});
//                            }
//                        }
//                    }
//                });
//            }
//        };
    }
} );