# Contributing to Summernote Bricks

Summernote Bricks is the optional composer for the Summernote Bricks ecosystem. Changes should keep standalone plugins usable on their own and preserve the documented Summernote integration contract.

## Development setup

The v3 line uses Node 22/24, strict TypeScript, Vite and Vitest. Install exactly from the committed lockfile and run the complete root package gate:

```bash
npm ci
npm run check
```

For browser-facing integration changes, run the maintained Playwright matrix under `browser-tests/`. It covers Summernote 0.9.1 on BS3, BS4, BS5 and Lite across Chromium, Firefox and WebKit.

## Architecture rules

- The Bricks composer must not own Heading or Gallery runtime behavior.
- A compatible standalone Summernote plugin should be composable without editing brick-specific core logic.
- Gallery and Heading remain standalone packages with their own public package contracts.
- `SNB-components` remains optional; do not introduce coupling unless shared runtime value is demonstrated.
- Persisted v3 HTML stays semantic and must not contain editor controls, opaque runtime JSON or implementation `<style>` blocks.
- Legacy migration remains explicit and opt-in.

See `docs/ARCHITECTURE.md` and `docs/V3_UPGRADE.md` before making cross-package or persisted-content changes.

## Tests

Pure registry/configuration behavior needs unit coverage. Browser lifecycle changes require Playwright coverage, including multiple editors and the relevant standalone/composition paths. Packaging changes must keep ESM, CommonJS/browser artifacts and declarations valid through the root package checks.

## Pull requests

Keep changes focused and synchronized with the target branch before merge. Describe compatibility impact when changing package entrypoints, options, persisted HTML, Summernote/Bootstrap support, migration behavior or the composer contract. Required CI and browser checks must be green before merge.

## Releases

Source promotion does not authorize publication. Follow `RELEASING.md` and `docs/V3_RELEASE_CHECKLIST.md`; npm publication and GitHub Releases require separate explicit maintainer approval.

## Security

Do not publish exploitable details in public issues. See `SECURITY.md`.
