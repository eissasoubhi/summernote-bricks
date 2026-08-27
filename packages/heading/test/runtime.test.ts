import { describe, expect, it } from 'vitest';
import type { HeadingData } from '../src/heading';
import type { HeadingSummernoteContext } from '../src/plugin-contract';
import { createHeadingRuntime, type HeadingRuntimeHost } from '../src/runtime';

type Target = { id: string; data?: HeadingData };
type Dialog = { data: HeadingData | null; error: string };

function createHarness() {
  const calls: string[] = [];
  let save: (() => void) | null = null;
  let activate: ((target: Target) => void) | null = null;
  const dialog: Dialog = { data: null, error: '' };

  const context: HeadingSummernoteContext = {
    options: { id: 'editor-a', dialogsInBody: true },
    layoutInfo: { editable: undefined, editor: undefined },
    memo: () => undefined,
    invoke: (key: string) => {
      calls.push(key);
      return undefined;
    },
  };

  const host: HeadingRuntimeHost<Target, Dialog> = {
    createDialog: ({ body, footer }) => {
      expect(body).toContain('snb-heading-editor-a-title');
      expect(footer).toContain('snb-heading-form__save');
      calls.push('createDialog');
      return dialog;
    },
    mountDialog: (_dialog, inBody) => calls.push(`mount:${String(inBody)}`),
    removeDialog: () => calls.push('removeDialog'),
    showDialog: () => calls.push('showDialog'),
    hideDialog: () => calls.push('hideDialog'),
    onDialogShown: (_dialog, callback) => callback(),
    onDialogHidden: () => undefined,
    focusTitle: () => calls.push('focusTitle'),
    readDialogData: (current) => {
      if (!current.data) {
        throw new Error('missing dialog data');
      }
      return current.data;
    },
    writeDialogData: (current, data) => {
      current.data = data;
    },
    bindSave: (_dialog, callback) => {
      save = callback;
      return () => {
        calls.push('unbindSave');
        save = null;
      };
    },
    showError: (current, message) => {
      current.error = message;
    },
    bindHeadingActivation: (callback) => {
      activate = callback;
      return () => {
        calls.push('unbindActivation');
        activate = null;
      };
    },
    parseTarget: (target) => target.data ?? null,
    renderTarget: (data) => ({ id: 'rendered', data }),
    replaceTarget: (target, replacement) => {
      calls.push(`replace:${target.id}:${replacement.id}`);
    },
  };

  return {
    calls,
    context,
    dialog,
    host,
    activate: (target: Target) => activate?.(target),
    save: () => save?.(),
  };
}

describe('Heading staged runtime', () => {
  it('initializes once and inserts a new heading through the Summernote command boundary', () => {
    const harness = createHarness();
    const runtime = createHeadingRuntime(harness.context, harness.host);

    runtime.initialize();
    runtime.initialize();
    runtime.show();
    harness.dialog.data = { level: 3, title: 'Architecture', subtitle: '', anchor: '' };
    harness.save();

    expect(harness.calls.filter((call) => call === 'createDialog')).toHaveLength(1);
    expect(harness.calls).toContain('mount:true');
    expect(harness.calls).toContain('focusTitle');
    expect(harness.calls).toContain('editor.insertNode');
    expect(harness.calls).toContain('hideDialog');
  });

  it('wraps edits in before/after commands and tears bindings down on destroy', () => {
    const harness = createHarness();
    const runtime = createHeadingRuntime(harness.context, harness.host);
    const target: Target = {
      id: 'existing',
      data: { level: 2, title: 'Existing', subtitle: '', anchor: '' },
    };

    runtime.initialize();
    harness.activate(target);
    harness.dialog.data = { level: 4, title: 'Updated', subtitle: '', anchor: '' };
    harness.save();
    runtime.destroy();

    const beforeIndex = harness.calls.indexOf('editor.beforeCommand');
    const replaceIndex = harness.calls.indexOf('replace:existing:rendered');
    const afterIndex = harness.calls.indexOf('editor.afterCommand');

    expect(beforeIndex).toBeGreaterThanOrEqual(0);
    expect(replaceIndex).toBeGreaterThan(beforeIndex);
    expect(afterIndex).toBeGreaterThan(replaceIndex);
    expect(harness.calls).toContain('unbindSave');
    expect(harness.calls).toContain('unbindActivation');
    expect(harness.calls).toContain('removeDialog');
  });
});
