import {
  galleryImageKey,
  normalizeGalleryImage,
  type GalleryImage,
} from './gallery';
import type {
  GallerySourceAdapter,
  GallerySourceImage,
  GalleryUploadAdapter,
} from './source';

export interface GalleryAsyncSnapshot {
  readonly availableImages: readonly GallerySourceImage[];
  readonly selectedImages: ReadonlyMap<string, GalleryImage>;
}

export interface GalleryLoadResult {
  readonly status: 'loaded' | 'aborted';
  readonly items: readonly GallerySourceImage[];
}

export interface GalleryUploadResult {
  readonly status: 'uploaded' | 'aborted';
  readonly items: readonly GallerySourceImage[];
}

export interface GalleryAsyncRuntime {
  snapshot(): GalleryAsyncSnapshot;
  load(query?: string): Promise<GalleryLoadResult>;
  upload(files: readonly File[]): Promise<GalleryUploadResult>;
  abort(): void;
}

export function createGalleryAsyncRuntime(
  source: GallerySourceAdapter,
  uploadAdapter?: GalleryUploadAdapter | null,
): GalleryAsyncRuntime {
  let availableImages: GallerySourceImage[] = [];
  let selectedImages = new Map<string, GalleryImage>();
  let activeRequest: AbortController | null = null;
  let activeUpload: AbortController | null = null;

  const snapshot = (): GalleryAsyncSnapshot => ({
    availableImages: [...availableImages],
    selectedImages: new Map(selectedImages),
  });

  const load = async (query = ''): Promise<GalleryLoadResult> => {
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;

    try {
      const page = await source.list({ query, signal: controller.signal });
      if (controller.signal.aborted) {
        return { status: 'aborted', items: [] };
      }

      availableImages = Array.isArray(page.items) ? [...page.items] : [];
      return { status: 'loaded', items: [...availableImages] };
    } catch (error) {
      if (controller.signal.aborted) {
        return { status: 'aborted', items: [] };
      }
      throw error;
    } finally {
      if (activeRequest === controller) activeRequest = null;
    }
  };

  const upload = async (files: readonly File[]): Promise<GalleryUploadResult> => {
    if (!uploadAdapter || typeof uploadAdapter.upload !== 'function' || files.length === 0) {
      return { status: 'uploaded', items: [] };
    }

    activeUpload?.abort();
    const controller = new AbortController();
    activeUpload = controller;

    try {
      const uploaded = await uploadAdapter.upload([...files], controller.signal);
      if (controller.signal.aborted) {
        return { status: 'aborted', items: [] };
      }

      const normalized = (Array.isArray(uploaded) ? uploaded : []).map(
        (image) => normalizeGalleryImage(image) as GallerySourceImage,
      );
      const byKey = new Map(availableImages.map((image) => [galleryImageKey(image), image]));

      for (const image of normalized) {
        const key = galleryImageKey(image);
        byKey.set(key, image);
        selectedImages.set(key, image);
      }

      availableImages = Array.from(byKey.values());
      return { status: 'uploaded', items: [...normalized] };
    } catch (error) {
      if (controller.signal.aborted) {
        return { status: 'aborted', items: [] };
      }
      throw error;
    } finally {
      if (activeUpload === controller) activeUpload = null;
    }
  };

  return {
    snapshot,
    load,
    upload,
    abort(): void {
      activeRequest?.abort();
      activeRequest = null;
      activeUpload?.abort();
      activeUpload = null;
    },
  };
}
