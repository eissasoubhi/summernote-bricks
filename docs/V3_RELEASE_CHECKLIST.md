# Summernote Bricks v3 release checklist

This checklist is the final human-controlled gate for a public v3 release of the Summernote Bricks ecosystem. Source consolidation and green CI do **not** authorize publishing by themselves.

## Scope

Release candidates:

- `summernote-bricks@3.0.0-rc.0`
- `summernote-heading@3.0.0-rc.0`
- `summernote-gallery@3.0.0-rc.0`
- `SNB-components` remains independent and must not be added as a dependency unless concrete shared runtime value is demonstrated.

Reference host contract: Summernote 0.9.x, currently validated on 0.9.1, with jQuery 3.x.

## 1. Public source state

- [ ] Heading `main` is green and synchronized with the exact source intended for release.
- [ ] Gallery `master` is green and synchronized with the exact source intended for release.
- [ ] Bricks `master` is green and synchronized with the exact source intended for release.
- [ ] the permanent Bricks browser gate is green against the current public Heading `main` and Gallery `master` heads.
- [ ] the latest daily cross-repository compatibility run is green, or an equivalent manual run has been completed after the last public-source change.
- [ ] repository history and previous releases/tags remain intact.

## 2. Reproducible packages

For every package intended for publication:

- [ ] committed lockfile is present for the maintained v3 build path;
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
- [ ] peer dependency ranges match the documented host contract.

## 3. Browser compatibility

The authoritative test must use package artifacts, not source imports.

- [ ] Summernote 0.9.1 + Bootstrap 3 passes Chromium, Firefox and WebKit.
- [ ] Summernote 0.9.1 + Bootstrap 4 passes Chromium, Firefox and WebKit.
- [ ] Summernote 0.9.1 + Bootstrap 5 passes Chromium, Firefox and WebKit.
- [ ] Summernote 0.9.1 Lite passes Chromium, Firefox and WebKit.
- [ ] Heading standalone behavior passes.
- [ ] Gallery standalone behavior passes.
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

## 6. Security and repository hygiene

- [ ] no stale dependency PR targets a toolchain removed by v3.
- [ ] no generated secrets, local paths or credentials are present in tarballs or repository changes.
- [ ] licenses are present in every publishable package.
- [ ] security policy and contribution guidance are current.
- [ ] active PRs/issues do not contain a known release blocker.

## 7. Manual release approval

These steps are intentionally **never automatic** in the autonomous development workflow.

- [ ] maintainer explicitly approves the version numbers and package set to publish.
- [ ] maintainer explicitly approves npm publication.
- [ ] npm package ownership/access is verified before publishing.
- [ ] publish with the intended dist-tag (`next` for a release candidate unless explicitly changed).
- [ ] verify the package from the public npm registry in a clean consumer project.
- [ ] only after registry verification, create matching Git tags / GitHub Releases if desired.
- [ ] verify release notes link to migration and compatibility documentation.

## Stop conditions

Do **not** publish if any of the following is true:

- a required CI/browser gate is red, cancelled or still running;
- any public release source branch moved after the last authoritative compatibility run;
- a package tarball differs from the artifact that passed browser validation;
- a public entrypoint cannot be imported/required/loaded as documented;
- legacy migration behavior is ambiguous or destructive by default;
- the maintainer has not explicitly approved publication.
