import { galleryImageKey } from './gallery';
import type { GalleryDialogStateSnapshot } from './dialog-state';
import type { GalleryAdapterBoundary, GalleryJQueryElement } from './jquery-adapter';
import type { GalleryOptions } from './options';
import { renderGalleryResultItem } from './results';
import { buildGalleryFolderTree, findGalleryFolderNode } from './source';
import { applyGalleryViewMode } from './view';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderFolderActions(
  options: GalleryOptions,
  snapshot: GalleryDialogStateSnapshot,
): { readonly current: string; readonly markup: string; readonly hidden: boolean } {
  const tree = buildGalleryFolderTree([...snapshot.availableImages]);
  if (tree.children.length === 0) {
    return { current: '', markup: '', hidden: true };
  }

  const node = findGalleryFolderNode(tree, snapshot.currentFolderPath) ?? tree;
  const segments = node.path ? node.path.split('/') : [];
  const parentPath = segments.slice(0, -1).join('/');
  const actions = [
    `<button type="button" class="note-btn snb-gallery-v3-form__folder" data-folder-path=""${node.path ? '' : ' aria-current="location"'}>${escapeHtml(options.folderRootText)}</button>`,
  ];

  if (node.path) {
    actions.push(
      `<button type="button" class="note-btn snb-gallery-v3-form__folder" data-folder-path="${escapeHtml(parentPath)}">${escapeHtml(options.folderUpText)}</button>`,
    );
  }

  for (const child of node.children) {
    actions.push(
      `<button type="button" class="note-btn snb-gallery-v3-form__folder" data-folder-path="${escapeHtml(child.path)}">${escapeHtml(child.name)}</button>`,
    );
  }

  return {
    current: node.path || options.folderRootText,
    markup: actions.join(''),
    hidden: false,
  };
}

export function renderGalleryDialogSnapshot(
  boundary: GalleryAdapterBoundary,
  dialog: GalleryJQueryElement,
  options: GalleryOptions,
  snapshot: GalleryDialogStateSnapshot,
): void {
  const folder = renderFolderActions(options, snapshot);
  const folders = dialog.find('.snb-gallery-v3-form__folders');
  folders.prop('hidden', folder.hidden);
  folders.find('.snb-gallery-v3-form__folder-current').text(folder.current);
  folders.find('.snb-gallery-v3-form__folder-actions').html(folder.markup);

  const markup = snapshot.visibleImages
    .map((image, index) => renderGalleryResultItem(
      image,
      index,
      snapshot.selectedImages.has(galleryImageKey(image)),
    ))
    .join('');
  const results = dialog.find('.snb-gallery-v3-form__results');
  results.html(markup);

  const resultsElement = results.get(0);
  if (resultsElement instanceof HTMLElement) {
    applyGalleryViewMode(resultsElement, snapshot.viewMode);
  }

  dialog.find('.snb-gallery-v3-form__view').each((_index, element) => {
    const view = boundary.jquery(element).attr('data-view');
    boundary.jquery(element).attr('aria-pressed', view === snapshot.viewMode ? 'true' : 'false');
  });

  dialog.find('.snb-gallery-v3-form__status').text(
    snapshot.visibleImages.length > 0 ? '' : options.emptyText,
  );
}
