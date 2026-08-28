export interface GalleryButtonOptions {
  readonly contents: string;
  readonly tooltip: string;
  readonly click: () => void;
}

export interface GalleryDialogOptions {
  readonly title: string;
  readonly body: string;
  readonly footer: string;
}

export interface GalleryRenderedComponent<TElement> {
  render(): TElement;
}

export interface GallerySummernoteUi<TElement> {
  button(options: GalleryButtonOptions): GalleryRenderedComponent<TElement>;
  dialog(options: GalleryDialogOptions): GalleryRenderedComponent<TElement>;
  showDialog(dialog: TElement): void;
  hideDialog(dialog: TElement): void;
  onDialogShown(dialog: TElement, callback: () => void): void;
  onDialogHidden(dialog: TElement, callback: () => void): void;
}

export interface GallerySummernoteContext<TElement> {
  readonly options: {
    readonly id?: string;
    readonly dialogsInBody?: boolean;
    readonly summernoteGallery?: unknown;
  };
  readonly layoutInfo: {
    readonly editable: TElement;
    readonly editor: TElement;
  };
  memo(key: string, factory: () => TElement): void;
  invoke(command: string, ...args: unknown[]): unknown;
}
