import type { HeadingSummernoteContext, HeadingV3Options } from './plugin-contract';
import { headingFieldId } from './plugin-contract';

export function escapeHeadingAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderHeadingDialogBody(
  context: HeadingSummernoteContext,
  options: HeadingV3Options,
): string {
  const titleId = headingFieldId(context, 'title');
  const subtitleId = headingFieldId(context, 'subtitle');
  const levelId = headingFieldId(context, 'level');
  const anchorId = headingFieldId(context, 'anchor');

  return [
    '<div class="snb-heading-form">',
    `<label for="${levelId}">${escapeHeadingAttribute(options.levelLabel)}</label>`,
    `<select id="${levelId}" class="snb-heading-form__level">`,
    '<option value="1">H1</option>',
    '<option value="2">H2</option>',
    '<option value="3">H3</option>',
    '<option value="4">H4</option>',
    '<option value="5">H5</option>',
    '<option value="6">H6</option>',
    '</select>',
    `<label for="${titleId}">${escapeHeadingAttribute(options.titleLabel)}</label>`,
    `<input id="${titleId}" class="snb-heading-form__title" type="text" autocomplete="off">`,
    `<label for="${subtitleId}">${escapeHeadingAttribute(options.subtitleLabel)}</label>`,
    `<input id="${subtitleId}" class="snb-heading-form__subtitle" type="text" autocomplete="off">`,
    `<label for="${anchorId}">${escapeHeadingAttribute(options.anchorLabel)}</label>`,
    `<input id="${anchorId}" class="snb-heading-form__anchor" type="text" autocomplete="off">`,
    '<p class="snb-heading-form__error" role="alert" aria-live="polite"></p>',
    '</div>',
  ].join('');
}

export function renderHeadingDialogFooter(options: HeadingV3Options): string {
  return `<button type="button" class="note-btn snb-heading-form__save">${escapeHeadingAttribute(options.saveText)}</button>`;
}
