import type { HeadingLevel } from './heading';
import type { SummernotePluginContext } from './summernote-contract';

export interface HeadingV3Options {
  buttonLabel: string;
  tooltip: string;
  defaultLevel: HeadingLevel;
  dialogTitle: string;
  saveText: string;
  titleLabel: string;
  subtitleLabel: string;
  levelLabel: string;
  anchorLabel: string;
}

export interface HeadingSummernoteOptions extends Record<string, unknown> {
  id?: string;
  dialogsInBody?: boolean;
  summernoteHeading?: Partial<HeadingV3Options>;
}

export type HeadingSummernoteContext<TElement = unknown> = SummernotePluginContext<
  HeadingSummernoteOptions,
  TElement
>;

export const DEFAULT_HEADING_OPTIONS: Readonly<HeadingV3Options> = Object.freeze({
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

export function resolveHeadingOptions(
  overrides: Partial<HeadingV3Options> | undefined,
): HeadingV3Options {
  return {
    ...DEFAULT_HEADING_OPTIONS,
    ...overrides,
  };
}

export function headingFieldId(
  context: Pick<HeadingSummernoteContext, 'options'>,
  suffix: string,
): string {
  const editorId = context.options.id ? String(context.options.id) : 'editor';
  return `snb-heading-${editorId}-${suffix}`;
}
