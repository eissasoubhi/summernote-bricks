# Summernote Bricks architecture

## The simple model

Summernote Bricks groups buttons that other Summernote plugins already registered.

```text
summernote-heading ----\
                       >---- Summernote Bricks dropdown
summernote-gallery ----/
third-party button ----/
```

Bricks does not instantiate those plugins and does not own their data or lifecycle.

## Package responsibilities

### `summernote-bricks`

Owns:

- the `summernoteBricks` toolbar button;
- the dropdown that contains child buttons;
- aliases from friendly plugin names to Summernote button names;
- composition-level tests and examples.

Does not own:

- Heading or Gallery rendering;
- Gallery data sources;
- persisted content for child plugins;
- server APIs;
- Bootstrap modal behavior for child plugins.

### `summernote-heading`

Standalone plugin that registers `summernoteHeading`.

### `summernote-gallery`

Standalone plugin that registers `summernoteGallery`.

### `SNB-components`

Independent optional shared-core project. Heading, Gallery, and Bricks do not currently depend on it.

## Composition contract

Summernote exposes button factories through `context.memo`:

```text
context.memo('button.somePlugin', factory)
context.memo('button.somePlugin') -> factory
```

Bricks uses that existing contract.

`BrickRegistry` only maps aliases:

```text
summernote-heading -> summernoteHeading
summernote-gallery -> summernoteGallery
```

Unknown names are treated as direct Summernote button names. This lets third-party plugins work without changes to Bricks.

## Lifecycle

The browser bundle registers `summernoteBricks` in `$.summernote.plugins` when Summernote is available.

It deliberately waits until Summernote constructs the plugin before accessing `$.summernote.ui`. This matches the Summernote 0.9.x lifecycle and avoids replacing or decorating `$.fn.summernote`.

## Dependency direction

Allowed:

```text
Bricks -> Summernote public plugin/button contract
Heading -> Summernote public plugin contract
Gallery -> Summernote public plugin contract
```

Avoid:

```text
Bricks -> Heading internals
Bricks -> Gallery internals
Heading -> Gallery
Gallery -> Heading
```

## Compatibility

The maintained reference platform is Summernote 0.9.1 with jQuery 3.6+.

Browser CI validates Summernote BS3, BS4, BS5, and Lite builds across Chromium, Firefox, and WebKit, including standalone plugins and Bricks composition.

## Repository structure

V3 is the normal repository structure; there is no parallel V2/V3 source tree:

```text
src/                 TypeScript runtime source
test/                Vitest tests
browser-tests/        Playwright compatibility suite
dist/                built package artifacts
scripts/              package/release validators
docs/                 user and maintainer documentation
package.json           public package manifest
tsconfig.json          TypeScript configuration
vite.config.ts         JavaScript bundle configuration
vitest.config.ts       unit-test configuration
```

Historical implementations remain available through Git history and tags rather than a duplicate source tree on `master`.

## Change rules

Treat these as public contracts:

- package entrypoints;
- Summernote option names;
- documented aliases/button names;
- supported host dependency ranges;
- persisted HTML owned by standalone child plugins.

A refactor is safe when those contracts stay compatible and the unit, package, and browser gates remain green.
