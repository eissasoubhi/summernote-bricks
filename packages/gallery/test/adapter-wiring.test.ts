// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  bindGalleryActivation,
  bindGalleryDialogControls,
  createGalleryDialog,
  disposeGalleryDialog,
  galleryEventNamespace,
} from '../src/adapter-wiring';
import type {
  GalleryAdapterBoundary,
  GalleryJQueryElement,
  GalleryJQueryEvent,
  GalleryJQueryFactory,
} from '../src/jquery-adapter';
import { defaultGalleryOptions } from '../src/options';
import type { GallerySummernoteContext, GallerySummernoteUi } from '../src/summernote-contract';

interface StubElement extends GalleryJQueryElement {
  onCalls: Array<{ eventName: string; selector?: string }>;
  offCalls: string[];
  appendTargets: GalleryJQueryElement[];
  handlers: Array<(event: GalleryJQueryEvent) => void>;
  removed: boolean;
  attributes: Map<string, string>;
  value: unknown;
}

function elementStub(): StubElement {
  const element = {} as StubElement;
  element.onCalls = [];
  element.offCalls = [];
  element.appendTargets = [];
  element.handlers = [];
  element.removed = false;
  element.attributes = new Map();
  element.value = '';
  element.appendTo = (target) => { element.appendTargets.push(target); return element; };
  element.find = () => element;
  element.get = () => undefined;
  element.val = ((value?: string) => {
    if (value === undefined) return element.value;
    element.value = value;
    return element;
  }) as GalleryJQueryElement['val'];
  element.text = () => element;
  element.html = () => element;
  element.empty = () => element;
  element.prop = () => element;
  element.attr = ((name: string, value?: string) => {
    if (value === undefined) return element.attributes.get(name);
    element.attributes.set(name, value);
    return element;
  }) as GalleryJQueryElement['attr'];
  element.trigger = () => element;
  element.on = ((eventName: string, selectorOrHandler: string | ((event: GalleryJQueryEvent) => void), maybeHandler?: (event: GalleryJQueryEvent) => void) => {
    if (typeof selectorOrHandler === 'string') {
      element.onCalls.push({ eventName, selector: selectorOrHandler });
      if (maybeHandler) element.handlers.push(maybeHandler);
    } else {
      element.onCalls.push({ eventName });
      element.handlers.push(selectorOrHandler);
    }
    return element;
  }) as GalleryJQueryElement['on'];
  element.off = (eventName) => { element.offCalls.push(eventName); return element; };
  element.each = () => element;
  element.remove = () => { element.removed = true; };
  return element;
}

function boundary(dialogsInBody = false) {
  const editor = elementStub();
  const editable = elementStub();
  const dialog = elementStub();
  const body = elementStub();
  const targets = new Map<object, StubElement>();
  const hideDialog = vi.fn();
  const ui: GallerySummernoteUi<GalleryJQueryElement> = {
    button: () => ({ render: () => editor }),
    dialog: () => ({ render: () => dialog }),
    showDialog: () => undefined,
    hideDialog,
    onDialogShown: (_dialog, callback) => callback(),
    onDialogHidden: (_dialog, callback) => callback(),
  };
  const jquery = Object.assign(
    (target: object) => {
      if (target === document.body) return body;
      return targets.get(target) || editor;
    },
    { summernote: { ui } },
  ) as GalleryJQueryFactory;
  const context: GallerySummernoteContext<GalleryJQueryElement> = {
    options: dialogsInBody ? { dialogsInBody: true } : {},
    layoutInfo: { editable, editor },
    memo: () => undefined,
    invoke: () => undefined,
  };
  const adapterBoundary: GalleryAdapterBoundary = { context, jquery, ui };
  return { boundary: adapterBoundary, editor, editable, dialog, body, hideDialog, targets };
}

describe('Gallery adapter wiring', () => {
  it('mounts the dialog in the editor by default and in body when configured', () => {
    const local = boundary(false);
    createGalleryDialog(local.boundary, defaultGalleryOptions);
    expect(local.dialog.appendTargets).toEqual([local.editor]);

    const bodyMounted = boundary(true);
    createGalleryDialog(bodyMounted.boundary, defaultGalleryOptions);
    expect(bodyMounted.dialog.appendTargets).toEqual([bodyMounted.body]);
  });

  it('binds delegated gallery activation and disposes the namespace', () => {
    const fixture = boundary();
    const callback = vi.fn();
    const dispose = bindGalleryActivation(fixture.boundary, callback);
    const target = document.createElement('div');

    expect(fixture.editable.onCalls).toEqual([
      { eventName: 'dblclick.snbGalleryV3', selector: '[data-snb-brick="gallery"]' },
    ]);
    fixture.editable.handlers[0]?.({ currentTarget: target, preventDefault() {} });
    expect(callback).toHaveBeenCalledWith(target);

    dispose();
    expect(fixture.editable.offCalls).toEqual([galleryEventNamespace()]);
  });

  it('reproduces standalone dialog item/folder/view/search/upload controls', () => {
    const fixture = boundary();
    const item = elementStub();
    const folder = elementStub();
    const view = elementStub();
    const query = elementStub();
    const itemTarget = {};
    const folderTarget = {};
    const viewTarget = {};
    const queryTarget = {};
    item.attr('data-index', '3');
    folder.attr('data-folder-path', '2026/events');
    view.attr('data-view', 'gallery');
    query.value = 'summer';
    fixture.targets.set(itemTarget, item);
    fixture.targets.set(folderTarget, folder);
    fixture.targets.set(viewTarget, view);
    fixture.targets.set(queryTarget, query);
    fixture.dialog.value = 'landscape';

    const callbacks = {
      onItem: vi.fn(),
      onFolder: vi.fn(),
      onView: vi.fn(),
      onSearch: vi.fn(),
      onUpload: vi.fn(),
    };
    const dispose = bindGalleryDialogControls(fixture.boundary, fixture.dialog, callbacks);

    expect(fixture.dialog.onCalls).toEqual([
      { eventName: 'click.snbGalleryV3', selector: '.snb-gallery-v3-form__item' },
      { eventName: 'click.snbGalleryV3', selector: '.snb-gallery-v3-form__folder' },
      { eventName: 'click.snbGalleryV3', selector: '.snb-gallery-v3-form__view' },
      { eventName: 'click.snbGalleryV3', selector: '.snb-gallery-v3-form__search-button' },
      { eventName: 'click.snbGalleryV3', selector: '.snb-gallery-v3-form__upload-button' },
      { eventName: 'keydown.snbGalleryV3', selector: '.snb-gallery-v3-form__query' },
    ]);

    fixture.dialog.handlers[0]?.({ currentTarget: itemTarget as EventTarget, preventDefault() {} });
    fixture.dialog.handlers[1]?.({ currentTarget: folderTarget as EventTarget, preventDefault() {} });
    fixture.dialog.handlers[2]?.({ currentTarget: viewTarget as EventTarget, preventDefault() {} });
    fixture.dialog.handlers[3]?.({ currentTarget: null, preventDefault() {} });
    fixture.dialog.handlers[4]?.({ currentTarget: null, preventDefault() {} });
    const preventDefault = vi.fn();
    fixture.dialog.handlers[5]?.({ currentTarget: queryTarget as EventTarget, key: 'Enter', preventDefault });

    expect(callbacks.onItem).toHaveBeenCalledWith(3);
    expect(callbacks.onFolder).toHaveBeenCalledWith('2026/events');
    expect(callbacks.onView).toHaveBeenCalledWith('gallery');
    expect(callbacks.onSearch).toHaveBeenNthCalledWith(1, 'landscape');
    expect(callbacks.onSearch).toHaveBeenNthCalledWith(2, 'summer');
    expect(callbacks.onUpload).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);

    dispose();
    expect(fixture.dialog.offCalls).toContain(galleryEventNamespace());
  });

  it('ignores non-Enter query keydown without triggering search', () => {
    const fixture = boundary();
    const query = elementStub();
    const queryTarget = {};
    query.value = 'ignored';
    fixture.targets.set(queryTarget, query);
    const onSearch = vi.fn();
    bindGalleryDialogControls(fixture.boundary, fixture.dialog, {
      onItem() {},
      onFolder() {},
      onView() {},
      onSearch,
      onUpload() {},
    });

    fixture.dialog.handlers[5]?.({ currentTarget: queryTarget as EventTarget, key: 'Escape', preventDefault: vi.fn() });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('removes dialog handlers, hides the dialog and removes it from the DOM boundary', () => {
    const fixture = boundary();
    disposeGalleryDialog(fixture.boundary, fixture.dialog);

    expect(fixture.dialog.offCalls).toEqual([galleryEventNamespace()]);
    expect(fixture.hideDialog).toHaveBeenCalledWith(fixture.dialog);
    expect(fixture.dialog.removed).toBe(true);
  });
});
