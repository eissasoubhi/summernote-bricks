import { describe, expect, it, vi } from 'vitest';
import type {
  SummernoteButtonOptions,
  SummernoteDialogOptions,
  SummernoteUiAdapter,
} from '../../core/src/summernote';
import {
  createSummernoteHeadingPlugin,
  type HeadingJQueryElement,
  type HeadingJQueryEvent,
  type HeadingJQueryFactory,
  type HeadingPluginInstance,
} from '../src/jquery-adapter';
import type { HeadingSummernoteContext } from '../src/plugin-contract';

class FakeQuery implements HeadingJQueryElement {
  readonly children = new Map<string, FakeQuery>();
  readonly handlers = new Map<string, (event: HeadingJQueryEvent) => void>();
  value: unknown = '';
  textValue = '';
  appendedTo: HeadingJQueryElement | null = null;
  removed = false;
  lastTriggered = '';

  appendTo(target: HeadingJQueryElement): HeadingJQueryElement {
    this.appendedTo = target;
    return this;
  }

  find(selector: string): HeadingJQueryElement {
    let child = this.children.get(selector);
    if (!child) {
      child = new FakeQuery();
      this.children.set(selector, child);
    }
    return child;
  }

  val(): unknown;
  val(value: string): HeadingJQueryElement;
  val(value?: string): unknown | HeadingJQueryElement {
    if (value === undefined) {
      return this.value;
    }
    this.value = value;
    return this;
  }

  text(value: string): HeadingJQueryElement {
    this.textValue = value;
    return this;
  }

  trigger(eventName: string): HeadingJQueryElement {
    this.lastTriggered = eventName;
    return this;
  }

  on(eventName: string, handler: (event: HeadingJQueryEvent) => void): HeadingJQueryElement;
  on(
    eventName: string,
    selector: string,
    handler: (event: HeadingJQueryEvent) => void,
  ): HeadingJQueryElement;
  on(
    eventName: string,
    selectorOrHandler: string | ((event: HeadingJQueryEvent) => void),
    handler?: (event: HeadingJQueryEvent) => void,
  ): HeadingJQueryElement {
    const callback = typeof selectorOrHandler === 'function' ? selectorOrHandler : handler;
    if (callback) {
      this.handlers.set(eventName, callback);
    }
    return this;
  }

  off(eventName: string): HeadingJQueryElement {
    for (const key of [...this.handlers.keys()]) {
      if (key === eventName || key.endsWith(eventName)) {
        this.handlers.delete(key);
      }
    }
    return this;
  }

  remove(): void {
    this.removed = true;
  }
}

function createFixture() {
  const editable = new FakeQuery();
  const editor = new FakeQuery();
  const body = new FakeQuery();
  const dialog = new FakeQuery();
  const button = new FakeQuery();
  let buttonOptions: SummernoteButtonOptions | null = null;
  let dialogOptions: SummernoteDialogOptions | null = null;
  let shownCallback: (() => void) | null = null;
  let hiddenCallback: (() => void) | null = null;

  const ui: SummernoteUiAdapter<HeadingJQueryElement> = {
    button(options) {
      buttonOptions = options;
      return { render: () => button };
    },
    dialog(options) {
      dialogOptions = options;
      return { render: () => dialog };
    },
    hideDialog: vi.fn(),
    showDialog: vi.fn(),
    onDialogShown(_dialog, callback) {
      shownCallback = callback;
    },
    onDialogHidden(_dialog, callback) {
      hiddenCallback = callback;
    },
  };

  const jquery = ((target: object) => target === document.body ? body : new FakeQuery()) as HeadingJQueryFactory;
  Object.defineProperty(jquery, 'summernote', { value: { ui } });

  const memo = new Map<string, () => unknown>();
  const invoke = vi.fn();
  const context: HeadingSummernoteContext<HeadingJQueryElement> = {
    options: { id: 'editor-a', dialogsInBody: false },
    layoutInfo: { editable, editor },
    memo(key, factory) {
      memo.set(key, factory);
    },
    invoke,
  };

  const instance = {} as HeadingPluginInstance;
  createSummernoteHeadingPlugin(jquery).call(instance, context);

  return {
    editable,
    editor,
    dialog,
    button,
    ui,
    memo,
    invoke,
    instance,
    getButtonOptions: () => buttonOptions,
    getDialogOptions: () => dialogOptions,
    fireShown: () => shownCallback?.(),
    fireHidden: () => hiddenCallback?.(),
  };
}

describe('Heading jQuery adapter', () => {
  it('registers the Summernote button through the shared runtime', () => {
    const fixture = createFixture();
    const factory = fixture.memo.get('button.summernoteHeading');

    expect(factory).toBeTypeOf('function');
    expect(factory?.()).toBe(fixture.button);
    expect(fixture.getButtonOptions()).toMatchObject({
      contents: 'Heading',
      tooltip: 'Insert heading',
    });
  });

  it('mounts, focuses and tears down the dialog without owning feature logic', () => {
    const fixture = createFixture();

    fixture.instance.initialize();
    expect(fixture.getDialogOptions()).toMatchObject({ title: 'Heading' });
    expect(fixture.dialog.appendedTo).toBe(fixture.editor);
    expect(fixture.editable.handlers.has('dblclick.snbHeadingV3')).toBe(true);

    fixture.instance.show();
    fixture.fireShown();
    const title = fixture.dialog.find('.snb-heading-form__title') as FakeQuery;
    expect(title.lastTriggered).toBe('focus');

    fixture.fireHidden();
    fixture.instance.destroy();
    expect(fixture.dialog.removed).toBe(true);
    expect(fixture.editable.handlers.size).toBe(0);
  });
});
