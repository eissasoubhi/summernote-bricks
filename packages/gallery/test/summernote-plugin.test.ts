import { describe, expect, it, vi } from 'vitest';

import type { GalleryJQueryElement, GalleryJQueryFactory } from '../src/jquery-adapter';
import { createSummernoteGalleryPlugin, galleryPluginName, type GallerySummernotePluginHost } from '../src/summernote-plugin';
import type { GallerySummernoteContext } from '../src/summernote-contract';

type ButtonOptions = { contents: string; tooltip: string; click: () => void };

function elementStub(): GalleryJQueryElement {
  const raw = {
    appendTo: () => elementStub(),
    find: () => elementStub(),
    get: () => undefined,
    val: () => '',
    text: () => elementStub(),
    html: () => elementStub(),
    empty: () => elementStub(),
    prop: () => elementStub(),
    attr: () => undefined,
    trigger: () => elementStub(),
    on: () => elementStub(),
    off: () => elementStub(),
    each: () => elementStub(),
    remove: () => undefined,
  };
  return raw as unknown as GalleryJQueryElement;
}

describe('Gallery Summernote adapter', () => {
  it('registers the standalone-compatible button and delegates lifecycle methods', () => {
    const renderedButton = elementStub();
    const captured: {
      buttonOptions: ButtonOptions | null;
      memoFactory: (() => GalleryJQueryElement) | null;
    } = {
      buttonOptions: null,
      memoFactory: null,
    };
    let memoKey = '';

    const ui = {
      button: (options: ButtonOptions) => {
        captured.buttonOptions = options;
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
        captured.memoFactory = factory;
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
    expect(captured.memoFactory?.()).toBe(renderedButton);
    expect(captured.buttonOptions?.contents).toBe('Media');
    expect(captured.buttonOptions?.tooltip).toBe('Choose images');

    const show = vi.fn();
    host.show = show;
    captured.buttonOptions?.click();
    expect(show).toHaveBeenCalledTimes(1);
  });
});
