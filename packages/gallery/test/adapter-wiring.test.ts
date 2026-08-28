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
  GalleryJQueryFactory,
} from '../src/jquery-adapter';
import { defaultGalleryOptions } from '../src/options';
import type { GallerySummernoteContext, GallerySummernoteUi } from '../src/summernote-contract';

interface StubElement extends GalleryJQueryElement {
  readonly onCalls: Array<[string, string | undefined]>;
  readonly offCalls: string[];
  readonly appendTargets: GalleryJQueryElement[];
  readonly handlers: Array<(event: { currentTarget: EventTarget | null; preventDefault(): void }) => void>;
  removed: boolean;
}

function elementStub(): StubElement {
  const onCalls: Array<[string, string | undefined]> = [];
  const offCalls: string[] = [];
  const appendTargets: GalleryJQueryElement[] = [];
  const handlers: Array<(event: { currentTarget: EventTarget | null; preventDefault(): void }) => void> = [];
  const element = {
    onCalls,
    offCalls,
    appendTargets,
    handlers,
    removed: false,
    appendTo(target: GalleryJQueryElement) { appendTargets.push(target); return element; },
    find: () => element,
    get: () => undefined,
    val: ((value?: string) => value === undefined ? '' : element) as GalleryJQueryElement['val'],
    text: () => element,
    html: () => element,
    empty: () => element,
    prop: () => element,
    attr: ((name: string, value?: string) => value === undefined ? undefined : element) as GalleryJQueryElement['attr'],
    trigger: () => element,
    on: ((eventName: string, selectorOrHandler: string | ((event: { currentTarget: EventTarget | null; preventDefault(): void }) => void), maybeHandler?: (event: { currentTarget: EventTarget | null; preventDefault(): void }) => void) => {
      onCalls.push([eventName, typeof selectorOrHandler === 'string' ? selectorOrHandler : undefined]);
      handlers.push(typeof selectorOrHandler === 'function' ? selectorOrHandler : maybeHandler!);
      return element;
    }) as GalleryJQueryElement['on'],
    off(eventName: string) { offCalls.push(eventName); return element; },
    each: () => element,
    remove() { element.removed = true; },
  } satisfies StubElement;
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
  const jquery = Object.assign((target: object) => target === document.body ? body : editor, { summernote: { ui } }) as GalleryJQueryFactory;
  const context: GallerySummernoteContext<GalleryJQueryElement> = {
    options: { dialogsInBody },
    layoutInfo: { editable, editor },
    memo: () => undefined,
    invoke: () => undefined,
  };
  return {
    boundary: { context, jquery, ui } satisfies GalleryAdapterBoundary,
    editor,
    editable,
    dialog,
    body,
    hideDialog,
  };
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
      ['dblclick.snbGalleryV3', '[data-snb-brick="gallery"]'],
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
