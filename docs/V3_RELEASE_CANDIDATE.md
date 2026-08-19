# Summernote Bricks v3 release candidate checklist

This document describes the release-candidate gate for the Summernote Bricks v3 ecosystem. It does not authorize publishing.

## Packages

The v3 line currently covers:

- `summernote-heading`
- `summernote-gallery`
- `snb-components`
- `summernote-bricks` as the optional composer

Heading and Gallery are standalone Summernote plugins. Bricks composes already-registered plugin buttons. SNB-components remains a small shared utility package and must not become a second editor framework.

### Release-wave boundary

The first integrated RC wave is defined by the packages that execute together in the browser compatibility matrix:

- `summernote-heading`
- `summernote-gallery`
- `summernote-bricks`

`SNB-components` is **not** a required dependency of that wave unless a concrete v3 plugin starts importing it. The current Heading v3 and Gallery v3 sources only import their own local modules and interact with Summernote through the host contract, so forcing `snb-components` into their dependency graph would create coupling that the runtime does not need.

Therefore:

- the `snb-components@3.0.0-rc.0` package candidate may be validated and released independently;
- Heading/Gallery must not add `snb-components` merely to synchronize version numbers or release dates;
- if shared code is adopted later, the importing package must add an explicit dependency and the exact integrated tarballs must be re-run through the browser matrix before release.

## Host compatibility

The release candidate targets Summernote 0.9.1 and must stay green on:

- Summernote Bootstrap 3 integration
- Summernote Bootstrap 4 integration
- Summernote Bootstrap 5 integration
- Summernote Lite
- Chromium
- Firefox
- WebKit

Concrete plugins declare jQuery and Summernote as host peers. Brick code does not call Bootstrap modal APIs directly; it uses `$.summernote.ui`.

Summernote plugin registry entries are constructors. Any plugin written to `$.summernote.plugins` must survive the same lifecycle Summernote uses internally: `new ModuleClass(context)`. A callable function is not sufficient if it is not constructable.

## Required package checks

Before a package can be promoted to a release candidate:

1. strict TypeScript typecheck passes;
2. unit/content/migration tests pass;
3. ESM and UMD/browser bundles build;
4. TypeScript declarations build;
5. package `exports` resolve the public entrypoints;
6. ESM `import` and CommonJS `require` are exercised when both are advertised;
7. `npm pack` contains only intended public files;
8. source, tests and internal tooling do not leak into the tarball;
9. script-tag/browser artifacts register against the Summernote host lifecycle they document;
10. plugin registration does not assume `$.summernote.ui` already exists when the plugin registry is available;
11. any `$.summernote.plugins` entry is validated through `new Plugin(context)`;
12. no accidental React/Vue/Bootstrap runtime dependency is introduced;
13. no npm publish or GitHub release runs from validation CI.

## Required browser checks

The authoritative browser gate must execute JavaScript extracted from the candidate npm tarballs, not stale committed bundles or checkout-only output.

It must cover:

- Heading standalone create/edit;
- Gallery standalone load/search/select/edit;
- real Bricks + Heading + Gallery composition;
- multiple editors on one page;
- destroy/recreate lifecycle;
- undo behavior;
- dialog focus and accessible labels/status regions;
- persisted HTML round-trip;
- absence of editor-only controls and implementation styles in persisted content.

The harness should capture uncaught `pageerror` events during editor/plugin initialization so lifecycle exceptions fail immediately with their real message instead of being hidden behind a later toolbar/locator timeout.

## Persisted HTML and migration

Persisted v3 content is an API. It uses semantic HTML plus `data-snb-brick` and `data-snb-version="3"` metadata.

Legacy content must not be rewritten automatically on editor initialization. Heading and Gallery expose explicit parse/migrate helpers so host applications control when migrated HTML is stored.

A stable v3 release must document any information intentionally dropped during migration. Presentation-only legacy data must not be silently reintroduced as opaque runtime state.

## Promotion sequence

1. Validate staged public manifests and candidate tarballs independently.
2. Run the full BS3/BS4/BS5/Lite × Chromium/Firefox/WebKit matrix against the staged Bricks + Heading + Gallery tarballs.
3. Promote the real root package manifests/build entrypoints for Bricks, Heading and Gallery in synchronized draft PRs, without publishing.
4. Run each promoted root package's typecheck/tests/build/`npm pack` gate on Node 22/24.
5. Pack directly from the three promoted root `package.json` files, extract the shipped UMD artifacts, and run the full browser matrix again against those exact files.
6. Consolidate the stacked PR ancestry only after both staged-package and promoted-root gates are green.
7. Treat `snb-components` as an independent RC unless a concrete runtime import makes it part of the integrated dependency graph.
8. Generate reproducible v3 lockfiles after the final package manifests are stable; do not carry forward legacy locks that describe a different dependency graph.
9. Prepare release notes, install/upgrade guidance and migration examples.
10. Publish only after explicit approval.

## Proven RC evidence

At the current v3 checkpoint:

- staged Bricks + Heading + Gallery public tarballs pass the complete Summernote/browser matrix;
- the Playwright browser cache passes the same unchanged matrix;
- promoted root Bricks, Heading and Gallery package contracts pass Node 22/24 typecheck/tests/build/pack validation;
- the promoted-root browser gate packs from the actual root manifests and must stay green before any release preparation is considered complete.

## Stop conditions

Do not promote or publish when any of these is true:

- a required browser combination is red;
- package output differs from the artifact tested in the browser matrix;
- legacy migration behavior is undocumented or untested;
- a package introduces an unexplained runtime dependency;
- a Summernote plugin registry entry is not constructable;
- a browser artifact relies on Summernote UI timing not guaranteed by the tested host lifecycle;
- a PR is behind the branch it is meant to validate;
- the final root package layout has not been re-tested after promotion.
