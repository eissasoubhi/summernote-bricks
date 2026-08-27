import type { HeadingData } from './heading';
import type { HeadingSummernoteContext, HeadingV3Options } from './plugin-contract';
import { resolveHeadingOptions } from './plugin-contract';
import { renderHeadingDialogBody, renderHeadingDialogFooter } from './dialog';

export interface HeadingRuntimeHost<TTarget, TDialog> {
  createDialog(config: { title: string; body: string; footer: string }): TDialog;
  mountDialog(dialog: TDialog, inBody: boolean): void;
  removeDialog(dialog: TDialog): void;
  showDialog(dialog: TDialog): void;
  hideDialog(dialog: TDialog): void;
  onDialogShown(dialog: TDialog, callback: () => void): void;
  onDialogHidden(dialog: TDialog, callback: () => void): void;
  focusTitle(dialog: TDialog): void;
  readDialogData(dialog: TDialog): HeadingData;
  writeDialogData(dialog: TDialog, data: HeadingData): void;
  bindSave(dialog: TDialog, callback: () => void): () => void;
  showError(dialog: TDialog, message: string): void;
  bindHeadingActivation(callback: (target: TTarget) => void): () => void;
  parseTarget(target: TTarget): HeadingData | null;
  renderTarget(data: HeadingData): TTarget;
  replaceTarget(target: TTarget, replacement: TTarget): void;
}

export interface HeadingRuntime {
  initialize(): void;
  destroy(): void;
  show(target?: unknown): void;
}

export function createHeadingRuntime<TTarget, TDialog>(
  context: HeadingSummernoteContext,
  host: HeadingRuntimeHost<TTarget, TDialog>,
): HeadingRuntime {
  const options: HeadingV3Options = resolveHeadingOptions(context.options.summernoteHeading);
  let dialog: TDialog | null = null;
  let editingTarget: TTarget | null = null;
  let unbindActivation: (() => void) | null = null;
  let unbindSave: (() => void) | null = null;

  const clearSaveBinding = (): void => {
    unbindSave?.();
    unbindSave = null;
  };

  const show = (target?: unknown): void => {
    if (dialog === null) {
      return;
    }

    editingTarget = target === undefined ? null : (target as TTarget);
    const existing = editingTarget === null ? null : host.parseTarget(editingTarget);

    host.writeDialogData(dialog, existing ?? {
      level: options.defaultLevel,
      title: '',
      subtitle: '',
      anchor: '',
    });

    clearSaveBinding();
    host.onDialogShown(dialog, () => host.focusTitle(dialog as TDialog));
    host.onDialogHidden(dialog, () => {
      clearSaveBinding();
      editingTarget = null;
    });

    unbindSave = host.bindSave(dialog, () => {
      if (dialog === null) {
        return;
      }

      try {
        const nextTarget = host.renderTarget(host.readDialogData(dialog));

        if (editingTarget !== null) {
          context.invoke('editor.beforeCommand');
          host.replaceTarget(editingTarget, nextTarget);
          context.invoke('editor.afterCommand');
        } else {
          context.invoke('editor.insertNode', nextTarget);
        }

        host.hideDialog(dialog);
      } catch (error) {
        host.showError(
          dialog,
          error instanceof Error ? error.message : 'Unable to save heading.',
        );
      }
    });

    host.showDialog(dialog);
  };

  return {
    initialize(): void {
      if (dialog !== null) {
        return;
      }

      dialog = host.createDialog({
        title: options.dialogTitle,
        body: renderHeadingDialogBody(context, options),
        footer: renderHeadingDialogFooter(options),
      });
      host.mountDialog(dialog, context.options.dialogsInBody === true);
      unbindActivation = host.bindHeadingActivation((target) => show(target));
    },

    destroy(): void {
      clearSaveBinding();
      unbindActivation?.();
      unbindActivation = null;
      editingTarget = null;

      if (dialog !== null) {
        host.hideDialog(dialog);
        host.removeDialog(dialog);
        dialog = null;
      }
    },

    show,
  };
}
