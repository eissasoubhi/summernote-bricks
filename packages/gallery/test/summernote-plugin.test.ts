import { describe, expect, it, vi } from 'vitest';

import type { GalleryJQueryElement, GalleryJQueryFactory } from '../src/jquery-adapter';
import { createSummernoteGalleryPlugin, galleryPluginName, type GallerySummernotePluginHost } from '../src/summernote-plugin';
import type { GallerySummernoteContext } from '../src/summernote-contract';

function elementStub(): GalleryJQueryElement {
  const element: GalleryJQueryElement = {
    appendTo: () => element,
    find: () => element,
    get: () => undefined,
    val: (value?: string) => value === undefined ? '' : element,
    text: () => element,
    html: () => element,
    empty: () => element,
    prop: () => element,
    attr: (_name: string, value?: string) => value === undefined ? undefined : element,
    trigger: () => element,
    on: () => element,
    off: () => element,
    each: () => element,
    remove: () => undefined,
  };
  return element;
}

describe('Gallery Summernote adapter', () => {
  it('registers the standalone-compatible button and delegates lifecycle methods', () => {
    const renderedButton = elementStub();
    let buttonOptions: { contents: string; tooltip: string; click: () => void } | null = null;
    let memoKey = '';
    let memoFactory: (() => GalleryJQueryElement) | null = null;

    const ui = {
      button: (options: { contents: string; tooltip: string; click: () => void }) => {
        buttonOptions = options;
        return { render: () => renderedButton };
      },
      dialog: () => ({ render: () => elementStub() }),
      showDialog: () => undefined,
      hideDialog: () => undefined,
      onDialogShown: () => undefined,
      onDialogHidden: () => undefined,
    };

    const jquery = Object.assign(
      () => elementStub(),
      { summernote: { ui } },
    ) as unknown as GalleryJQueryFactory;

    const context: GallerySummernoteContext<GalleryJQueryElement> = {
      options: {
        id: 'editor',
        summernoteGallery: {
          buttonLabel: 'Media',
          tooltip: 'Choose images',
        },
      },
      layoutInfo: {
        editable: elementStub(),
        editor: elementStub(),
      },
      memo: (key, factory) => {
        memoKey = key;
        memoFactory = factory;
      },
      invoke: vi.fn(),
    };

    const host = {} as GallerySummernotePluginHost;
    createSummernoteGalleryPlugin(jquery).call(host, context);

    expect(typeof host.initialize).toBe('function');
    expect(typeof host.destroy).toBe('function');
    expect(typeof host.show).toBe('function');
    expect(typeof host.save).toBe('function');
    expect(memoKey).toBe(`button.${galleryPluginName}`);
    expect(memoFactory?.()).toBe(renderedButton);
    expect(buttonOptions?.contents).toBe('Media');
    expect(buttonOptions?.tooltip).toBe('Choose images');

    const show = vi.fn();
    host.show = show;
    buttonOptions?.click();
    expect(show).toHaveBeenCalledTimes(1);
  });
});
