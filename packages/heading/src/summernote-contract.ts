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
