import { galleryImageKey, type GalleryImage } from './gallery';
import { seedGallerySelection } from './runtime';
import {
  buildGalleryFolderTree,
  filterGalleryImagesByFolder,
  findGalleryFolderNode,
  type GallerySourceImage,
} from './source';
import { toggleGallerySelection } from './results';
import { normalizeGalleryViewMode, type GalleryViewMode } from './view';

export interface GalleryDialogStateSnapshot {
  readonly availableImages: readonly GallerySourceImage[];
  readonly visibleImages: readonly GallerySourceImage[];
  readonly selectedImages: ReadonlyMap<string, GalleryImage>;
  readonly currentFolderPath: string;
  readonly viewMode: GalleryViewMode;
}

export interface GalleryDialogStateRuntime {
  snapshot(): GalleryDialogStateSnapshot;
  reset(target?: Element | null, defaultView?: unknown): GalleryDialogStateSnapshot;
  replaceAvailableImages(images: readonly GallerySourceImage[]): GalleryDialogStateSnapshot;
  mergeUploadedImages(images: readonly GallerySourceImage[]): GalleryDialogStateSnapshot;
  selectItem(index: number): GalleryDialogStateSnapshot;
  setFolder(path: string): GalleryDialogStateSnapshot;
  setView(value: unknown): GalleryDialogStateSnapshot;
}

export function createGalleryDialogStateRuntime(
  defaultView: unknown = 'grid',
): GalleryDialogStateRuntime {
  let availableImages: GallerySourceImage[] = [];
  let selectedImages = new Map<string, GalleryImage>();
  let currentFolderPath = '';
  let viewMode = normalizeGalleryViewMode(defaultView);

  const visibleImages = (): GallerySourceImage[] => {
    return filterGalleryImagesByFolder(availableImages, currentFolderPath);
  };

  const snapshot = (): GalleryDialogStateSnapshot => ({
    availableImages: [...availableImages],
    visibleImages: visibleImages(),
    selectedImages: new Map(selectedImages),
    currentFolderPath,
    viewMode,
  });

  const ensureValidFolder = (): void => {
    const tree = buildGalleryFolderTree(availableImages);
    if (!findGalleryFolderNode(tree, currentFolderPath)) currentFolderPath = '';
  };

  return {
    snapshot,
    reset(target?: Element | null, nextDefaultView: unknown = defaultView): GalleryDialogStateSnapshot {
      availableImages = [];
      selectedImages = seedGallerySelection(target);
      currentFolderPath = '';
      viewMode = normalizeGalleryViewMode(nextDefaultView);
      return snapshot();
    },
    replaceAvailableImages(images: readonly GallerySourceImage[]): GalleryDialogStateSnapshot {
      availableImages = [...images];
      ensureValidFolder();
      return snapshot();
    },
    mergeUploadedImages(images: readonly GallerySourceImage[]): GalleryDialogStateSnapshot {
      const byKey = new Map(availableImages.map((image) => [galleryImageKey(image), image]));
      for (const image of images) {
        const key = galleryImageKey(image);
        byKey.set(key, image);
        selectedImages.set(key, image);
      }
      availableImages = Array.from(byKey.values());
      currentFolderPath = '';
      return snapshot();
    },
    selectItem(index: number): GalleryDialogStateSnapshot {
      const image = visibleImages()[index];
      if (image) toggleGallerySelection(selectedImages, image);
      return snapshot();
    },
    setFolder(path: string): GalleryDialogStateSnapshot {
      const tree = buildGalleryFolderTree(availableImages);
      const node = findGalleryFolderNode(tree, path);
      currentFolderPath = node?.path || '';
      return snapshot();
    },
    setView(value: unknown): GalleryDialogStateSnapshot {
      viewMode = normalizeGalleryViewMode(value);
      return snapshot();
    },
  };
}
