import { createGalleryAdapterBoundary, type GalleryJQueryElement, type GalleryJQueryFactory } from './jquery-adapter';
import { resolveGalleryOptions, type GalleryOptions } from './options';
import { createGalleryPluginLifecycle, type GalleryPluginLifecycle } from './plugin-lifecycle';
import type { GallerySummernoteContext } from './summernote-contract';

export const galleryPluginName = 'summernoteGallery';

export interface GallerySummernotePluginHost extends GalleryPluginLifecycle {}

export type GallerySummernotePluginConstructor = (
  this: GallerySummernotePluginHost,
  context: GallerySummernoteContext<GalleryJQueryElement>,
) => void;

function configuredGalleryOptions(value: unknown): Partial<GalleryOptions> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Partial<GalleryOptions>;
}

/**
 * Build the public Summernote plugin constructor around the package-local typed
 * boundary and lifecycle. Feature behavior stays in the migrated Gallery
 * contracts; this adapter only performs Summernote registration glue.
 */
export function createSummernoteGalleryPlugin(
  jquery: GalleryJQueryFactory,
): GallerySummernotePluginConstructor {
  return function SummernoteGalleryV3(
    this: GallerySummernotePluginHost,
    context: GallerySummernoteContext<GalleryJQueryElement>,
  ): void {
    const options = resolveGalleryOptions(configuredGalleryOptions(context.options.summernoteGallery));
    const lifecycle = createGalleryPluginLifecycle(createGalleryAdapterBoundary(context, jquery), options);

    this.initialize = lifecycle.initialize;
    this.destroy = lifecycle.destroy;
    this.show = lifecycle.show;
    this.save = lifecycle.save;

    context.memo(`button.${galleryPluginName}`, () => jquery.summernote.ui.button({
      contents: options.buttonLabel,
      tooltip: options.tooltip,
      click: () => this.show(),
    }).render());
  };
}
