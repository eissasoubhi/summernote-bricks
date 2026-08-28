// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createGalleryDialogStateRuntime } from '../src/dialog-state';
import { renderGalleryDialogSnapshot } from '../src/dialog-presenter';
import type {
  GalleryAdapterBoundary,
  GalleryJQueryElement,
  GalleryJQueryEvent,
  GalleryJQueryFactory,
} from '../src/jquery-adapter';
import { defaultGalleryOptions } from '../src/options';
import type { GallerySummernoteContext, GallerySummernoteUi } from '../src/summernote-contract';

interface StubElement extends GalleryJQueryElement {
  readonly children: Map<string, StubElement>;
  readonly attributes: Map<string, string>;
  readonly node?: HTMLElement;
  textValue: string;
  htmlValue: string;
  props: Map<string, unknown>;
  eachElements: Element[];
}

function elementStub(node?: HTMLElement): StubElement {
  const element = {} as StubElement;
  element.children = new Map();
  element.attributes = new Map();
  element.textValue = '';
  element.htmlValue = '';
  element.props = new Map();
  element.eachElements = [];
  Object.defineProperty(element, 'node', { value: node });
  element.appendTo = () => element;
  element.find = (selector) => element.children.get(selector) ?? element;
  element.get = () => element.node;
  element.val = ((value?: string) => value === undefined ? '' : element) as GalleryJQueryElement['val'];
  element.text = (value) => { element.textValue = value; return element; };
  element.html = (value) => { element.htmlValue = value; if (element.node) element.node.innerHTML = value; return element; };
  element.empty = () => { element.htmlValue = ''; return element; };
  element.prop = (name, value) => { element.props.set(name, value); return element; };
  element.attr = ((name: string, value?: string) => {
    if (value === undefined) return element.attributes.get(name);
    element.attributes.set(name, value);
    return element;
  }) as GalleryJQueryElement['attr'];
  element.trigger = () => element;
  element.on = (() => element) as GalleryJQueryElement['on'];
  element.off = () => element;
  element.each = (callback) => { element.eachElements.forEach((child, index) => callback(index, child)); return element; };
  element.remove = () => undefined;
  return element;
}

function fixture() {
  const dialog = elementStub();
  const folders = elementStub();
  const current = elementStub();
  const actions = elementStub();
  const resultsNode = document.createElement('div');
  const results = elementStub(resultsNode);
  const views = elementStub();
  const gridElement = document.createElement('button');
  const galleryElement = document.createElement('button');
  const grid = elementStub();
  const gallery = elementStub();
  const status = elementStub();
  grid.attributes.set('data-view', 'grid');
  gallery.attributes.set('data-view', 'gallery');
  views.eachElements = [gridElement, galleryElement];
  folders.children.set('.snb-gallery-v3-form__folder-current', current);
  folders.children.set('.snb-gallery-v3-form__folder-actions', actions);
  dialog.children.set('.snb-gallery-v3-form__folders', folders);
  dialog.children.set('.snb-gallery-v3-form__results', results);
  dialog.children.set('.snb-gallery-v3-form__view', views);
  dialog.children.set('.snb-gallery-v3-form__status', status);

  const targets = new Map<object, StubElement>([[gridElement, grid], [galleryElement, gallery]]);
  const editor = elementStub();
  const ui: GallerySummernoteUi<GalleryJQueryElement> = {
    button: () => ({ render: () => editor }),
    dialog: () => ({ render: () => dialog }),
    showDialog: () => undefined,
    hideDialog: () => undefined,
    onDialogShown: (_dialog, callback) => callback(),
    onDialogHidden: (_dialog, callback) => callback(),
  };
  const jquery = Object.assign(
    (target: object) => targets.get(target) ?? editor,
    { summernote: { ui } },
  ) as GalleryJQueryFactory;
  const context: GallerySummernoteContext<GalleryJQueryElement> = {
    options: {},
    layoutInfo: { editable: editor, editor },
    memo: () => undefined,
    invoke: () => undefined,
  };
  const boundary: GalleryAdapterBoundary = { context, jquery, ui };
  return { boundary, dialog, folders, current, actions, results, resultsNode, grid, gallery, status };
}

describe('Gallery dialog presenter', () => {
  it('renders visible results, folder navigation, selection and view state from one snapshot', () => {
    const runtime = createGalleryDialogStateRuntime('gallery');
    runtime.replaceAvailableImages([
      { id: 'root', src: '/root.jpg', alt: 'Root', path: 'root.jpg' },
      { id: 'a', src: '/a.jpg', alt: 'A', path: 'events/a.jpg' },
      { id: 'b', src: '/b.jpg', alt: 'B', path: 'events/b.jpg' },
    ]);
    runtime.setFolder('events');
    runtime.selectItem(0);
    const view = fixture();

    renderGalleryDialogSnapshot(view.boundary, view.dialog, defaultGalleryOptions, runtime.snapshot());

    expect(view.folders.props.get('hidden')).toBe(false);
    expect(view.current.textValue).toBe('events');
    expect(view.actions.htmlValue).toContain('data-folder-path=""');
    expect(view.actions.htmlValue).toContain('All images');
    expect(view.results.htmlValue).toContain('data-index="0"');
    expect(view.results.htmlValue).toContain('aria-selected="true"');
    expect(view.results.htmlValue).toContain('/a.jpg');
    expect(view.results.htmlValue).not.toContain('/root.jpg');
    expect(view.resultsNode.dataset.view).toBe('gallery');
    expect(view.resultsNode.style.display).toBe('flex');
    expect(view.grid.attributes.get('aria-pressed')).toBe('false');
    expect(view.gallery.attributes.get('aria-pressed')).toBe('true');
    expect(view.status.textValue).toBe('');
  });

  it('hides empty folder navigation and exposes the configured empty state', () => {
    const runtime = createGalleryDialogStateRuntime();
    runtime.replaceAvailableImages([{ id: 'root', src: '/root.jpg', alt: 'Root' }]);
    runtime.setFolder('missing');
    const view = fixture();
    const options = { ...defaultGalleryOptions, emptyText: 'Nothing here' };

    renderGalleryDialogSnapshot(view.boundary, view.dialog, options, runtime.snapshot());

    expect(view.folders.props.get('hidden')).toBe(true);
    expect(view.current.textValue).toBe('');
    expect(view.actions.htmlValue).toBe('');
    expect(view.status.textValue).toBe('');

    runtime.replaceAvailableImages([]);
    renderGalleryDialogSnapshot(view.boundary, view.dialog, options, runtime.snapshot());
    expect(view.status.textValue).toBe('Nothing here');
  });
});
