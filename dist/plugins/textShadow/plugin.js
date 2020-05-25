/*
	Plugin	: Text Shadow
	Author	: Michael Janea (www.michaeljanea.com)
	Version	: 1.3.1
*/

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('1.4.b(\'0\',{s:\'1h\',d:[\'3\',\'Q\',\'R\',\'V\',\'19\',\'1b\',\'1c\',\'1g\',\'5\',\'g-1k\',\'g\',\'1m\',\'1p\',\'1u\',\'1F\',\'3-m\',\'3-5\',\'3-n\',\'o\',\'p\',\'q\',\'r\',\'j\',\'j-5\',\'t\',\'u\',\'v\',\'w\',\'x\',\'y\',\'z\',\'A\',\'B\',\'C\',\'D\',\'E\',\'F\',\'G\',\'H\',\'I\',\'J\',\'K\',\'L\',\'M\',\'N\',\'O\',\'P\',\'1G\',\'9-S\',\'9\',\'T\',\'U\',\'a\',\'a-W\',\'X\',\'Y\',\'Z\',\'10\',\'11\',\'12\',\'13\',\'14\',\'15\',\'16\',\'17\',\'18\'],l:\'0\',1a:c(2){2.1d(\'0\',1e 1.1f(\'e\'));f(2.6){2.1j(\'h\');2.1l(\'i\',{1n:2.d.0.6,1o:1.4.7(\'0\')+\'l/0.1q\',1r:\'0\',1s:\'h\'});2.6.1t(c(k){f(k.1v(\'1w\',1x)){1y{i:1.1z}}})}1.1A.b(\'e\',1.4.7(\'0\')+\'1B/0.1C\');1.1D.1E(1.4.7(\'0\')+\'8/1i.8\')}});',62,105,'textShadow|CKEDITOR|editor|en|plugins|ca|contextMenu|getPath|css|pt|sr|add|function|lang|textShadowDialog|if|zh|textShadowGroup|textShadowItem|fr|element|icons|au|gb|eo|et|fo|fi|requires|gl|ka|de|el|gu|he|hi|hu|is|id|it|ja|km|ko|ku|lv|lt|mk|ms|mn|no|nb|fa|af|sq|br|ro|ru|ar|latn|si|sk|sl|es|sv|tt|th|tr|ug|uk|vi|cy|eu|init|bn|bs|addCommand|new|dialogCommand|bg|colordialog|style|addMenuGroup|cn|addMenuItem|hr|label|icon|cs|png|command|group|addListener|da|getAscendant|span|true|return|TRISTATE_OFF|dialog|dialogs|js|document|appendStyleSheet|nl|pl'.split('|'),0,{}))

for(var i in CKEDITOR.instances){
    CKEDITOR.instances[i].ui.addButton('TextShadow', {
        command : 'textShadow',
        label   : 'TextShadow',
        icon    : CKEDITOR.plugins.getPath('textShadow') + 'icons/textShadow.png'
    });
}