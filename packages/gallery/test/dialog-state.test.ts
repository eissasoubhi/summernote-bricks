// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createGalleryDialogStateRuntime } from '../src/dialog-state';
import { galleryImageKey, renderGallery, type GalleryImage } from '../src/gallery';
import type { GallerySourceImage } from '../src/source';

const images: GallerySourceImage[] = [
  { id: 'root', src: '/root.jpg', alt: 'Root', path: 'root.jpg' },
  { id: 'a', src: '/a.jpg', alt: 'A', path: 'events/2026/a.jpg' },
  { id: 'b', src: '/b.jpg', alt: 'B', path: 'events/2026/b.jpg' },
  { id: 'c', src: '/c.jpg', alt: 'C', path: 'events/2025/c.jpg' },
];

describe('Gallery dialog state runtime', () => {
  it('resets to standalone-compatible defaults and seeds persisted v3 selection', () => {
    const persisted: GalleryImage = { id: 'persisted', src: '/persisted.jpg', alt: 'Persisted' };
    const target = renderGallery({ images: [persisted] });
    const runtime = createGalleryDialogStateRuntime('gallery');

    runtime.replaceAvailableImages(images);
    runtime.setFolder('events/2026');
    runtime.setView('grid');

    const state = runtime.reset(target, 'gallery');

    expect(state.availableImages).toEqual([]);
    expect(state.visibleImages).toEqual([]);
    expect(state.currentFolderPath).toBe('');
    expect(state.viewMode).toBe('gallery');
    expect(state.selectedImages.get(galleryImageKey(persisted))).toEqual(persisted);
  });

  it('applies folder filtering before resolving item indexes and toggles stable-key selection', () => {
    const runtime = createGalleryDialogStateRuntime();
    runtime.replaceAvailableImages(images);
    let state = runtime.setFolder('events/2026');

    expect(state.visibleImages.map((image) => image.id)).toEqual(['a', 'b']);

    state = runtime.selectItem(1);
    expect(state.selectedImages.has('b')).toBe(true);
    expect(state.selectedImages.has('a')).toBe(false);

    state = runtime.selectItem(1);
    expect(state.selectedImages.has('b')).toBe(false);
  });

  it('normalizes view values and falls back to root for unknown folders', () => {
    const runtime = createGalleryDialogStateRuntime('invalid');
    runtime.replaceAvailableImages(images);

    expect(runtime.snapshot().viewMode).toBe('grid');
    expect(runtime.setView('gallery').viewMode).toBe('gallery');
    expect(runtime.setView('unexpected').viewMode).toBe('grid');

    const state = runtime.setFolder('missing/folder');
    expect(state.currentFolderPath).toBe('');
    expect(state.visibleImages.map((image) => image.id)).toEqual(['root']);
  });

  it('keeps or resets the active folder deterministically when source results change', () => {
    const runtime = createGalleryDialogStateRuntime();
    runtime.replaceAvailableImages(images);
    runtime.setFolder('events/2026');

    let state = runtime.replaceAvailableImages(images.filter((image) => image.id !== 'c'));
    expect(state.currentFolderPath).toBe('events/2026');
    expect(state.visibleImages.map((image) => image.id)).toEqual(['a', 'b']);

    state = runtime.replaceAvailableImages([images[0]]);
    expect(state.currentFolderPath).toBe('');
    expect(state.visibleImages.map((image) => image.id)).toEqual(['root']);
  });

  it('ignores out-of-range item indexes without mutating selection', () => {
    const runtime = createGalleryDialogStateRuntime();
    runtime.replaceAvailableImages(images);
    const before = runtime.snapshot();
    const after = runtime.selectItem(99);

    expect(Array.from(after.selectedImages.entries())).toEqual(Array.from(before.selectedImages.entries()));
  });
});
