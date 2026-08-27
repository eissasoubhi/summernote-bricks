import { describe, expect, it } from 'vitest';
import { DEFAULT_HEADING_OPTIONS } from '../src/plugin-contract';
import {
  escapeHeadingAttribute,
  renderHeadingDialogBody,
  renderHeadingDialogFooter,
} from '../src/dialog';

const context = {
  options: { id: 'editor-a' },
  layoutInfo: { editable: null, editor: null },
  memo: () => undefined,
  invoke: () => undefined,
};

describe('Heading dialog staging helpers', () => {
  it('escapes user-facing labels before rendering HTML', () => {
    expect(escapeHeadingAttribute('A&B <"C">')).toBe('A&amp;B &lt;&quot;C&quot;&gt;');
  });

  it('preserves standalone field ids and semantic form structure', () => {
    const body = renderHeadingDialogBody(context, DEFAULT_HEADING_OPTIONS);

    expect(body).toContain('id="snb-heading-editor-a-level"');
    expect(body).toContain('id="snb-heading-editor-a-title"');
    expect(body).toContain('id="snb-heading-editor-a-subtitle"');
    expect(body).toContain('id="snb-heading-editor-a-anchor"');
    expect(body).toContain('role="alert"');
    expect(body).toContain('aria-live="polite"');
    expect(body).toContain('<option value="6">H6</option>');
  });

  it('renders the existing Summernote save-button contract', () => {
    expect(renderHeadingDialogFooter(DEFAULT_HEADING_OPTIONS)).toBe(
      '<button type="button" class="note-btn snb-heading-form__save">Save</button>',
    );
  });
});
