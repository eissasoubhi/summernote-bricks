import type {
  SummernoteButtonOptions,
  SummernoteDialogOptions,
  SummernoteUiAdapter,
} from '../../core/src/summernote';
import { parseHeading, renderHeading, type HeadingData } from './heading';
import {
  resolveHeadingOptions,
  type HeadingSummernoteContext,
} from './plugin-contract';
import {
  createHeadingRuntime,
  type HeadingRuntimeHost,
} from './runtime';

const PLUGIN_NAME = 'summernoteHeading';
const EVENT_NAMESPACE = '.snbHeadingV3';
const HEADING_SELECTOR = '[data-snb-brick="heading"]';

export interface HeadingJQueryEvent {
  readonly currentTarget: EventTarget | null;
  preventDefault(): void;
}

export interface HeadingJQueryElement {
  appendTo(target: HeadingJQueryElement): HeadingJQueryElement;
  find(selector: string): HeadingJQueryElement;
  val(): unknown;
  val(value: string): HeadingJQueryElement;
  text(value: string): HeadingJQueryElement;
  trigger(eventName: string): HeadingJQueryElement;
  on(eventName: string, handler: (event: HeadingJQueryEvent) => void): HeadingJQueryElement;
  on(
    eventName: string,
    selector: string,
    handler: (event: HeadingJQueryEvent) => void,
  ): HeadingJQueryElement;
  off(eventName: string): HeadingJQueryElement;
  remove(): void;
}

export interface HeadingJQueryFactory {
  (target: object): HeadingJQueryElement;
  readonly summernote: {
    readonly ui: SummernoteUiAdapter<HeadingJQueryElement>;
  };
}

export interface HeadingPluginInstance {
  initialize(): void;
  destroy(): void;
  show(target?: HTMLElement): void;
}

export function createJQueryHeadingHost(
  context: HeadingSummernoteContext<HeadingJQueryElement>,
  jquery: HeadingJQueryFactory,
  ui: SummernoteUiAdapter<HeadingJQueryElement> = jquery.summernote.ui,
): HeadingRuntimeHost<HTMLElement, HeadingJQueryElement> {
  return {
    createDialog(config: SummernoteDialogOptions): HeadingJQueryElement {
      return ui.dialog(config).render();
    },

    mountDialog(dialog, inBody): void {
      const target = inBody ? jquery(document.body) : context.layoutInfo.editor;
      dialog.appendTo(target);
    },

    removeDialog(dialog): void {
      dialog.remove();
    },

    showDialog(dialog): void {
      ui.showDialog(dialog);
    },

    hideDialog(dialog): void {
      ui.hideDialog(dialog);
    },

    onDialogShown(dialog, callback): void {
      ui.onDialogShown(dialog, callback);
    },

    onDialogHidden(dialog, callback): void {
      ui.onDialogHidden(dialog, callback);
    },

    focusTitle(dialog): void {
      dialog.find('.snb-heading-form__title').trigger('focus');
    },

    readDialogData(dialog): HeadingData {
      return {
        level: Number(dialog.find('.snb-heading-form__level').val()) as HeadingData['level'],
        title: String(dialog.find('.snb-heading-form__title').val() || ''),
        subtitle: String(dialog.find('.snb-heading-form__subtitle').val() || ''),
        anchor: String(dialog.find('.snb-heading-form__anchor').val() || ''),
      };
    },

    writeDialogData(dialog, data): void {
      dialog.find('.snb-heading-form__level').val(String(data.level));
      dialog.find('.snb-heading-form__title').val(data.title);
      dialog.find('.snb-heading-form__subtitle').val(data.subtitle || '');
      dialog.find('.snb-heading-form__anchor').val(data.anchor || '');
      dialog.find('.snb-heading-form__error').text('');
    },

    bindSave(dialog, callback): () => void {
      const save = dialog.find('.snb-heading-form__save');
      const eventName = `click${EVENT_NAMESPACE}`;
      save.off(eventName);
      save.on(eventName, (event) => {
        event.preventDefault();
        callback();
      });
      return () => save.off(eventName);
    },

    showError(dialog, message): void {
      dialog.find('.snb-heading-form__error').text(message);
    },

    bindHeadingActivation(callback): () => void {
      const editable = context.layoutInfo.editable;
      const eventName = `dblclick${EVENT_NAMESPACE}`;
      editable.on(eventName, HEADING_SELECTOR, (event) => {
        if (event.currentTarget instanceof HTMLElement) {
          callback(event.currentTarget);
        }
      });
      return () => editable.off(EVENT_NAMESPACE);
    },

    parseTarget(target): HeadingData | null {
      return parseHeading(target);
    },

    renderTarget(data): HTMLElement {
      return renderHeading(data);
    },

    replaceTarget(target, replacement): void {
      target.replaceWith(replacement);
    },
  };
}

export function createSummernoteHeadingPlugin(
  jquery: HeadingJQueryFactory,
): (
  this: HeadingPluginInstance,
  context: HeadingSummernoteContext<HeadingJQueryElement>,
) => void {
  return function SummernoteHeading(
    this: HeadingPluginInstance,
    context: HeadingSummernoteContext<HeadingJQueryElement>,
  ): void {
    const options = resolveHeadingOptions(context.options.summernoteHeading);
    const ui = jquery.summernote.ui;
    const runtime = createHeadingRuntime(context, createJQueryHeadingHost(context, jquery, ui));

    context.memo(`button.${PLUGIN_NAME}`, () => {
      const button: SummernoteButtonOptions = {
        contents: options.buttonLabel,
        tooltip: options.tooltip,
        click: () => runtime.show(),
      };
      return ui.button(button).render();
    });

    this.initialize = runtime.initialize;
    this.destroy = runtime.destroy;
    this.show = (target?: HTMLElement) => runtime.show(target);
  };
}
