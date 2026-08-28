import type { GalleryJQueryFactory } from './jquery-adapter';
import { createSummernoteGalleryPlugin, galleryPluginName } from './summernote-plugin';

export * from './gallery';
export * from './source';
export * from './options';
export * from './summernote-plugin';

declare const $: GalleryJQueryFactory;

if (!$.summernote || !$.summernote.plugins) {
  throw new Error('summernote-gallery v3 requires Summernote to be loaded first.');
}

$.summernote.plugins[galleryPluginName] = createSummernoteGalleryPlugin($);
