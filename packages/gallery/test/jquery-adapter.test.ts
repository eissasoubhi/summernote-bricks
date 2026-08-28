import { describe, expect, it } from 'vitest';
import {
  createGalleryAdapterBoundary,
  type GalleryJQueryElement,
  type GalleryJQueryFactory,
} from '../src/jquery-adapter';
import type { GallerySummernoteContext, GallerySummernoteUi } from '../src/summernote-contract';

function elementStub(): GalleryJQueryElement {
  const element: GalleryJQueryElement = {
    appendTo: () => element,
    find: () => element,
    get: () => undefined,
    val: ((value?: string) => value === undefined ? '' : element) as GalleryJQueryElement['val'],
    text: () => element,
    html: () => element,
    empty: () => element,
    prop: () => element,
    attr: ((name: string, value?: string) => value === undefined ? undefined : element) as GalleryJQueryElement['attr'],
    trigger: () => element,
    on: (() => element) as GalleryJQueryElement['on'],
    off: () => element,
    each: () => element,
    remove: () => undefined,
  };
  return element;
}

describe('Gallery jQuery adapter boundary', () => {
  it('uses the Summernote UI exposed by the supplied jQuery factory', () => {
    const editor = elementStub();
    const ui: GallerySummernoteUi<GalleryJQueryElement> = {
      button: () => ({ render: () => editor }),
      dialog: () => ({ render: () => editor }),
      showDialog: () => undefined,
      hideDialog: () => undefined,
      onDialogShown: (_dialog, callback) => callback(),
      onDialogHidden: (_dialog, callback) => callback(),
    };
    const jquery = Object.assign((_target: object) => editor, { summernote: { ui } }) as GalleryJQueryFactory;
    const context: GallerySummernoteContext<GalleryJQueryElement> = {
      options: {},
      layoutInfo: { editable: editor, editor },
      memo: () => undefined,
      invoke: () => undefined,
    };

    const boundary = createGalleryAdapterBoundary(context, jquery);

    expect(boundary.context).toBe(context);
    expect(boundary.jquery).toBe(jquery);
    expect(boundary.ui).toBe(ui);
  });
});
