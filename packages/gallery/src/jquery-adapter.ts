import type { GallerySummernoteContext, GallerySummernoteUi } from './summernote-contract';

export interface GalleryJQueryEvent {
  readonly currentTarget: EventTarget | null;
  readonly key?: string;
  preventDefault(): void;
}

export interface GalleryJQueryElement {
  appendTo(target: GalleryJQueryElement): GalleryJQueryElement;
  find(selector: string): GalleryJQueryElement;
  get(index: number): unknown;
  val(): unknown;
  val(value: string): GalleryJQueryElement;
  text(value: string): GalleryJQueryElement;
  html(value: string): GalleryJQueryElement;
  empty(): GalleryJQueryElement;
  prop(name: string, value: unknown): GalleryJQueryElement;
  attr(name: string): string | undefined;
  attr(name: string, value: string): GalleryJQueryElement;
  trigger(eventName: string): GalleryJQueryElement;
  on(eventName: string, handler: (event: GalleryJQueryEvent) => void): GalleryJQueryElement;
  on(eventName: string, selector: string, handler: (event: GalleryJQueryEvent) => void): GalleryJQueryElement;
  off(eventName: string): GalleryJQueryElement;
  each(callback: (index: number, element: Element) => void): GalleryJQueryElement;
  remove(): void;
}

export interface GalleryJQueryFactory {
  (target: object): GalleryJQueryElement;
  readonly summernote: {
    readonly ui: GallerySummernoteUi<GalleryJQueryElement>;
    readonly plugins: Record<string, unknown>;
  };
}

export interface GalleryPluginInstance {
  initialize(): void;
  destroy(): void;
  show(target?: HTMLElement): void;
}

export interface GalleryAdapterBoundary {
  readonly context: GallerySummernoteContext<GalleryJQueryElement>;
  readonly jquery: GalleryJQueryFactory;
  readonly ui: GallerySummernoteUi<GalleryJQueryElement>;
}

export function createGalleryAdapterBoundary(
  context: GallerySummernoteContext<GalleryJQueryElement>,
  jquery: GalleryJQueryFactory,
): GalleryAdapterBoundary {
  return {
    context,
    jquery,
    ui: jquery.summernote.ui,
  };
}
