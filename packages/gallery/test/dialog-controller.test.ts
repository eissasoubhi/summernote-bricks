// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createGalleryDialogController } from '../src/dialog-controller';
import { galleryImageKey, renderGallery, type GalleryImage } from '../src/gallery';
import type { GallerySourceAdapter, GalleryUploadAdapter } from '../src/source';

describe('Gallery dialog controller', () => {
  it('loads source results into dialog state while preserving folder/view behavior', async () => {
    const source: GallerySourceAdapter = {
      async list(request) {
        expect(request.query).toBe('event');
        return {
          items: [
            { id: 'root', src: '/root.jpg', path: 'root.jpg' },
            { id: 'a', src: '/a.jpg', path: 'events/a.jpg' },
          ],
        };
      },
    };
    const controller = createGalleryDialogController(source, null, 'gallery');

    controller.reset(null, 'gallery');
    const result = await controller.load('event');

    expect(result.status).toBe('loaded');
    expect(controller.snapshot().availableImages.map((image) => image.id)).toEqual(['root', 'a']);
    expect(controller.snapshot().viewMode).toBe('gallery');
    expect(controller.setFolder('events').visibleImages.map((image) => image.id)).toEqual(['a']);
  });

  it('merges uploaded images, selects them and returns to the root folder', async () => {
    const source: GallerySourceAdapter = {
      async list() {
        return {
          items: [
            { id: 'root', src: '/root.jpg', path: 'root.jpg' },
            { id: 'a', src: '/a.jpg', path: 'events/a.jpg' },
          ],
        };
      },
    };
    const upload: GalleryUploadAdapter = {
      async upload(files) {
        expect(files).toHaveLength(1);
        return [{ id: 'uploaded', src: '/uploaded.jpg', alt: 'Uploaded' }];
      },
    };
    const controller = createGalleryDialogController(source, upload);

    await controller.load();
    controller.setFolder('events');
    const result = await controller.upload([new File(['image'], 'uploaded.jpg', { type: 'image/jpeg' })]);
    const state = controller.snapshot();

    expect(result.status).toBe('uploaded');
    expect(state.currentFolderPath).toBe('');
    expect(state.availableImages.map((image) => image.id)).toEqual(['root', 'a', 'uploaded']);
    expect(state.selectedImages.has('uploaded')).toBe(true);
  });

  it('keeps persisted selection across source loading', async () => {
    const persisted: GalleryImage = { id: 'persisted', src: '/persisted.jpg', alt: 'Persisted' };
    const source: GallerySourceAdapter = {
      async list() {
        return { items: [{ id: 'source', src: '/source.jpg' }] };
      },
    };
    const controller = createGalleryDialogController(source);

    controller.reset(renderGallery({ images: [persisted] }));
    await controller.load();

    expect(controller.snapshot().selectedImages.get(galleryImageKey(persisted))).toEqual(persisted);
  });
});
