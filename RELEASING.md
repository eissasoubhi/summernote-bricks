# Releasing Summernote Bricks

## Release principles

- Use semantic versioning.
- Never publish directly from an unverified working tree.
- A release must pass build, tests, package smoke checks and the supported browser compatibility matrix.
- Breaking changes to options, package entrypoints, persisted brick HTML or the brick contract require a major version.

## Ecosystem order

When a release depends on changes in several packages, publish from the bottom of the dependency graph upward:

1. `snb-components` when shared runtime changes are required.
2. Standalone bricks such as `summernote-gallery` and `summernote-heading`.
3. `summernote-bricks` after its dependency ranges are verified against those releases.

Do not require synchronized releases when packages are unaffected.

## Stable v2 gate

Before promoting the current `develop` line to the default stable line:

- modernize the Node/Webpack toolchain;
- test current supported Summernote versions;
- test supported Bootstrap adapters explicitly;
- verify multiple editors and destroy/recreate lifecycle;
- publish working public entrypoints for Gallery and Heading;
- remove deep imports from Bricks;
- document migration from v1;
- produce a release candidate and validate it from the packed npm tarball.

## npm publishing target

The preferred long-term flow is npm trusted publishing from GitHub Actions using OIDC, with provenance enabled. Configure the trusted publisher in npm before enabling the publish job; until then, CI should stop at `npm pack --dry-run` / release artifact validation rather than requiring a long-lived npm token.

## Git tags and GitHub Releases

Create releases from annotated version tags (`vX.Y.Z`). Release notes should cover user-visible changes, compatibility, migration requirements and known limitations.
