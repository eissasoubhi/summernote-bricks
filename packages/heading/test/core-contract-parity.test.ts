import { describe, expect, it } from 'vitest';
import type {
  SummernoteButtonOptions as CoreButtonOptions,
  SummernoteDialogOptions as CoreDialogOptions,
  SummernotePluginContext as CorePluginContext,
  SummernoteUiAdapter as CoreUiAdapter,
} from '../../core/src/summernote';
import type {
  SummernoteButtonOptions as HeadingButtonOptions,
  SummernoteDialogOptions as HeadingDialogOptions,
  SummernotePluginContext as HeadingPluginContext,
  SummernoteUiAdapter as HeadingUiAdapter,
} from '../src/summernote-contract';

type Assert<T extends true> = T;
type Extends<A, B> = A extends B ? true : false;
type Equivalent<A, B> = Extends<A, B> extends true
  ? Extends<B, A> extends true
    ? true
    : false
  : false;

type _ButtonParity = Assert<Equivalent<CoreButtonOptions, HeadingButtonOptions>>;
type _DialogParity = Assert<Equivalent<CoreDialogOptions, HeadingDialogOptions>>;
type _ContextParity = Assert<
  Equivalent<CorePluginContext<Record<string, unknown>, unknown>, HeadingPluginContext>
>;
type _UiParity = Assert<Equivalent<CoreUiAdapter<unknown>, HeadingUiAdapter<unknown>>>;

describe('Heading portable Summernote contract', () => {
  it('keeps package-local declarations while compile-time parity guards Core', () => {
    expect(true).toBe(true);
  });
});
