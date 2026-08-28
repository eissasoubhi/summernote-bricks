import type { GalleryOptions } from './options';

export interface GalleryFieldContext {
  readonly options?: { readonly id?: unknown };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function galleryFieldId(context: GalleryFieldContext, suffix: string): string {
  const editorId = context.options?.id ? String(context.options.id) : 'editor';
  return `snb-gallery-${editorId}-${suffix}`;
}

export function renderGalleryDialogBody(context: GalleryFieldContext, options: GalleryOptions): string {
  const searchId = galleryFieldId(context, 'search');
  const uploadId = galleryFieldId(context, 'upload');
  const upload = options.upload ? [
    '<div class="snb-gallery-v3-form__upload">',
    `<label for="${uploadId}">${escapeHtml(options.uploadLabel)}</label>`,
    `<input id="${uploadId}" class="snb-gallery-v3-form__upload-input" type="file" accept="image/*" multiple>`,
    `<button type="button" class="note-btn snb-gallery-v3-form__upload-button">${escapeHtml(options.uploadText)}</button>`,
    '</div>',
  ].join('') : '';

  return [
    '<div class="snb-gallery-v3-form">',
    '<div class="snb-gallery-v3-form__search">',
    `<label for="${searchId}">${escapeHtml(options.searchLabel)}</label>`,
    `<input id="${searchId}" class="snb-gallery-v3-form__query" type="search" autocomplete="off">`,
    `<button type="button" class="note-btn snb-gallery-v3-form__search-button">${escapeHtml(options.searchText)}</button>`,
    '</div>',
    upload,
    `<nav class="snb-gallery-v3-form__folders" aria-label="${escapeHtml(options.folderLabel)}" hidden>`,
    '<span class="snb-gallery-v3-form__folder-current"></span>',
    '<div class="snb-gallery-v3-form__folder-actions"></div>',
    '</nav>',
    '<div class="snb-gallery-v3-form__views" role="group" aria-label="View mode">',
    `<button type="button" class="note-btn snb-gallery-v3-form__view" data-view="grid" aria-pressed="false">${escapeHtml(options.gridViewText)}</button>`,
    `<button type="button" class="note-btn snb-gallery-v3-form__view" data-view="gallery" aria-pressed="false">${escapeHtml(options.galleryViewText)}</button>`,
    '</div>',
    '<p class="snb-gallery-v3-form__status" role="status" aria-live="polite"></p>',
    '<p class="snb-gallery-v3-form__error" role="alert" aria-live="assertive"></p>',
    '<div class="snb-gallery-v3-form__results" role="listbox" aria-multiselectable="true"></div>',
    '</div>',
  ].join('');
}

export function renderGalleryDialogFooter(options: GalleryOptions): string {
  return `<button type="button" class="note-btn snb-gallery-v3-form__save">${escapeHtml(options.saveText)}</button>`;
}
