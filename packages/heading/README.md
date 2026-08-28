# summernote-heading

`packages/heading` is the maintained monorepo source for the `summernote-heading` npm package while the standalone `eissasoubhi/summernote-heading` repository remains public and preserved for history, issues, tags and compatibility reference.

## Cutover status

The Heading migration is complete through publishability proof. The monorepo package includes:

- semantic v3 heading normalization, parsing and rendering
- explicit legacy-markup migration
- typed options, dialog/runtime state and the thin Summernote/jQuery adapter
- ESM, CommonJS/UMD and browser entrypoints
- TypeScript declarations with no private SNB Core ABI leakage
- deterministic standalone-behavior parity gates
- exact `npm pack`, clean-consumer and persisted-HTML regression checks

The standalone `3.0.0-rc.1` line remains the pinned historical migration baseline. That immutable npm identity is not reused. The coordinated monorepo release candidate is `summernote-heading@3.0.0-rc.2`.

Feature-specific Heading behavior stays in this package; the private SNB Core contains only genuinely shared Summernote infrastructure.
