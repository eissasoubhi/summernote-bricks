import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GalleryDialogController } from '../src/dialog-controller';
import type { GalleryDialogRuntimeBinding } from '../src/dialog-runtime-wiring';
import type {
  GalleryAdapterBoundary,
  GalleryJQueryElement,
} from '../src/jquery-adapter';
import { defaultGalleryOptions } from '../src/options';

const mocks = vi.hoisted(() => ({
  createDialog: vi.fn(),
  bindActivation: vi.fn(),
  disposeDialog: vi.fn(),
  createController: vi.fn(),
  bindRuntime: vi.fn(),
  persist: vi.fn(),
}));

vi.mock('../src/adapter-wiring', () => ({
  bindGalleryActivation: mocks.bindActivation,
  createGalleryDialog: mocks.createDialog,
  disposeGalleryDialog: mocks.disposeDialog,
  galleryEventNamespace: () => '.snbGalleryV3',
}));

vi.mock('../src/dialog-controller', () => ({
  createGalleryDialogController: mocks.createController,
}));

vi.mock('../src/dialog-runtime-wiring', () => ({
  bindGalleryDialogRuntime: mocks.bindRuntime,
}));

vi.mock('../src/runtime', () => ({
  persistGallerySelection: mocks.persist,
}));

import {
  createGalleryPluginLifecycle,
  galleryMissingSourceMessage,
} from '../src/plugin-lifecycle';

function jqueryElement(findings: Readonly<Record<string, GalleryJQueryElement>> = {}): GalleryJQueryElement {
  const element = {
    appendTo: vi.fn(() => element),
    find: vi.fn((selector: string) => findings[selector] ?? element),
    get: vi.fn(() => undefined),
    val: vi.fn((value?: string) => value === undefined ? '' : element),
    text: vi.fn(() => element),
    html: vi.fn(() => element),
    empty: vi.fn(() => element),
    prop: vi.fn(() => element),
    attr: vi.fn((name: string, value?: string) => value === undefined ? undefined : element),
    trigger: vi.fn(() => element),
    on: vi.fn(() => element),
    off: vi.fn(() => element),
    each: vi.fn(() => element),
    remove: vi.fn(),
  };

  return element as unknown as GalleryJQueryElement;
}

describe('Gallery plugin lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('composes initialize, show, save and destroy without leaking lifecycle work', () => {
    const saveButton = jqueryElement();
    const query = jqueryElement();
    const dialog = jqueryElement({
      '.snb-gallery-v3-form__save': saveButton,
      '.snb-gallery-v3-form__query': query,
    });
    const editable = jqueryElement();
    const editor = jqueryElement();
    const unbindActivation = vi.fn();
    const runtime: GalleryDialogRuntimeBinding = {
      render: vi.fn(),
      load: vi.fn(async () => undefined),
      dispose: vi.fn(),
    };
    const controller: GalleryDialogController = {
      snapshot: vi.fn(() => ({
        availableImages: [],
        visibleImages: [],
        selectedImages: new Map([['/image.jpg', { src: '/image.jpg', alt: 'Image' }]]),
        currentFolderPath: '',
        viewMode: 'grid',
      })),
      reset: vi.fn(() => ({
        availableImages: [],
        visibleImages: [],
        selectedImages: new Map(),
        currentFolderPath: '',
        viewMode: 'grid',
      })),
      load: vi.fn(async () => ({ status: 'loaded' as const, items: [] })),
      upload: vi.fn(async () => ({ status: 'uploaded' as const, items: [] })),
      selectItem: vi.fn(),
      setFolder: vi.fn(),
      setView: vi.fn(),
      abort: vi.fn(),
    };
    const ui = {
      button: vi.fn(),
      dialog: vi.fn(),
      showDialog: vi.fn(),
      hideDialog: vi.fn(),
      onDialogShown: vi.fn(),
      onDialogHidden: vi.fn(),
    };
    const boundary = {
      context: {
        options: {},
        layoutInfo: { editable, editor },
        memo: vi.fn(),
        invoke: vi.fn(),
      },
      jquery: vi.fn(),
      ui,
    } as unknown as GalleryAdapterBoundary;

    mocks.createDialog.mockReturnValue(dialog);
    mocks.createController.mockReturnValue(controller);
    mocks.bindRuntime.mockReturnValue(runtime);
    mocks.bindActivation.mockReturnValue(unbindActivation);

    const plugin = createGalleryPluginLifecycle(boundary, {
      ...defaultGalleryOptions,
      source: { list: vi.fn(async () => ({ items: [] })) },
    });

    plugin.initialize();
    plugin.initialize();
    expect(mocks.createDialog).toHaveBeenCalledTimes(1);
    expect(mocks.bindRuntime).toHaveBeenCalledTimes(1);
    expect(mocks.bindActivation).toHaveBeenCalledTimes(1);

    const target = document.createElement('div');
    plugin.show(target);
    expect(controller.reset).toHaveBeenCalledWith(target, 'grid');
    expect(runtime.render).toHaveBeenCalled();
    expect(ui.showDialog).toHaveBeenCalledWith(dialog);

    expect(plugin.save()).toBe(true);
    expect(mocks.persist).toHaveBeenCalledWith(
      boundary.context,
      controller.snapshot().selectedImages,
      target,
    );
    expect(ui.hideDialog).toHaveBeenCalledWith(dialog);

    plugin.destroy();
    expect(controller.abort).toHaveBeenCalled();
    expect(unbindActivation).toHaveBeenCalled();
    expect(runtime.dispose).toHaveBeenCalled();
    expect(mocks.disposeDialog).toHaveBeenCalledWith(boundary, dialog);
  });

  it('keeps the standalone missing-source error contract explicit', () => {
    expect(galleryMissingSourceMessage()).toBe(
      'Configure summernoteGallery.source with a GallerySourceAdapter.',
    );
  });
});
