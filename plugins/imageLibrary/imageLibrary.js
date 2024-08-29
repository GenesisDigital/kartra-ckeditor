import { ButtonView } from 'ckeditor5/src/ui';
import ImageLibraryIcon from './icons/imagelibrary.svg';

export function ImageLibrary(editor) {
    editor.ui.componentFactory.add('imageLibrary', (locale) => {
        const button = new ButtonView(locale);
    
        button.set({
            label: 'ImageLibrary',
            withText: false,
            icon: ImageLibraryIcon
        });
    
        button.on('execute', () => {
            var event = new CustomEvent('ck:open-image-library', {
                detail: {
                    editor,
                },
            });
            document.dispatchEvent(event);
        });
    
        return button;
    });
}