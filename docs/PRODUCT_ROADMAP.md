# Summernote Bricks product roadmap

This roadmap treats Summernote Bricks, Gallery and Heading as one product ecosystem while preserving independent packages.

## Product principles

1. **Useful alone, better together** — every brick is a standalone Summernote plugin; Bricks adds composition UX.
2. **No backend lock-in** — plugins accept data/adapters instead of assuming Laravel, Symfony, WordPress or a specific API shape.
3. **Persisted HTML is an API** — markup written into editors may live in databases for years. Changes need versioning/migration thinking.
4. **Accessibility is part of the component contract** — keyboard, focus, labels and modal behavior are release criteria.
5. **Compatibility is tested, not advertised from upstream claims** — Summernote/Bootstrap/browser combinations enter the matrix only after browser tests pass.
6. **Small shared core** — move only genuinely reusable runtime concerns into the core; brick-specific behavior stays local.

## Phase 0 — maintenance baseline

Status: in progress.

- CI for all three public repositories.
- Type/build/package smoke checks.
- Correct npm entrypoints for Gallery and Heading.
- Documentation, contribution, security and release policies.
- Bricks composition through standard Summernote button memos.
- Remove concrete deep imports and global Summernote monkey-patching from Bricks.

## Phase 1 — make the ecosystem releaseable

### Modern toolchains

- Gallery/Heading: move TypeScript and build dependencies to maintained versions.
- Bricks: replace Webpack 4 / Node 16 tooling and validate Node 22/24.
- Regenerate lockfiles deliberately and drive known high/critical audit findings down to an acceptable release baseline.

### Public shared core

Gallery and Heading currently rely on `snb-components`, whose source repository is private. For a healthy open-source ecosystem, contributors must be able to inspect and evolve the shared runtime.

Recommended direction: publish the shared runtime as a clearly named public project/package (for example `@summernote-bricks/core`) once its API is cleaned up. Keep the first public API intentionally small.

The migration should be semver-aware so existing packages are not broken abruptly.

### Package contracts

- expose documented module/browser entrypoints;
- use package `exports` once consumer compatibility is verified;
- decide which host libraries belong in `peerDependencies`;
- validate packed tarballs in CI;
- stop relying on internal `src/` or `dist/` deep imports across packages.

## Phase 2 — compatibility and runtime quality

### Browser test harness

Build an ecosystem-level Playwright suite covering:

- standalone Gallery;
- standalone Heading;
- Gallery + Heading composed by Bricks;
- two editors on the same page;
- destroy/recreate lifecycle;
- keyboard/focus behavior;
- persisted HTML round-trips.

Start with the currently working Bootstrap/Summernote combinations, then add newer versions one at a time.

### Bootstrap adapter

The shared runtime currently relies on the jQuery Bootstrap modal API. Introduce a small modal adapter/controller in the shared core:

```text
open(element)
close(element)
onHidden(element, callback)
```

Implement Bootstrap 3/4 and Bootstrap 5 adapters behind that contract. Concrete bricks should not contain version-specific modal code.

### HTML versioning

Introduce a lightweight brick metadata convention for newly generated markup, for example:

```html
<div data-snb-brick="heading" data-snb-version="1">...</div>
```

Do not rewrite existing stored HTML automatically. Use metadata to make future migrations/debugging possible.

## Phase 3 — improve existing bricks

### Gallery

Priority order:

1. search/filter UX;
2. pluggable upload adapter;
3. folder/navigation adapter;
4. grid/list view modes;
5. keyboard navigation and selection accessibility;
6. loading/error/empty states;
7. optional responsive image metadata (`alt`, dimensions, `srcset`) where the host provides it.

Upload should be an application-provided adapter/interface, not a hard-coded server endpoint.

### Heading

Priority order:

1. accessible semantic level (`h1`–`h6`) configuration;
2. reusable style presets instead of arbitrary presentation-only fields;
3. preview inside the modal;
4. safe editing of existing persisted headings;
5. optional anchor/slug support for TOCs and deep links.

Heading must preserve semantic HTML rather than becoming a generic visual title widget.

## Phase 4 — new bricks

Recommended sequence, based on utility versus architectural complexity:

1. **Callout / Alert** — low complexity, highly reusable, validates the extension model.
2. **Button / CTA** — URL, label, target and style preset; useful in CMS content.
3. **Media / Embed** — provider/adaptor-driven video or external media embeds with safe URL handling.
4. **Card** — image + heading + text + optional CTA using shared form primitives.
5. **Columns / Layout** — high value but higher risk because nested editable content and responsive markup affect persistence.
6. **Table of contents** — can consume semantic heading metadata once Heading supports anchors.

Avoid starting with Columns/Layout: it exercises nested editors, persisted structure and responsive framework coupling before the simpler plugin contract is proven.

## Developer experience after the contract stabilizes

Only after at least three independently implemented bricks use the same stable public contract:

- create a `create-summernote-brick` starter/generator;
- provide a compatibility test kit for third-party bricks;
- document a public brick catalogue;
- consider a scoped npm namespace for ecosystem packages.

Do not build the generator before the contract is proven; otherwise it freezes accidental architecture into templates.

## Release model

Target:

- semantic versioning per package;
- changesets/changelog discipline or an equivalent explicit release-note process;
- Git tags + GitHub Releases;
- npm trusted publishing through GitHub Actions/OIDC after npm-side trusted publishers are configured;
- release candidates tested from `npm pack` artifacts before stable publication.

Cross-package releases should follow dependency order, but independent patches should remain independent.
