import { galleryImageKey, type GalleryImage } from './gallery';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function galleryResultLabel(image: GalleryImage): string {
  return image.title || image.alt || image.caption || image.src;
}

export function renderGalleryResultItem(
  image: GalleryImage,
  index: number,
  selected: boolean,
): string {
  return [
    `<button type="button" class="snb-gallery-v3-form__item" data-index="${index}" role="option" aria-selected="${selected ? 'true' : 'false'}">`,
    `<img src="${escapeHtml(image.src)}" alt="">`,
    `<span>${escapeHtml(galleryResultLabel(image))}</span>`,
    '</button>',
  ].join('');
}

export function toggleGallerySelection(
  selected: Map<string, GalleryImage>,
  image: GalleryImage,
): boolean {
  const key = galleryImageKey(image);
  if (selected.has(key)) {
    selected.delete(key);
    return false;
  }

  selected.set(key, image);
  return true;
}
