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

## v3 source promotion status

The consolidated v3 source has already been promoted from `develop` to public `master` after the exact promotion head passed deterministic root CI and the maintained Summernote 0.9.1 BS3/BS4/BS5/Lite × Chromium/Firefox/WebKit matrix.

That source promotion is **not** a package release. Before publishing any v3 package or creating a GitHub Release:

- run root validation from a clean `npm ci` install;
- validate the Bricks package and the intended Heading/Gallery package versions from their real tarball candidates;
- require the maintained browser compatibility matrix to pass;
- verify ESM, CommonJS and browser/script-tag entrypoints match the documented package layout;
- confirm legacy Heading/Gallery migration remains explicit and opt-in;
- review installation, migration and rollback documentation against the exact package versions being released;
- review package version, tag and release-note intent explicitly;
- stop if `docs/V3_RELEASE_CHECKLIST.md` has any unresolved item.

The detailed human-controlled checklist lives in `docs/V3_RELEASE_CHECKLIST.md`. Issue #3 is the authoritative ecosystem roadmap and release-readiness status.

## Continuous compatibility before release

The central Bricks browser workflow validates the current public Heading and Gallery heads against Bricks and also runs on a daily schedule. A green scheduled run is a safety signal, not publication authorization; release candidates still require validation of the exact artifacts intended for publication.

## npm publishing target

The preferred long-term flow is npm trusted publishing from GitHub Actions using OIDC, with provenance enabled. Configure and verify the trusted publisher in npm before enabling any publish action.

Until publication is explicitly approved, automation should stop at package construction/validation. Do not request or store a long-lived npm token merely to complete release-readiness CI.

For a release candidate, use the intended prerelease version/dist-tag only after explicit approval. Verify the package from the public npm registry in a clean consumer project before treating publication as successful.

## Git tags and GitHub Releases

Git tags and GitHub Releases are post-publication actions, not source-consolidation gates. Create them only after the corresponding package/version has been explicitly approved and, when applicable, verified from the public registry.

Release notes should cover user-visible changes, compatibility, persisted-content/migration requirements, rollback guidance and known limitations.
