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
