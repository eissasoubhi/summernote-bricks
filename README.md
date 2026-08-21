# Summernote Bricks

Summernote Bricks adds one toolbar dropdown that groups buttons from other Summernote plugins.

It is a **composer**, not a replacement for Summernote and not the runtime owner of Heading, Gallery, or third-party plugins.

## Status

The current source line is `3.0.0-rc.0` on `master`.

Supported host versions:

- Summernote `>=0.9.1 <0.10`
- jQuery `>=3.6.0 <4`
- Summernote BS3, BS4, BS5, and Lite builds
- Chromium, Firefox, and WebKit in the maintained browser matrix

## Quick start

Load jQuery and Summernote first, then the standalone plugins you want to group, then Summernote Bricks.

```html
<script src="jquery.js"></script>
<script src="summernote.js"></script>
<script src="summernote-heading/dist/index.umd.cjs"></script>
<script src="summernote-gallery/dist/index.umd.cjs"></script>
<script src="summernote-bricks/dist/summernote-bricks.umd.cjs"></script>
```

Configure the toolbar normally:

```js
$('#editor').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']],
  ],
  summernoteBricks: {
    subBricks: [
      'summernote-heading',
      'summernote-gallery',
    ],
  },
});
```

The built-in aliases resolve to the normal Summernote button names:

- `summernote-heading` → `summernoteHeading`
- `summernote-gallery` → `summernoteGallery`

## Use a custom plugin

Any plugin that registers a normal Summernote button can be composed directly:

```js
$('#editor').summernote({
  toolbar: [['extensions', ['summernoteBricks']]],
  summernoteBricks: {
    subBricks: ['myCompanyButton'],
  },
});
```

Or define a friendly alias:

```js
summernoteBricks: {
  subBricks: ['my-company-plugin'],
  brickAliases: {
    'my-company-plugin': 'myCompanyButton',
  },
}
```

If a configured child button is missing, Bricks fails with a clear configuration error instead of silently hiding it.

## Install from npm

When the v3 release candidate is available on npm:

```bash
npm install jquery summernote summernote-bricks@next
```

Heading and Gallery are separate packages. Install only the plugins your application uses.

## Development

```bash
npm ci
npm run check
```

The V3 source, tests, and build configuration now live directly at the repository root:

```text
src/
test/
browser-tests/
scripts/
docs/
package.json
tsconfig.json
vite.config.ts
vitest.config.ts
```

## Documentation

- [Getting started](docs/GETTING_STARTED.md) — installation, load order, configuration, and troubleshooting
- [V3 upgrade guide](docs/V3_UPGRADE.md) — moving an existing application to V3
- [Architecture](docs/ARCHITECTURE.md) — package boundaries and design rules
- [Contributing](CONTRIBUTING.md) — local development and pull-request expectations
- [Releasing](RELEASING.md) — release gates and publication process

## Ecosystem

- `summernote-heading` — standalone Heading plugin
- `summernote-gallery` — standalone Gallery plugin
- `summernote-bricks` — optional composer for registered buttons
- `SNB-components` — independent optional shared-core project; not required by Bricks, Heading, or Gallery today

## License

MIT
