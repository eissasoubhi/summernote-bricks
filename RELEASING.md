# Releasing Summernote Bricks

## Release principles

- Use semantic versioning.
- Never publish directly from an unverified working tree.
- Source consolidation and ordinary green CI do **not** authorize publication by themselves.
- A release must pass deterministic package validation and the maintained browser compatibility matrix.
- Breaking changes to options, package entrypoints, persisted brick HTML or the brick contract require a major version.
- Coordinated v3 publication is allowed only from an exact release-eligible public-master browser bundle.

## Ecosystem independence and order

`summernote-heading` and `summernote-gallery` are standalone Summernote plugins. `summernote-bricks` is an optional composer of already-registered plugin buttons.

`SNB-components` is currently an independent optional core and is **not** a runtime dependency of Heading, Gallery or Bricks. It is not part of the coordinated Bricks/Heading/Gallery publication workflow.

For the coordinated v3 release wave:

1. validate each standalone package from its real npm tarball candidate;
2. validate Bricks composition against the exact Heading/Gallery candidates;
3. archive the exact three browser-tested tarballs with machine-readable source/digest evidence;
4. publish only that release-eligible archived bundle;
5. verify the public npm registry from a clean consumer;
6. create matching tags and GitHub Releases at the exact tested source SHAs.

## v3 source promotion status

The consolidated v3 source has already been promoted to the public branches after deterministic package CI and the maintained Summernote 0.9.1 BS3/BS4/BS5/Lite × Chromium/Firefox/WebKit matrix.

Before the publication workflow is allowed to run:

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

## Automated publication

The maintainer has explicitly authorized automated publication for the coordinated Bricks, Heading and Gallery v3 packages once all release gates pass.

`.github/workflows/publish-release.yml` is triggered only by successful completion of `Browser compatibility`. Its publish job is additionally restricted to the real Bricks `master` branch and excludes pull-request runs before secrets or write operations are used.

The workflow:

1. checks out the exact Bricks SHA tested by the triggering browser run;
2. downloads that run's exact `browser-tested-release-bundle-*` artifact;
3. revalidates release eligibility, bundle identities and the triggering Bricks SHA;
4. verifies Bricks `master`, Heading `main` and Gallery `master` have not moved since browser validation;
5. authenticates to npm with the configured publication secret;
6. publishes the exact archived tarballs directly (`next` for prereleases, `latest` for stable versions);
7. treats reruns idempotently, accepting an existing npm version only when registry integrity equals the tested tarball bytes;
8. installs all three published versions from npm in a clean consumer project;
9. creates exact `v${version}` tags and matching GitHub Releases in the three repositories using the configured inter-repository GitHub credential;
10. attaches each exact tested tarball and `public-heads.json` to its GitHub Release.

If any source branch moves after evidence generation, npm integrity differs, a tag points at the wrong SHA, registry verification fails, or a required credential is unavailable, publication stops.

## npm publishing target

Release candidates use the npm `next` dist-tag. Stable versions use `latest`.

The current automation uses the configured npm publication credential. Trusted Publishing/OIDC can replace the token later without changing the tarball-first release model.

The workflow never rebuilds a replacement tarball after browser validation.

## Git tags and GitHub Releases

Tags and GitHub Releases are created only after all three npm artifacts have been published or independently verified byte-for-byte through npm registry integrity and then installed successfully in a clean consumer project.

Each release tag must be exactly `v${package.json.version}` and point to the exact source SHA recorded in the release-eligible browser evidence. Existing tags at a different SHA are a hard stop.

Release notes link back to migration and compatibility documentation, and release assets contain the exact tested package tarball plus `public-heads.json` evidence.
