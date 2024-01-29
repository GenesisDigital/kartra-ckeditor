import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { InlineEditor as InlineEditorBase } from '@ckeditor/ckeditor5-editor-inline';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { CKFinderUploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic, Underline, Strikethrough, Superscript, Subscript } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { FontFamily, FontBackgroundColor, FontSize, FontColor } from '@ckeditor/ckeditor5-font';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

class ClassicEditor extends ClassicEditorBase {}

class InlineEditor extends InlineEditorBase {}

const defaultConfig = {
	toolbar: { 
		items: [
			'undo', 'redo', 'bold', 'italic', 'underline', 'subscript', 'superscript', 'link',
			'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', 'bulletedList', 'numberedList',
			'-',
			'strikethrough', 'findAndReplace', 'mediaEmbed', 'insertTable', 'heading', 'pageBreak', 'horizontalLine'
		],
		shouldNotGroupWhenFull: true
	},
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [ 
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	fontFamily: {
		supportAllValues: true
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
}

const builtinPlugins = [
	Essentials,
	CKFinderUploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKFinder,
	CloudServices,
	EasyImage,
	FindAndReplace,
	FontSize,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	GeneralHtmlSupport,
	Heading,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	PageBreak,
	Paragraph,
	PasteFromOffice,
	PictureEditing,
	Strikethrough,
	Superscript,
	Subscript,
	Table,
	TableToolbar,
	TextTransformation,
	Underline,
]

ClassicEditor.defaultConfig = defaultConfig;
InlineEditor.defaultConfig = defaultConfig;

ClassicEditor.builtinPlugins = builtinPlugins;
InlineEditor.builtinPlugins = builtinPlugins;

export default {
    ClassicEditor, InlineEditor
};