import {
  galleryImageKey,
  parseGallery,
  renderGallery,
  type GalleryImage,
} from './gallery';

export interface GalleryCommandContext {
  invoke(command: string, ...args: unknown[]): unknown;
}

export function seedGallerySelection(target?: Element | null): Map<string, GalleryImage> {
  const selected = new Map<string, GalleryImage>();
  if (!target) return selected;

  const existing = parseGallery(target);
  existing?.images.forEach((image) => selected.set(galleryImageKey(image), image));
  return selected;
}

export function persistGallerySelection(
  context: GalleryCommandContext,
  selected: ReadonlyMap<string, GalleryImage>,
  editingTarget?: HTMLElement | null,
): HTMLElement {
  if (selected.size === 0) {
    throw new TypeError('Select at least one image.');
  }

  const nextElement = renderGallery({ images: Array.from(selected.values()) });

  if (editingTarget) {
    context.invoke('editor.beforeCommand');
    try {
      editingTarget.replaceWith(nextElement);
    } finally {
      context.invoke('editor.afterCommand');
    }
  } else {
    context.invoke('editor.insertNode', nextElement);
  }

  return nextElement;
}
