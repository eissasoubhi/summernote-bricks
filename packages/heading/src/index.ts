import { createSummernoteHeadingPlugin, type HeadingJQueryFactory } from './jquery-adapter';

interface HeadingSummernoteRegistry {
  plugins?: Record<string, unknown>;
}

interface HeadingJQueryGlobal extends HeadingJQueryFactory {
  readonly summernote: HeadingJQueryFactory['summernote'] & HeadingSummernoteRegistry;
  extend(target: object, source: object): object;
}

declare const $: HeadingJQueryGlobal;

const plugins = $.summernote?.plugins;

if (!plugins) {
  throw new Error('Summernote must be loaded before summernote-heading.');
}

const SummernoteHeadingV3 = createSummernoteHeadingPlugin($);

$.extend(plugins, {
  summernoteHeading: SummernoteHeadingV3,
});

export { SummernoteHeadingV3 };
export * from './heading';
export type { HeadingPluginInstance } from './jquery-adapter';
