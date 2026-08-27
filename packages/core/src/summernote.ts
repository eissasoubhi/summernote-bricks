export const SUMMERNOTE_MIN_VERSION = '0.9.1';
export const SUMMERNOTE_MAX_EXCLUSIVE_VERSION = '0.10.0';

export interface SummernoteLayoutInfo<TElement = unknown> {
  readonly editable: TElement;
  readonly editor: TElement;
}

export interface SummernotePluginContext<
  TOptions extends Record<string, unknown> = Record<string, unknown>,
  TElement = unknown,
> {
  readonly options: TOptions;
  readonly layoutInfo: SummernoteLayoutInfo<TElement>;
  memo(key: string, factory: () => unknown): void;
  invoke(key: string, ...args: unknown[]): unknown;
}

export interface SummernoteRenderedUi<TElement = unknown> {
  render(): TElement;
}

export interface SummernoteButtonOptions {
  readonly contents: string;
  readonly tooltip: string;
  readonly click: () => void;
}

export interface SummernoteDialogOptions {
  readonly title: string;
  readonly body: string;
  readonly footer: string;
}

export interface SummernoteUiAdapter<TElement = unknown> {
  button(options: SummernoteButtonOptions): SummernoteRenderedUi<TElement>;
  dialog(options: SummernoteDialogOptions): SummernoteRenderedUi<TElement>;
  hideDialog(dialog: TElement): void;
  showDialog(dialog: TElement): void;
  onDialogShown(dialog: TElement, callback: () => void): void;
  onDialogHidden(dialog: TElement, callback: () => void): void;
}

export function isSupportedSummernoteVersion(version: string): boolean {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version.trim());

  if (!match) {
    return false;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  return major === 0 && minor === 9 && patch >= 1;
}

export function assertSupportedSummernoteVersion(version: string): void {
  if (!isSupportedSummernoteVersion(version)) {
    throw new Error(
      `Unsupported Summernote version "${version}". Expected >=${SUMMERNOTE_MIN_VERSION} <${SUMMERNOTE_MAX_EXCLUSIVE_VERSION}.`,
    );
  }
}
