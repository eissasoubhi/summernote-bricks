# Monorepo migration plan

Summernote Bricks is becoming the main development repository for the v3 ecosystem while preserving the existing standalone npm package identities and public repository history.

## Target shape

```text
packages/
  core/       shared infrastructure only
  heading/    source of summernote-heading
  gallery/    source of summernote-gallery
  bricks/     batteries-included aggregator
```

The npm-facing products remain independently consumable:

- `summernote-bricks` — recommended aggregate entry point;
- `summernote-heading` — standalone plugin;
- `summernote-gallery` — standalone plugin;
- `@snb/core` — shared infrastructure only if/when publishing it is justified.

## Migration rules

1. Preserve existing repositories, tags, releases and npm identities.
2. Keep the current Bricks/Heading/Gallery release train isolated from migration work until equivalent exact-artifact/browser gates exist in the monorepo.
3. Move only one dependency boundary at a time and keep migration PRs reversible.
4. Never copy Heading or Gallery feature logic into Bricks. Bricks composes plugins through public contracts.
5. Core contains only genuinely shared infrastructure. Feature behavior, persisted HTML, data sources and plugin-specific UI remain outside core.
6. A standalone package must continue to pass its own package and browser gates before its authoritative source can move.
7. Do not archive or redirect the standalone repositories until packages are released successfully from the monorepo and migration provenance is documented.

## Phases

### Phase 1 — shared contract foundation

Introduce a private `packages/core` package with lifecycle/context types and registry primitives. Typecheck and unit-test it from the existing Bricks CI. Do not publish it and do not make current runtime packages depend on it yet.

### Phase 2 — composition API

Teach Bricks to consume a stable plugin contract while preserving the existing Summernote button-composition behavior and third-party button support. Add enable/disable configuration without forcing Heading or Gallery installation internals into Bricks.

### Phase 3 — package source migration

Move Heading and Gallery authoritative source into `packages/heading` and `packages/gallery` one at a time, preserving their npm names, entrypoints, peer ranges and standalone tests. Keep their existing repositories as public historical/migration mirrors during transition.

### Phase 4 — unified release evidence

Generate all package tarballs from one public monorepo commit, run the Summernote 0.9.x browser matrix against those exact tarballs, then publish only the archived artifacts that passed the public-head gates.

### Phase 5 — repository handoff

After successful public releases from the monorepo, mark standalone repositories as development-moved while preserving their history, issues, tags and releases. npm installation remains unchanged for users.

## Current boundary

Phase 1 is intentionally non-disruptive: `packages/core` is private and excluded from the current `summernote-bricks` published file set. The current rc.10 release process remains authoritative until a later migration phase has equivalent or stronger evidence.
