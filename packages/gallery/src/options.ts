import type { GallerySourceAdapter, GalleryUploadAdapter } from './source';
import type { GalleryViewMode } from './view';

export interface GalleryOptions {
  buttonLabel: string;
  tooltip: string;
  dialogTitle: string;
  saveText: string;
  searchLabel: string;
  searchText: string;
  gridViewText: string;
  galleryViewText: string;
  defaultView: GalleryViewMode;
  loadingText: string;
  emptyText: string;
  errorText: string;
  uploadLabel: string;
  uploadText: string;
  uploadingText: string;
  uploadErrorText: string;
  folderLabel: string;
  folderRootText: string;
  folderUpText: string;
  source: GallerySourceAdapter | null;
  upload: GalleryUploadAdapter | null;
}

export const defaultGalleryOptions: GalleryOptions = {
  buttonLabel: 'Gallery',
  tooltip: 'Insert gallery',
  dialogTitle: 'Image gallery',
  saveText: 'Insert',
  searchLabel: 'Search images',
  searchText: 'Search',
  gridViewText: 'Grid',
  galleryViewText: 'Gallery',
  defaultView: 'grid',
  loadingText: 'Loading images…',
  emptyText: 'No images found.',
  errorText: 'Unable to load images.',
  uploadLabel: 'Upload images',
  uploadText: 'Upload',
  uploadingText: 'Uploading images…',
  uploadErrorText: 'Unable to upload images.',
  folderLabel: 'Folders',
  folderRootText: 'All images',
  folderUpText: 'Up',
  source: null,
  upload: null,
};

export function resolveGalleryOptions(configured: Partial<GalleryOptions> | null | undefined): GalleryOptions {
  return { ...defaultGalleryOptions, ...(configured ?? {}) };
}
