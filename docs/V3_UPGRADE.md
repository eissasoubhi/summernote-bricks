# Summernote Bricks v3 upgrade guide

This guide documents the intended migration path for the v3 release candidate line. It is release preparation only: the packages must not be published until the release gates in the ecosystem roadmap are complete and explicitly approved.

## Scope

The v3 ecosystem keeps the existing public package identities:

- `summernote-bricks`
- `summernote-heading`
- `summernote-gallery`
- `snb-components` (optional shared core)

Heading and Gallery do not currently depend on `snb-components`. Do not add it to an application merely to keep package versions aligned.

## Host requirements

The integrated v3 packages target:

- jQuery `>=3.6 <4`
- Summernote `>=0.9.1 <0.10`

Browser compatibility is proven against Summernote 0.9.1 using the BS3, BS4, BS5 and Lite interfaces on Chromium, Firefox and WebKit.

Bootstrap is a Summernote host/interface concern. v3 plugins use `$.summernote.ui` and must not call Bootstrap modal APIs directly.

## Package installation

Once an approved v3 release candidate is actually published, applications using npm should install only the plugins they need together with the host editor dependencies.

```sh
npm install jquery summernote summernote-heading@3 summernote-gallery@3 summernote-bricks@3
```

`summernote-bricks` is optional. Heading and Gallery remain standalone plugins.

For script-tag installations, load dependencies in this order:

1. jQuery
2. the chosen Summernote interface and its host CSS/JS requirements
3. standalone brick scripts such as Heading and Gallery
4. `summernote-bricks` if the composed Bricks toolbar is wanted
5. initialize the Summernote editor

The plugin registry may exist before `$.summernote.ui` is populated. v3 browser artifacts therefore register with Summernote without assuming that the UI implementation is already available; UI is resolved during plugin initialization.

## Basic standalone configuration

Heading registers `summernoteHeading` and Gallery registers `summernoteGallery` as normal Summernote toolbar buttons.

```js
$('#editor').summernote({
  toolbar: [
    ['insert', ['summernoteHeading', 'summernoteGallery']],
  ],
});
```

Gallery requires a source adapter supplied by the host application. The plugin does not prescribe a REST endpoint, framework, storage provider or server response format.

## Bricks composition

`summernote-bricks` composes buttons that are already registered with Summernote. It does not instantiate Heading or Gallery and does not own their lifecycle.

Load the concrete plugin scripts before editor initialization, then configure the Bricks composer with the supported button names/aliases. A missing child plugin should be treated as a configuration error rather than silently skipped.

## Persisted HTML contract

v3 treats stored HTML as a public API.

New bricks use semantic, versioned markup such as:

```html
<div class="snb-brick snb-heading" data-snb-brick="heading" data-snb-version="3">
  <h2 class="snb-heading__title">Example heading</h2>
</div>
```

Persisted v3 content must remain useful without plugin JavaScript. Editor-only controls, transient modal state, opaque runtime JSON and implementation `<style>` blocks must not be stored in the document.

Before upgrading production data, applications should verify that their sanitizer/HTML-processing pipeline preserves the documented `data-snb-*` attributes and semantic child markup.

## Legacy content migration

v3 deliberately does **not** rewrite legacy Heading or Gallery markup during editor initialization.

The standalone plugins expose explicit parsing/migration helpers for supported pre-v3 persisted schemas. Migration should be an application-controlled operation:

1. read the existing stored HTML;
2. identify legacy brick nodes;
3. parse with the relevant legacy parser;
4. migrate to a new v3 node;
5. inspect/validate the generated HTML;
6. persist the migrated content only when the application decides to commit the change.

This avoids a simple editor open/save unexpectedly rewriting years of stored content.

### Heading

Legacy Heading content may contain opaque `data-brickdata`, `h1.snb-heading-title` and inline presentation styles. The v3 migration preserves meaningful content such as title/subtitle while dropping editor-era implementation markup that is not part of the semantic v3 contract.

### Gallery

Legacy Gallery content may store selected images in `data-brickdata`. The v3 migration converts supported data into semantic image/figure markup while preserving meaningful image metadata such as source, alt/title/caption and stable IDs when available.

Malformed or unsupported legacy payloads must fail explicitly rather than being guessed into a v3 shape.

## Recommended production rollout

Do not combine package upgrade and database-wide content migration in one irreversible deployment.

A safer sequence is:

1. deploy v3 packages with legacy content left untouched;
2. verify create/edit/undo/destroy-recreate behavior in the real host application;
3. validate representative legacy documents using the explicit migration helpers;
4. back up persisted editor content;
5. migrate in controlled batches with application-level validation/auditing;
6. keep rollback capability until migrated documents have been exercised in production.

## Rollback

Package rollback and content rollback are different concerns.

If v3 code is rolled back while stored content has **not** been migrated, the previous application remains responsible for its existing legacy markup as before.

If stored content has been migrated to v3 semantic markup, do not assume an older plugin understands it. Preserve a backup or reversible migration record before committing bulk conversions.

## Release verification checklist

Before publishing or promoting a v3 package, verify:

- strict typecheck/tests/build are green;
- root package exports and declarations match the files in the npm tarball;
- ESM and CommonJS entrypoints work where advertised;
- browser script artifacts register through Summernote's actual lifecycle;
- standalone and composed browser matrices are green;
- persisted HTML round-trip and undo/change/focus checks are green;
- legacy migration behavior is tested and documented;
- release notes clearly identify v3 as a major persisted-HTML/API change.

The ecosystem roadmap in issue #3 is the source of truth for the current release-gate status.
