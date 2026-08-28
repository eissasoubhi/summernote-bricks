# summernote-gallery

`packages/gallery` is the maintained monorepo source for the `summernote-gallery` npm package while the standalone `eissasoubhi/summernote-gallery` repository remains public and preserved for history, issues, tags and compatibility reference.

## Cutover status

The Gallery migration is complete through publishability proof. The monorepo package includes:

- semantic v3 render/parse behavior and explicit legacy migration
- source/folder/search/view/selection/upload/save/edit behavior
- deterministic async runtime, dialog controller/presenter and lifecycle
- the thin Summernote/jQuery constructor and toolbar button adapter
- ESM, CommonJS/UMD and browser entrypoints
- TypeScript declarations with no private SNB Core ABI leakage
- exact `npm pack`, clean ESM/CommonJS/browser consumers and persisted-HTML regression checks

The standalone `3.0.0-rc.1` line remains the pinned historical migration baseline. That immutable npm identity is not reused. The coordinated monorepo release candidate is `summernote-gallery@3.0.0-rc.2`.

Feature-specific Gallery behavior stays in this package; the private SNB Core contains only genuinely shared Summernote infrastructure.
