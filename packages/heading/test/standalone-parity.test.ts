import { describe, expect, it } from 'vitest';
import { renderHeadingDialogBody, renderHeadingDialogFooter } from '../src/dialog';
import { resolveHeadingOptions, type HeadingSummernoteContext } from '../src/plugin-contract';
import { createHeadingRuntime, type HeadingRuntimeHost } from '../src/runtime';

/**
 * Migration provenance for the standalone behavior encoded below.
 *
 * Repository: eissasoubhi/summernote-heading
 * Public main: f8e79008000edd0058df291b7a5a1cc9ebf8c16c
 * Source: src/plugin.ts @ 4f49bc1914a6b854e03a186984f854c2d7cf0727
 * Package: summernote-heading@3.0.0-rc.1
 * Summernote peer range: >=0.9.1 <0.10
 *
 * These tests intentionally duplicate a small set of observable contracts from
 * the standalone plugin. They are a migration gate: changing one of these
 * expectations requires either proving the standalone changed first or
 * explicitly documenting an intentional behavior change.
 */
const STANDALONE_MAIN_SHA = 'f8e79008000edd0058df291b7a5a1cc9ebf8c16c';

type Target = { data?: { level: 1 | 2 | 3 | 4 | 5 | 6; title: string; subtitle?: string; anchor?: string } };
type Dialog = { data: Target['data']; error: string };

function createParityHarness() {
  const calls: string[] = [];
  let save: (() => void) | undefined;
  const dialog: Dialog = { data: undefined, error: '' };
  const context: HeadingSummernoteContext = {
    options: { id: 'parity-editor', dialogsInBody: true },
    layoutInfo: { editable: undefined, editor: undefined },
    memo: () => undefined,
    invoke: (key: string) => {
      calls.push(key);
      return undefined;
    },
  };

  const host: HeadingRuntimeHost<Target, Dialog> = {
    createDialog: () => dialog,
    mountDialog: (_dialog, inBody) => calls.push(`mount:${String(inBody)}`),
    removeDialog: () => calls.push('removeDialog'),
    showDialog: () => calls.push('showDialog'),
    hideDialog: () => calls.push('hideDialog'),
    onDialogShown: (_dialog, callback) => callback(),
    onDialogHidden: () => undefined,
    focusTitle: () => calls.push('focusTitle'),
    readDialogData: (current) => {
      if (!current.data) throw new Error('missing dialog data');
      return current.data;
    },
    writeDialogData: (current, data) => {
      current.data = data;
    },
    bindSave: (_dialog, callback) => {
      save = callback;
      return () => {
        save = undefined;
      };
    },
    showError: (current, message) => {
      current.error = message;
    },
    bindHeadingActivation: () => () => undefined,
    parseTarget: (target) => target.data ?? null,
    renderTarget: (data) => ({ data }),
    replaceTarget: () => calls.push('replaceTarget'),
  };

  return { calls, context, dialog, host, save: () => save?.() };
}

describe('Heading standalone migration parity', () => {
  it('pins the standalone provenance used by this migration gate', () => {
    expect(STANDALONE_MAIN_SHA).toBe('f8e79008000edd0058df291b7a5a1cc9ebf8c16c');
  });

  it('preserves standalone defaults and dialog markup contract', () => {
    const context: HeadingSummernoteContext = {
      options: { id: 'editor-a' },
      layoutInfo: { editable: undefined, editor: undefined },
      memo: () => undefined,
      invoke: () => undefined,
    };
    const options = resolveHeadingOptions(undefined);

    expect(options).toEqual({
      buttonLabel: 'Heading',
      tooltip: 'Insert heading',
      defaultLevel: 2,
      dialogTitle: 'Heading',
      saveText: 'Save',
      titleLabel: 'Title',
      subtitleLabel: 'Subtitle',
      levelLabel: 'Level',
      anchorLabel: 'Anchor',
    });

    const body = renderHeadingDialogBody(context, options);
    expect(body).toContain('id="snb-heading-editor-a-level"');
    expect(body).toContain('<option value="1">H1</option>');
    expect(body).toContain('<option value="6">H6</option>');
    expect(body).toContain('role="alert" aria-live="polite"');
    expect(renderHeadingDialogFooter(options)).toBe(
      '<button type="button" class="note-btn snb-heading-form__save">Save</button>',
    );
  });

  it('preserves standalone insert and edit command semantics', () => {
    const insert = createParityHarness();
    const insertRuntime = createHeadingRuntime(insert.context, insert.host);
    insertRuntime.initialize();
    insertRuntime.show();
    insert.dialog.data = { level: 3, title: 'New heading', subtitle: '', anchor: '' };
    insert.save();

    expect(insert.calls).toContain('mount:true');
    expect(insert.calls).toContain('editor.insertNode');
    expect(insert.calls).toContain('hideDialog');

    const edit = createParityHarness();
    const editRuntime = createHeadingRuntime(edit.context, edit.host);
    editRuntime.initialize();
    editRuntime.show({ data: { level: 2, title: 'Existing', subtitle: '', anchor: '' } });
    edit.dialog.data = { level: 4, title: 'Updated', subtitle: '', anchor: '' };
    edit.save();

    const before = edit.calls.indexOf('editor.beforeCommand');
    const replace = edit.calls.indexOf('replaceTarget');
    const after = edit.calls.indexOf('editor.afterCommand');
    expect(before).toBeGreaterThanOrEqual(0);
    expect(replace).toBeGreaterThan(before);
    expect(after).toBeGreaterThan(replace);
  });
});
