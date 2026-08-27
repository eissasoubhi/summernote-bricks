export type GalleryViewMode = 'grid' | 'gallery';

export function normalizeGalleryViewMode(value: unknown): GalleryViewMode {
  return value === 'gallery' ? 'gallery' : 'grid';
}

export function applyGalleryViewMode(results: HTMLElement, mode: GalleryViewMode): void {
  results.dataset.view = mode;

  if (mode === 'grid') {
    results.style.display = 'grid';
    results.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    results.style.gap = '0.5rem';
  } else {
    results.style.display = 'flex';
    results.style.flexDirection = 'column';
    results.style.gap = '0.5rem';
    results.style.removeProperty('grid-template-columns');
  }
}
