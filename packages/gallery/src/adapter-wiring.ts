import { renderGalleryDialogBody, renderGalleryDialogFooter } from './dialog';
import type { GalleryOptions } from './options';
import type {
  GalleryAdapterBoundary,
  GalleryJQueryElement,
} from './jquery-adapter';

const EVENT_NAMESPACE = '.snbGalleryV3';
const GALLERY_SELECTOR = '[data-snb-brick="gallery"]';

export interface GalleryDialogBinding {
  readonly dialog: GalleryJQueryElement;
  dispose(): void;
}

export interface GalleryDialogControlCallbacks {
  onItem(index: number): void;
  onFolder(path: string): void;
  onView(value: unknown): void;
  onSearch(query: string): void;
  onUpload(): void;
}

export function createGalleryDialog(
  boundary: GalleryAdapterBoundary,
  options: GalleryOptions,
): GalleryJQueryElement {
  const { context, jquery, ui } = boundary;
  const dialog = ui.dialog({
    title: options.dialogTitle,
    body: renderGalleryDialogBody(context, options),
    footer: renderGalleryDialogFooter(options),
  }).render();
  const container = context.options.dialogsInBody
    ? jquery(document.body)
    : context.layoutInfo.editor;

  return dialog.appendTo(container);
}

export function bindGalleryActivation(
  boundary: GalleryAdapterBoundary,
  callback: (target: HTMLElement) => void,
): () => void {
  const editable = boundary.context.layoutInfo.editable;
  const eventName = `dblclick${EVENT_NAMESPACE}`;

  editable.on(eventName, GALLERY_SELECTOR, (event) => {
    if (event.currentTarget instanceof HTMLElement) {
      callback(event.currentTarget);
    }
  });

  return () => editable.off(EVENT_NAMESPACE);
}

export function bindGalleryDialogControls(
  boundary: GalleryAdapterBoundary,
  dialog: GalleryJQueryElement,
  callbacks: GalleryDialogControlCallbacks,
): () => void {
  const { jquery } = boundary;

  dialog.on(`click${EVENT_NAMESPACE}`, '.snb-gallery-v3-form__item', (event) => {
    callbacks.onItem(Number(jquery(event.currentTarget as object).attr('data-index')));
  });

  dialog.on(`click${EVENT_NAMESPACE}`, '.snb-gallery-v3-form__folder', (event) => {
    callbacks.onFolder(String(jquery(event.currentTarget as object).attr('data-folder-path') || ''));
  });

  dialog.on(`click${EVENT_NAMESPACE}`, '.snb-gallery-v3-form__view', (event) => {
    callbacks.onView(jquery(event.currentTarget as object).attr('data-view'));
  });

  dialog.on(`click${EVENT_NAMESPACE}`, '.snb-gallery-v3-form__search-button', () => {
    callbacks.onSearch(String(dialog.find('.snb-gallery-v3-form__query').val() || ''));
  });

  dialog.on(`click${EVENT_NAMESPACE}`, '.snb-gallery-v3-form__upload-button', () => {
    callbacks.onUpload();
  });

  dialog.on(`keydown${EVENT_NAMESPACE}`, '.snb-gallery-v3-form__query', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    callbacks.onSearch(String(jquery(event.currentTarget as object).val() || ''));
  });

  return () => dialog.off(EVENT_NAMESPACE);
}

export function disposeGalleryDialog(
  boundary: GalleryAdapterBoundary,
  dialog: GalleryJQueryElement,
): void {
  dialog.off(EVENT_NAMESPACE);
  boundary.ui.hideDialog(dialog);
  dialog.remove();
}

export function galleryEventNamespace(): string {
  return EVENT_NAMESPACE;
}
