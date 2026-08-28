import { describe, expect, it, vi } from 'vitest';
import { createGalleryAsyncRuntime } from '../src/async-runtime';
import type { GallerySourceAdapter, GalleryUploadAdapter } from '../src/source';

function image(src: string, title?: string) {
  return title ? { src, alt: '', title } : { src, alt: '' };
}

describe('createGalleryAsyncRuntime', () => {
  it('loads source items and exposes a defensive snapshot', async () => {
    const source: GallerySourceAdapter = {
      list: vi.fn(async ({ query }) => ({ items: [image(`/images/${query || 'all'}.jpg`)] })),
    };
    const runtime = createGalleryAsyncRuntime(source);

    await expect(runtime.load('cats')).resolves.toEqual({
      status: 'loaded',
      items: [image('/images/cats.jpg')],
    });

    const first = runtime.snapshot();
    expect(first.availableImages).toEqual([image('/images/cats.jpg')]);
    expect(first.selectedImages.size).toBe(0);
  });

  it('aborts the previous source request when a new load starts', async () => {
    let releaseFirst: (() => void) | undefined;
    const firstPending = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    let calls = 0;
    const source: GallerySourceAdapter = {
      async list({ signal }) {
        calls += 1;
        if (calls === 1) {
          await firstPending;
          expect(signal?.aborted).toBe(true);
          return { items: [image('/stale.jpg')] };
        }
        return { items: [image('/fresh.jpg')] };
      },
    };
    const runtime = createGalleryAsyncRuntime(source);

    const stale = runtime.load('stale');
    const fresh = runtime.load('fresh');
    releaseFirst?.();

    await expect(fresh).resolves.toEqual({ status: 'loaded', items: [image('/fresh.jpg')] });
    await expect(stale).resolves.toEqual({ status: 'aborted', items: [] });
    expect(runtime.snapshot().availableImages).toEqual([image('/fresh.jpg')]);
  });

  it('merges normalized uploaded images and selects them by stable key', async () => {
    const source: GallerySourceAdapter = {
      async list() {
        return { items: [image('/existing.jpg', 'Existing')] };
      },
    };
    const upload: GalleryUploadAdapter = {
      async upload() {
        return [
          image(' /existing.jpg ', 'Updated'),
          image('/new.jpg', 'New'),
        ];
      },
    };
    const runtime = createGalleryAsyncRuntime(source, upload);
    await runtime.load();

    const result = await runtime.upload([new File(['x'], 'x.png', { type: 'image/png' })]);
    expect(result.status).toBe('uploaded');
    expect(result.items).toEqual([
      image('/existing.jpg', 'Updated'),
      image('/new.jpg', 'New'),
    ]);

    const snapshot = runtime.snapshot();
    expect(snapshot.availableImages).toEqual([
      image('/existing.jpg', 'Updated'),
      image('/new.jpg', 'New'),
    ]);
    expect(Array.from(snapshot.selectedImages.values())).toEqual([
      image('/existing.jpg', 'Updated'),
      image('/new.jpg', 'New'),
    ]);
  });

  it('aborts active source and upload work without surfacing stale errors', async () => {
    const source: GallerySourceAdapter = {
      async list({ signal }) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (signal?.aborted) throw new Error('stale load failure');
        return { items: [] };
      },
    };
    const upload: GalleryUploadAdapter = {
      async upload(_files, signal) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (signal?.aborted) throw new Error('stale upload failure');
        return [];
      },
    };
    const runtime = createGalleryAsyncRuntime(source, upload);

    const load = runtime.load();
    const uploadPromise = runtime.upload([new File(['x'], 'x.png')]);
    runtime.abort();

    await expect(load).resolves.toEqual({ status: 'aborted', items: [] });
    await expect(uploadPromise).resolves.toEqual({ status: 'aborted', items: [] });
  });

  it('rethrows non-abort source failures for the UI layer to present', async () => {
    const source: GallerySourceAdapter = {
      async list() {
        throw new Error('source unavailable');
      },
    };
    const runtime = createGalleryAsyncRuntime(source);

    await expect(runtime.load()).rejects.toThrow('source unavailable');
  });
});
