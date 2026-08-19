# Releasing Summernote Bricks

## Release principles

- Use semantic versioning.
- Never publish directly from an unverified working tree.
- Source consolidation and green CI do **not** authorize publication by themselves.
- A release must pass deterministic package validation and the maintained browser compatibility matrix.
- Breaking changes to options, package entrypoints, persisted brick HTML or the brick contract require a major version.
- npm publication and GitHub Releases require explicit maintainer approval and remain separate from autonomous source development.

## Ecosystem independence and order

`summernote-heading` and `summernote-gallery` are standalone Summernote plugins. `summernote-bricks` is an optional composer of already-registered plugin buttons.

`SNB-components` is currently an independent optional core and is **not** a runtime dependency of Heading, Gallery or Bricks. Do not force synchronized versions or publication order around it unless a future implementation introduces demonstrated shared runtime value.

When several packages genuinely depend on changes from the same release wave:

1. validate each standalone package from its real npm tarball candidate;
2. validate Bricks composition against the exact public Heading/Gallery candidates;
3. publish only the packages explicitly approved by the maintainer;
4. verify each public registry artifact before creating matching tags or GitHub Releases.

Do not require synchronized releases when packages are unaffected.

## v3 promotion gate

Before promoting the consolidated v3 `develop` line to `master`:

- root CI must be green from a clean `npm ci` install;
- the Bricks package and current public Heading/Gallery heads must build and pass package-shape checks;
- the maintained Summernote 0.9.1 BS3/BS4/BS5/Lite × Chromium/Firefox/WebKit matrix must pass from packed artifacts;
- multiple-editor, create/edit, undo, focus/accessibility, destroy/recreate and semantic HTML round-trip contracts must remain green;
- ESM, CommonJS and browser/script-tag entrypoints must match the documented package layout;
- legacy Heading/Gallery migration must remain explicit and opt-in;
- installation, migration and rollback documentation must match the final package contracts;
- the `develop -> master` diff must be reviewed as an intentional major replacement and checked for accidental removals;
- the source branch must not move after its authoritative validation without re-running the gates.

The detailed human-controlled checklist lives in `docs/V3_RELEASE_CHECKLIST.md` once that release-readiness change is merged. Issue #3 is the authoritative roadmap for current gate status.

## npm publishing target

The preferred long-term flow is npm trusted publishing from GitHub Actions using OIDC, with provenance enabled. Configure and verify the trusted publisher in npm before enabling any publish action.

Until publication is explicitly approved, automation should stop at package construction/validation. Do not request or store a long-lived npm token merely to complete release-readiness CI.

For a release candidate, use the intended prerelease version/dist-tag only after explicit approval. Verify the package from the public npm registry in a clean consumer project before treating publication as successful.

## Git tags and GitHub Releases

Git tags and GitHub Releases are post-publication actions, not source-consolidation gates. Create them only after the corresponding package/version has been explicitly approved and, when applicable, verified from the public registry.

Release notes should cover user-visible changes, compatibility, persisted-content/migration requirements, rollback guidance and known limitations.
