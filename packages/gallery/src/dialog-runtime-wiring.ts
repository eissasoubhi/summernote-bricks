import { bindGalleryDialogControls } from './adapter-wiring';
import type { GalleryDialogController } from './dialog-controller';
import { renderGalleryDialogSnapshot } from './dialog-presenter';
import type { GalleryAdapterBoundary, GalleryJQueryElement } from './jquery-adapter';
import type { GalleryOptions } from './options';

export interface GalleryDialogRuntimeBinding {
  render(): void;
  load(query?: string): Promise<void>;
  dispose(): void;
}

export function bindGalleryDialogRuntime(
  boundary: GalleryAdapterBoundary,
  dialog: GalleryJQueryElement,
  options: GalleryOptions,
  controller: GalleryDialogController,
): GalleryDialogRuntimeBinding {
  const render = () => renderGalleryDialogSnapshot(boundary, dialog, options, controller.snapshot());
  const setError = (message: string) => {
    dialog.find('.snb-gallery-v3-form__error').text(message);
  };

  const load = async (query = ''): Promise<void> => {
    setError('');
    const result = await controller.load(query);
    if (result.status === 'failed') {
      setError(result.error instanceof Error ? result.error.message : String(result.error));
      return;
    }
    if (result.status !== 'aborted') render();
  };

  const unbindControls = bindGalleryDialogControls(boundary, dialog, {
    onItem(index) {
      controller.selectItem(index);
      render();
    },
    onFolder(path) {
      controller.setFolder(path);
      render();
    },
    onView(value) {
      controller.setView(value);
      render();
    },
    onSearch(query) {
      void load(query);
    },
    onUpload() {
      const input = dialog.find('.snb-gallery-v3-form__upload-input').get(0);
      if (!(input instanceof HTMLInputElement) || !input.files || input.files.length === 0) return;

      setError('');
      void controller.upload(Array.from(input.files)).then((result) => {
        if (result.status === 'failed') {
          setError(result.error instanceof Error ? result.error.message : String(result.error));
          return;
        }
        if (result.status === 'uploaded') {
          input.value = '';
          render();
        }
      });
    },
  });

  render();

  return {
    render,
    load,
    dispose() {
      controller.abort();
      unbindControls();
    },
  };
}
