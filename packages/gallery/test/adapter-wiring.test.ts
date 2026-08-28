// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  bindGalleryActivation,
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
  readonly onCalls: Array<{ eventName: string; selector?: string }>;
  readonly offCalls: string[];
  readonly appendTargets: GalleryJQueryElement[];
  readonly handlers: Array<(event: GalleryJQueryEvent) => void>;
  removed: boolean;
}

function elementStub(): StubElement {
  const element = {} as StubElement;
  element.onCalls = [];
  element.offCalls = [];
  element.appendTargets = [];
  element.handlers = [];
  element.removed = false;
  element.appendTo = (target) => { element.appendTargets.push(target); return element; };
  element.find = () => element;
  element.get = () => undefined;
  element.val = ((value?: string) => value === undefined ? '' : element) as GalleryJQueryElement['val'];
  element.text = () => element;
  element.html = () => element;
  element.empty = () => element;
  element.prop = () => element;
  element.attr = ((name: string, value?: string) => value === undefined ? undefined : element) as GalleryJQueryElement['attr'];
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
    (target: object) => target === document.body ? body : editor,
    { summernote: { ui } },
  ) as GalleryJQueryFactory;
  const context: GallerySummernoteContext<GalleryJQueryElement> = {
    options: dialogsInBody ? { dialogsInBody: true } : {},
    layoutInfo: { editable, editor },
    memo: () => undefined,
    invoke: () => undefined,
  };
  const adapterBoundary: GalleryAdapterBoundary = { context, jquery, ui };
  return { boundary: adapterBoundary, editor, editable, dialog, body, hideDialog };
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

  it('removes dialog handlers, hides the dialog and removes it from the DOM boundary', () => {
    const fixture = boundary();
    disposeGalleryDialog(fixture.boundary, fixture.dialog);

    expect(fixture.dialog.offCalls).toEqual([galleryEventNamespace()]);
    expect(fixture.hideDialog).toHaveBeenCalledWith(fixture.dialog);
    expect(fixture.dialog.removed).toBe(true);
  });
});
