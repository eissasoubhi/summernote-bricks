import {
  bindGalleryActivation,
  createGalleryDialog,
  disposeGalleryDialog,
  galleryEventNamespace,
} from './adapter-wiring';
import { createGalleryDialogController } from './dialog-controller';
import { bindGalleryDialogRuntime, type GalleryDialogRuntimeBinding } from './dialog-runtime-wiring';
import type {
  GalleryAdapterBoundary,
  GalleryJQueryElement,
  GalleryPluginInstance,
} from './jquery-adapter';
import type { GalleryOptions } from './options';
import { persistGallerySelection } from './runtime';
import type { GallerySourceAdapter } from './source';

const MISSING_SOURCE_MESSAGE = 'Configure summernoteGallery.source with a GallerySourceAdapter.';

function missingSourceAdapter(): GallerySourceAdapter {
  return {
    async list(): Promise<never> {
      throw new Error(MISSING_SOURCE_MESSAGE);
    },
  };
}

export interface GalleryPluginLifecycle extends GalleryPluginInstance {
  save(): boolean;
}

export function createGalleryPluginLifecycle(
  boundary: GalleryAdapterBoundary,
  options: GalleryOptions,
): GalleryPluginLifecycle {
  const controller = createGalleryDialogController(
    options.source ?? missingSourceAdapter(),
    options.upload,
    options.defaultView,
  );

  let dialog: GalleryJQueryElement | null = null;
  let runtime: GalleryDialogRuntimeBinding | null = null;
  let unbindActivation: (() => void) | null = null;
  let editingTarget: HTMLElement | null = null;

  const clearDialog = (current: GalleryJQueryElement): void => {
    current.find('.snb-gallery-v3-form__query').val('');
    current.find('.snb-gallery-v3-form__upload-input').val('');
    current.find('.snb-gallery-v3-form__upload-button').prop('disabled', false);
    current.find('.snb-gallery-v3-form__error').text('');
  };

  const save = (): boolean => {
    if (!dialog) return false;

    try {
      persistGallerySelection(boundary.context, controller.snapshot().selectedImages, editingTarget);
      boundary.ui.hideDialog(dialog);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dialog.find('.snb-gallery-v3-form__error').text(message);
      return false;
    }
  };

  const show = (target?: HTMLElement): void => {
    if (!dialog || !runtime) return;

    editingTarget = target ?? null;
    controller.reset(editingTarget, options.defaultView);
    clearDialog(dialog);
    runtime.render();

    const saveButton = dialog.find('.snb-gallery-v3-form__save');
    const eventName = `click${galleryEventNamespace()}`;
    saveButton.off(eventName).on(eventName, (event) => {
      event.preventDefault();
      save();
    });

    boundary.ui.onDialogShown(dialog, () => {
      dialog?.find('.snb-gallery-v3-form__query').trigger('focus');
      void runtime?.load();
    });

    boundary.ui.onDialogHidden(dialog, () => {
      controller.abort();
      saveButton.off(eventName);
      editingTarget = null;
    });

    boundary.ui.showDialog(dialog);
  };

  return {
    initialize(): void {
      if (dialog) return;
      dialog = createGalleryDialog(boundary, options);
      runtime = bindGalleryDialogRuntime(boundary, dialog, options, controller);
      unbindActivation = bindGalleryActivation(boundary, show);
    },
    destroy(): void {
      controller.abort();
      unbindActivation?.();
      unbindActivation = null;
      runtime?.dispose();
      runtime = null;

      if (dialog) {
        disposeGalleryDialog(boundary, dialog);
        dialog = null;
      }

      editingTarget = null;
    },
    show,
    save,
  };
}

export function galleryMissingSourceMessage(): string {
  return MISSING_SOURCE_MESSAGE;
}
