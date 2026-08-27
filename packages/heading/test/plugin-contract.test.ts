import { describe, expect, it } from 'vitest';

import {
  DEFAULT_HEADING_OPTIONS,
  headingFieldId,
  resolveHeadingOptions,
} from '../src/plugin-contract';

describe('Heading adapter contract', () => {
  it('keeps the standalone defaults stable', () => {
    expect(resolveHeadingOptions(undefined)).toEqual(DEFAULT_HEADING_OPTIONS);
  });

  it('applies only explicit option overrides', () => {
    expect(resolveHeadingOptions({ tooltip: 'Edit heading', defaultLevel: 3 })).toMatchObject({
      buttonLabel: 'Heading',
      tooltip: 'Edit heading',
      defaultLevel: 3,
      dialogTitle: 'Heading',
    });
  });

  it('derives deterministic field ids from the editor id', () => {
    expect(headingFieldId({ options: { id: 'article' } }, 'title')).toBe(
      'snb-heading-article-title',
    );
    expect(headingFieldId({ options: {} }, 'anchor')).toBe('snb-heading-editor-anchor');
  });
});
