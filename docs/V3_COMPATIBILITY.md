# Summernote Bricks v3 compatibility

This document records compatibility that is **proved by the repository browser suite**, not inferred from Summernote or Bootstrap documentation.

## Reference stack

- Summernote: 0.9.1
- jQuery: 3.x host dependency
- browsers: Chromium, Firefox, WebKit (Playwright)
- Heading/Gallery artifacts: exact UMD outputs produced by their Vite v3-tooling builds after typecheck, Vitest, declaration generation and `npm pack --dry-run`
- Bricks artifact: built from the exact tested Bricks SHA

## Interface matrix

| Summernote interface | Host UI | Bricks + Heading + Gallery composition | Standalone Heading | Standalone Gallery |
| --- | --- | --- | --- | --- |
| `summernote-bs5` | Bootstrap 5 | ✅ green | ✅ green | ✅ green |
| `summernote-lite` | Summernote Lite | ✅ green | ✅ green | ✅ green |
| `summernote-bs4` | Bootstrap 4.6.2 | ✅ green | ✅ green | ✅ green |
| `summernote-bs3` | Bootstrap 3.4.1 | ✅ green | ✅ green | ✅ green |

The BS3/BS4 fixtures use pinned local npm dependencies rather than CDNs so release verification is reproducible. Summernote 0.9.1 exposes BS3 through its generic `summernote.js` / `summernote.css` distribution; it does not publish `summernote-bs3.js` / `summernote-bs3.css` files.

## Behaviors covered

The current browser gates collectively verify:

- native Summernote button/dialog integration;
- multiple editor isolation;
- Heading and Gallery semantic persisted HTML;
- no persisted editor-only brick actions or inline implementation styles;
- create/edit behavior and Summernote undo integration;
- dialog focus/accessibility contracts;
- Gallery async source-adapter search/selection;
- destroy/recreate lifecycle;
- persisted HTML round trips;
- real Bricks composition of independently registered Heading/Gallery plugin buttons.

## Compatibility policy

- v3 targets Summernote `>=0.9.1 <0.10` for the first stable line.
- jQuery remains a host peer (`>=3.6 <4`) for concrete plugins.
- plugins do not call Bootstrap modal APIs directly; they use `$.summernote.ui`.
- Bootstrap is therefore an integration matrix concern, not a plugin runtime dependency.
- Summernote 0.8.x is **not supported by claim** unless the same authoritative browser suite is extended and passes.

## Release rule

Compatibility claims require both standalone and composed browser gates. The current Summernote 0.9.1 matrix is green for BS3, BS4, BS5 and Lite across Chromium, Firefox and WebKit. Future host/editor upgrades must rerun the same matrix before the documented range is widened.
