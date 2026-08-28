# Summernote Bricks v3 release checklist

This checklist defines the final gate for a public v3 release of the Summernote Bricks ecosystem. Source consolidation and ordinary green CI do **not** authorize publishing by themselves. Publication is allowed only from an exact release-eligible browser bundle after every automated stop condition below passes.

## Scope

Release candidates:

- `summernote-bricks@3.0.0-rc.12`
- `summernote-heading@3.0.0-rc.2`
- `summernote-gallery@3.0.0-rc.2`
- `SNB-components` remains independent and is not part of this coordinated publication.

The immutable npm identities `summernote-bricks@3.0.0-rc.10`, `summernote-bricks@3.0.0-rc.11`, `summernote-heading@3.0.0-rc.1` and `summernote-gallery@3.0.0-rc.1` already exist with registry integrity different from the intended monorepo-tested artifacts and must never be reused.

Reference host contract: Summernote 0.9.x, currently validated on 0.9.1, with jQuery 3.x.

## 1. Public source state

- [ ] Heading `main` is green and preserved as the standalone compatibility/history baseline.
- [ ] Gallery `master` is green and preserved as the standalone compatibility/history baseline.
- [ ] Bricks `master` is green and synchronized with the exact monorepo source intended for all three release artifacts.
- [ ] the permanent Bricks browser gate is green against the current public Heading `main` and Gallery `master` compatibility baselines.
- [ ] the latest daily/manual/push cross-repository run on the exact public Bricks `master` head is green after the last public-source change.
- [ ] final publication evidence is explicitly marked `workflow.releaseEligible: true`; a pull-request or CI-only run is never accepted as release evidence.
- [ ] Heading and Gallery release evidence records `packages/heading` and `packages/gallery` on the exact Bricks `master` SHA as their artifact source while separately recording standalone public heads as compatibility/history baselines.
- [ ] repository history and previous releases/tags remain intact.

## 2. Reproducible packages

For every package intended for publication:

- [ ] committed lockfile is present for the maintained v3 build path and its root package identity matches `package.json`;
- [ ] clean `npm ci` succeeds on supported Node LTS versions;
- [ ] strict TypeScript check succeeds;
- [ ] unit/migration tests succeed;
- [ ] Vite production build succeeds;
- [ ] declaration generation succeeds;
- [ ] `npm pack` succeeds from a clean checkout;
- [ ] tarball contains only intended distributable files, license and documentation;
- [ ] ESM `import` entrypoint works from the extracted tarball;
- [ ] CommonJS `require` entrypoint works from the extracted tarball;
- [ ] browser/UMD script-tag registration works from the extracted tarball;
- [ ] peer dependency ranges match the documented host contract;
- [ ] the release-eligible browser run records the exact tarball filename, SHA-256 and byte size for Bricks, Heading and Gallery;
- [ ] the same successful release-eligible browser run archives those exact three `.tgz` files together with `public-heads.json` as one `browser-tested-release-bundle-*` artifact;
- [ ] Heading and Gallery archived tarballs are packed from their monorepo package directories, never rebuilt from standalone compatibility repositories;
- [ ] no `browser-tested-ci-bundle-*` artifact is used for publication;
- [ ] the release-validation workflow fails unless the Git tag is exactly `v${package.json.version}` for Bricks, Heading and Gallery;
- [ ] the same release tag/version rule is exercised by ordinary package CI tests before any real release tag is pushed.

## 3. Browser compatibility

The authoritative test must use package artifacts, not source imports.

- [ ] Summernote 0.9.1 + Bootstrap 3 passes Chromium, Firefox and WebKit.
- [ ] Summernote 0.9.1 + Bootstrap 4 passes Chromium, Firefox and WebKit.
- [ ] Summernote 0.9.1 + Bootstrap 5 passes Chromium, Firefox and WebKit.
- [ ] Summernote 0.9.1 Lite passes Chromium, Firefox and WebKit.
- [ ] Heading standalone behavior passes using the monorepo-built Heading artifact against the standalone compatibility contract.
- [ ] Gallery standalone behavior passes using the monorepo-built Gallery artifact against the standalone compatibility contract.
- [ ] Bricks + Heading + Gallery composition passes.
- [ ] multi-editor isolation passes.
- [ ] create/edit and undo/redo pass.
- [ ] destroy/recreate passes.
- [ ] keyboard/focus/accessibility contracts pass.
- [ ] persisted semantic HTML round-trip passes.
- [ ] no browser `pageerror` occurs during the matrix.

## 4. Content and migration safety

- [ ] v3 persisted HTML contains semantic elements and `data-snb-brick` / `data-snb-version` metadata only where required.
- [ ] editor-only controls are absent from persisted HTML.
- [ ] implementation `<style>` blocks are absent from persisted content.
- [ ] legacy Heading content remains readable until an explicit migration is requested.
- [ ] legacy Gallery content remains readable until an explicit migration is requested.
- [ ] legacy migration helpers are opt-in and covered by tests.
- [ ] upgrade and rollback instructions match the final package layout.

## 5. Documentation

- [ ] README installation examples use the final public package names and entrypoints.
- [ ] plugin load order is documented for script-tag users.
- [ ] ESM/CommonJS usage is documented.
- [ ] compatibility table reflects only tested combinations.
- [ ] `V3_UPGRADE.md` matches the public branches.
- [ ] breaking changes from v2 are explicit.
- [ ] migration and rollback paths are explicit.
- [ ] release documentation distinguishes standalone compatibility baselines from monorepo artifact ownership.
- [ ] release documentation distinguishes CI-only compatibility bundles from release-eligible public-master bundles.

## 6. Security and repository hygiene

- [ ] no stale dependency PR targets a toolchain removed by v3.
- [ ] no generated secrets, local paths or credentials are present in tarballs or repository changes.
- [ ] licenses are present in every publishable package.
- [ ] security policy and contribution guidance are current.
- [ ] active PRs/issues do not contain a known release blocker.

## 7. Automated publication authorization

The maintainer has explicitly authorized gated automated npm publication and matching GitHub Releases for Bricks, Heading and Gallery. That authorization does **not** bypass any technical release gate.

The publication workflow must:

- [ ] run only after a successful `Browser compatibility` completion on the real Bricks `master` branch, never from a pull request;
- [ ] download the exact `browser-tested-release-bundle-*` produced by that triggering run;
- [ ] require `workflow.releaseEligible: true` and validate the bundle with the reusable release-bundle validator;
- [ ] verify Bricks `master`, Heading `main` and Gallery `master` compatibility heads have not moved since the evidence was generated;
- [ ] verify Heading/Gallery tarball source paths and source SHAs resolve to the exact release-eligible Bricks `master` SHA;
- [ ] preflight all three candidate npm package/version identities before npm authentication or any publication;
- [ ] verify npm authentication before publication;
- [ ] publish the archived browser-tested `.tgz` files directly, using `next` for prereleases and `latest` for stable versions;
- [ ] be idempotent: an already-published version is accepted only when npm registry integrity matches the exact tested tarball;
- [ ] verify all three published versions from a clean consumer installation before creating GitHub Releases;
- [ ] preserve standalone Heading/Gallery GitHub repository history while clearly recording that their npm release artifacts originate from the monorepo source SHA/path;
- [ ] create or repair matching GitHub Releases and attach the exact package tarball plus `public-heads.json`;
- [ ] never publish `SNB-components` as part of this coordinated workflow.

## Stop conditions

Do **not** publish, or stop the automated workflow immediately, if any of the following is true:

- a required CI/browser gate is red, cancelled or still running;
- the triggering browser run is a pull request or does not represent the exact real Bricks `master` head;
- the only available browser evidence is CI-only or has `workflow.releaseEligible: false`;
- any public compatibility baseline or the Bricks release source moved after the release-eligible compatibility run;
- Heading or Gallery release evidence points to a standalone repository tarball instead of the exact monorepo package source;
- npm authentication is unavailable;
- a package/version already exists on npm with registry integrity different from the exact tested tarball;
- a release Git tag conflicts with the release/history handoff recorded in evidence;
- a package tarball differs from the artifact that passed browser validation;
- the exact browser-tested `.tgz` files are unavailable or their digests cannot be verified against `public-heads.json`;
- a public entrypoint cannot be imported/required/loaded as documented;
- clean consumer installation from the public npm registry fails;
- legacy migration behavior is ambiguous or destructive by default.
