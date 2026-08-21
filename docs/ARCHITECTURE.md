# Architecture

## The short version

The ecosystem has three public plugins with separate responsibilities:

```text
summernote-heading  ----\
                         > standard Summernote button API -> summernote-bricks
summernote-gallery  ----/
```

`summernote-heading` and `summernote-gallery` work independently. `summernote-bricks` is only a composer that groups buttons already registered with Summernote.

`SNB-components` is an independent optional project. The three coordinated v3 packages do not depend on it today.

## Package responsibilities

### summernote-bricks

Owns:

- the Bricks dropdown/button UX;
- aliases from friendly names to Summernote button names;
- composition of registered button memos;
- cross-repository browser/release validation.

Does not own Heading/Gallery data, rendering, persistence or lifecycle.

### summernote-heading

Owns Heading-specific creation, editing, semantic HTML and migration helpers. It registers `summernoteHeading`.

### summernote-gallery

Owns Gallery-specific data selection, creation, editing, semantic HTML and migration helpers. It registers `summernoteGallery`.

## Composition contract

Summernote already provides the contract Bricks needs:

```text
context.memo('button.somePlugin', factory)
context.memo('button.somePlugin') -> factory
```

Bricks resolves configured names through `BrickRegistry`, then asks Summernote for the corresponding button memo.

Built-in aliases:

```text
summernote-heading -> summernoteHeading
summernote-gallery -> summernoteGallery
```

Unknown names are treated as direct Summernote button names. This keeps third-party integration simple and avoids a Bricks-specific plugin framework.

## Lifecycle

The plugin registers through `$.summernote.plugins` and does not replace `$.fn.summernote`.

Browser registration may happen before `$.summernote.ui` is available. UI access is therefore deferred until Summernote constructs the plugin during editor initialization.

## Persisted content

Stored editor HTML is a public compatibility contract. Runtime-only state, editor controls and implementation styles must not be persisted into user content.

Legacy migration is explicit and opt-in. Opening an old document must not silently rewrite it.

## Compatibility

The maintained reference is Summernote 0.9.1 with jQuery 3.x. Browser validation covers BS3, BS4, BS5 and Lite on Chromium, Firefox and WebKit.

Concrete Bootstrap requirements come from the Summernote build selected by the host application; Bricks itself does not call Bootstrap modal APIs.

## Repository layout

The v3 project is the root project:

```text
src/             TypeScript source
test/            unit and release-safety tests
dist/            generated package artifacts
browser-tests/   cross-browser integration harness
docs/            user/developer documentation
scripts/         package and release validators
```

The old transitional split between legacy root source and `v3-tooling/` is intentionally removed. Git history remains the source for older implementations.

## Release boundary

A green unit CI run alone is not a release authorization. Coordinated publication requires the exact release-eligible public-master browser bundle and keeps source SHA, tarball digest, npm integrity and clean-consumer verification as hard gates.
