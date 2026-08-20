# Summernote Bricks product roadmap

This roadmap treats Summernote Bricks, Gallery and Heading as one product ecosystem while preserving independent packages and repository history.

## Product principles

1. **Useful alone, better together** — Heading and Gallery remain standalone Summernote plugins; Bricks adds composition UX.
2. **No backend lock-in** — plugins accept data/adapters instead of assuming Laravel, Symfony, WordPress or a specific API shape.
3. **Persisted HTML is an API** — markup written into editors may live in databases for years. Changes require versioning and explicit migration behavior.
4. **Accessibility is part of the contract** — keyboard, focus, labels and dialog behavior are release criteria.
5. **Compatibility is tested, not assumed** — Summernote/Bootstrap/browser combinations are documented only after real-browser validation.
6. **Small shared core** — `SNB-components` stays independent and optional unless concrete shared runtime value justifies coupling.
7. **Publication is separate from source readiness** — green source/CI never authorizes npm publication or GitHub Releases by itself.

## Current v3 baseline — completed

### Toolchain and packages

- strict TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` across maintained v3 lines;
- Vite library builds with ESM, CommonJS/browser artifacts and TypeScript declarations;
- Vitest/jsdom unit and migration coverage;
- deterministic lockfiles and `npm ci` CI on maintained v3 paths;
- package `exports`, documented peer dependencies and tarball-first validation;
- Node 22/24 validation for maintained package/tooling paths.

### Public repository roles

- `summernote-heading`: standalone semantic Heading v3 plugin on public `main`;
- `summernote-gallery`: standalone backend-agnostic Gallery v3 plugin on public `master`;
- `summernote-bricks`: optional composer and central browser compatibility harness on public `master`;
- `SNB-components`: public independent optional core on `main`; Heading/Gallery do not depend on it.

### Runtime and content contract

- Summernote-native plugin lifecycle and UI integration;
- semantic persisted HTML with `data-snb-brick` / `data-snb-version` metadata where required;
- editor controls, source metadata and transport details excluded from persisted content;
- explicit/opt-in legacy migration helpers;
- multi-editor isolation, create/edit, undo, destroy/recreate and HTML round-trip coverage.

### Compatibility baseline

The authoritative browser harness currently proves Summernote 0.9.1 with:

- Bootstrap 3 × Chromium / Firefox / WebKit;
- Bootstrap 4 × Chromium / Firefox / WebKit;
- Bootstrap 5 × Chromium / Firefox / WebKit;
- Summernote Lite × Chromium / Firefox / WebKit.

The central Bricks workflow validates current public Heading/Gallery heads and also runs daily to detect cross-repository drift.

## Gallery v3 — completed feature set

Completed and browser/package validated:

1. text search;
2. source-only media/date filtering;
3. accessible Grid/Gallery view modes;
4. optional host-provided multi-file upload adapter;
5. source-only paths and deterministic folder tree;
6. accessible root/parent/child folder navigation;
7. loading/error/empty-state contracts;
8. semantic persistence that excludes upload/folder/filter/view metadata.

Future Gallery work should be treated as new feature scope, not a blocker for the current v3 release candidate. Candidates include responsive image metadata (`srcset`, dimensions), richer keyboard navigation, provider-specific adapters maintained outside the core plugin, and performance work for very large source collections.

## Heading v3 — completed baseline

Completed and validated:

1. semantic `h1`–`h6` configuration;
2. optional subtitle;
3. optional anchor/deep-link support;
4. safe editing of persisted headings;
5. explicit legacy migration helpers;
6. strict omission of absent optional fields rather than serializing `undefined`-shaped state;
7. accessibility/focus and semantic HTML browser coverage.

Future Heading work should remain semantic-first. Candidates include reusable presentation presets, preview UX, TOC integration and host-provided slug policies.

## Shared core policy

`SNB-components` is public and independently maintained. It should remain small and optional.

Do **not** move plugin-specific behavior into the core merely to share code. A shared runtime API should be introduced only when at least two concrete consumers need the same stable abstraction and the dependency reduces overall complexity.

Potential future shared concerns include narrowly scoped form/accessibility primitives or test helpers. Bootstrap-specific modal abstraction is not currently required because concrete v3 plugins integrate through Summernote rather than direct Bootstrap modal APIs.

## Next product opportunities

Recommended order favors high utility with controlled persistence risk:

1. **Callout / Alert** — low complexity, reusable, good third-plugin validation of the extension contract.
2. **Button / CTA** — semantic link/button content with host-controlled style presets.
3. **Media / Embed** — provider/adapter-driven external media with safe URL handling.
4. **Card** — image + heading + text + optional CTA using proven plugin patterns.
5. **Table of contents** — consume semantic Heading anchors once host expectations are clear.
6. **Columns / Layout** — defer until nested persisted structures and responsive behavior have dedicated migration/browser contracts.

Avoid starting with Columns/Layout: it combines nested editing, responsive markup and migration risk before simpler new bricks have validated the public extension model.

## Developer experience after another brick proves the contract

After at least one additional independently implemented brick passes the same package/browser gates:

- extract a compatibility test kit for third-party bricks;
- document a public brick catalogue;
- consider a `create-summernote-brick` starter/generator;
- consider a scoped npm namespace only if it improves discovery without disrupting existing package identities.

Do not freeze a generator around the current internals before a third concrete brick validates which abstractions are genuinely reusable.

## Release model

Current source lines are release-candidate ready, but no autonomous workflow publishes packages.

Before any public release:

- validate exact package versions from clean `npm pack` artifacts;
- require deterministic root/package CI and the full browser matrix to be green after the last source change;
- review `docs/V3_RELEASE_CHECKLIST.md` against the current public branches;
- obtain explicit maintainer approval for package versions, npm publication and any later GitHub tags/releases;
- use npm trusted publishing/OIDC with provenance when publication is intentionally enabled;
- verify published artifacts from a clean consumer project before creating matching Git tags or GitHub Releases.

Independent patches should remain independently releasable; synchronized package releases are required only when actual dependency relationships demand them.
