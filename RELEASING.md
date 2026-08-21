# Releasing Summernote Bricks

## Release principles

- Use semantic versioning.
- Never publish directly from an unverified working tree.
- Source consolidation and green CI do **not** authorize publication by themselves.
- A release must pass deterministic package validation and the maintained browser compatibility matrix.
- Breaking changes to options, package entrypoints, persisted brick HTML or the brick contract require a major version.
- npm publication, Git tags and GitHub Releases remain explicit maintainer actions; autonomous development stops before publication.

## Ecosystem independence and order

`summernote-heading` and `summernote-gallery` are standalone Summernote plugins. `summernote-bricks` is an optional composer of already-registered plugin buttons.

`SNB-components` is currently an independent optional core and is **not** a runtime dependency of Heading, Gallery or Bricks. Do not force synchronized versions or publication order around it unless a future implementation demonstrates real shared runtime value.

For a coordinated v3 release wave:

1. validate each standalone package from its real npm tarball candidate;
2. validate Bricks composition against the exact Heading/Gallery candidates;
3. archive the exact three browser-tested tarballs with machine-readable source/digest evidence;
4. stop automation at release readiness;
5. only after explicit maintainer action, publish the exact archived tarballs;
6. verify the public npm registry from a clean consumer;
7. only then create matching tags and GitHub Releases at the exact tested source SHAs.

## v3 source promotion status

The consolidated v3 source has already been promoted to the public branches after deterministic package CI and the maintained Summernote 0.9.1 BS3/BS4/BS5/Lite × Chromium/Firefox/WebKit matrix.

Before any publication:

- root validation must pass from clean `npm ci` installs;
- Bricks, Heading and Gallery must be validated from their exact tarball candidates;
- the maintained browser compatibility matrix must pass;
- ESM, CommonJS and browser/script-tag entrypoints must match the documented package layouts;
- legacy Heading/Gallery migration must remain explicit and opt-in;
- installation, migration and rollback documentation must match the exact versions being released;
- `docs/V3_RELEASE_CHECKLIST.md` must have no unresolved technical stop condition.

Issue #3 remains the authoritative ecosystem roadmap and release-readiness status.

## Release-eligible browser evidence

The central Bricks browser workflow validates the current public Heading and Gallery heads against Bricks and also runs on a daily schedule.

Browser runs produce two intentionally different artifact classes:

- **CI-only compatibility bundle** — produced for pull requests and other non-public-master runs. Its `public-heads.json` has `workflow.releaseEligible: false`, and the artifact name starts with `browser-tested-ci-bundle-`. It must never be published.
- **Release-eligible public-master bundle** — produced only when the workflow tests the exact public Bricks `master` head. Its `public-heads.json` has `workflow.releaseEligible: true`, and the artifact name starts with `browser-tested-release-bundle-`.

The reusable bundle validator rejects release eligibility for pull-request/synthetic refs and requires the tested Bricks ref/SHA to be the exact public `master` source head.

A successful release-eligible run archives `public-heads.json` plus the exact Bricks, Heading and Gallery `.tgz` files used by the browser matrix. The JSON records tested/source refs and SHAs, package versions, tarball filenames, SHA-256 values and byte sizes.

## Publication boundary

Autonomous development may generate and validate release-eligible evidence, but it must not publish npm packages or create Git tags/GitHub Releases automatically.

When the maintainer chooses to release:

1. download the exact successful `browser-tested-release-bundle-*`;
2. revalidate `workflow.releaseEligible: true`, tarball digests/sizes and recorded source SHAs;
3. verify Bricks `master`, Heading `main` and Gallery `master` have not moved since that evidence was generated;
4. publish those exact archived `.tgz` files directly; do not rebuild replacement tarballs;
5. use `next` for prereleases and `latest` for stable versions;
6. verify the published versions from a clean consumer project;
7. create matching `v${version}` tags and GitHub Releases only at the exact recorded source SHAs.

If any source branch moved, npm integrity differs, a tag points at the wrong SHA, registry verification fails, or a required credential is unavailable, stop the release.

## npm publishing target

Release candidates use the npm `next` dist-tag. Stable versions use `latest`.

Trusted Publishing/OIDC remains the preferred long-term authentication model, but authentication choice must not weaken the tarball-first release model.

## Git tags and GitHub Releases

Tags and GitHub Releases are post-publication actions, not source-consolidation gates.

Each release tag must be exactly `v${package.json.version}` and point to the exact source SHA recorded in the release-eligible browser evidence. Existing tags at a different SHA are a hard stop.

Release notes should link to migration and compatibility documentation, and release assets should contain the exact tested package tarball plus `public-heads.json` evidence.
