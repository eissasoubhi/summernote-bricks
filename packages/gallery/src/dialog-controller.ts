import {
  createGalleryAsyncRuntime,
  type GalleryLoadResult,
  type GalleryUploadResult,
} from './async-runtime';
import {
  createGalleryDialogStateRuntime,
  type GalleryDialogStateSnapshot,
} from './dialog-state';
import type {
  GallerySourceAdapter,
  GalleryUploadAdapter,
} from './source';

export interface GalleryDialogController {
  snapshot(): GalleryDialogStateSnapshot;
  reset(target?: Element | null, defaultView?: unknown): GalleryDialogStateSnapshot;
  load(query?: string): Promise<GalleryLoadResult>;
  upload(files: readonly File[]): Promise<GalleryUploadResult>;
  selectItem(index: number): GalleryDialogStateSnapshot;
  setFolder(path: string): GalleryDialogStateSnapshot;
  setView(value: unknown): GalleryDialogStateSnapshot;
  abort(): void;
}

export function createGalleryDialogController(
  source: GallerySourceAdapter,
  uploadAdapter?: GalleryUploadAdapter | null,
  defaultView: unknown = 'grid',
): GalleryDialogController {
  const state = createGalleryDialogStateRuntime(defaultView);
  const asyncRuntime = createGalleryAsyncRuntime(source, uploadAdapter);

  return {
    snapshot: state.snapshot,
    reset(target?: Element | null, nextDefaultView: unknown = defaultView): GalleryDialogStateSnapshot {
      asyncRuntime.abort();
      return state.reset(target, nextDefaultView);
    },
    async load(query = ''): Promise<GalleryLoadResult> {
      const result = await asyncRuntime.load(query);
      if (result.status === 'loaded') state.replaceAvailableImages(result.items);
      return result;
    },
    async upload(files: readonly File[]): Promise<GalleryUploadResult> {
      const result = await asyncRuntime.upload(files);
      if (result.status === 'uploaded' && result.items.length > 0) {
        state.mergeUploadedImages(result.items);
      }
      return result;
    },
    selectItem: state.selectItem,
    setFolder: state.setFolder,
    setView: state.setView,
    abort: asyncRuntime.abort,
  };
}
