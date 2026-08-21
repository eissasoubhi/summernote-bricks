# Summernote Bricks

Summernote Bricks adds one optional dropdown to Summernote and groups buttons from standalone plugins such as Heading and Gallery.

It does **not** own those plugins. Each brick still works by itself.

## Status

The v3 source line is `3.0.0-rc.0` and targets Summernote 0.9.1 with jQuery 3.x.

The maintained browser matrix covers Bootstrap 3, Bootstrap 4, Bootstrap 5 and Summernote Lite on Chromium, Firefox and WebKit.

## Install

For the current prerelease line:

```sh
npm install jquery summernote summernote-heading@next summernote-gallery@next summernote-bricks@next
```

Install only the standalone plugins you actually use. `summernote-bricks` is optional.

## Browser/script-tag usage

Load scripts in this order:

1. jQuery
2. Summernote
3. standalone plugins such as Heading and Gallery
4. Summernote Bricks
5. initialize the editor

```html
<script src="jquery.js"></script>
<script src="summernote.js"></script>
<script src="summernote-heading.umd.cjs"></script>
<script src="summernote-gallery.umd.cjs"></script>
<script src="summernote-bricks.umd.cjs"></script>
```

Then configure the normal Summernote toolbar:

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

The built-in aliases are:

```text
summernote-heading -> summernoteHeading
summernote-gallery -> summernoteGallery
```

A third-party Summernote button can be used directly:

```js
summernoteBricks: {
  subBricks: ['myCompanyButton'],
}
```

Or with an alias:

```js
summernoteBricks: {
  subBricks: ['my-company-brick'],
  brickAliases: {
    'my-company-brick': 'myCompanyButton',
  },
}
```

## Compatibility

| Host | Supported |
| --- | --- |
| Summernote | `>=0.9.1 <0.10` |
| jQuery | `>=3.6.0 <4` |
| Summernote interfaces | BS3, BS4, BS5, Lite |
| Browsers | Chromium, Firefox, WebKit |

## Development

```sh
npm ci
npm run check
```

The v3 TypeScript source now lives in the normal root structure:

```text
src/
test/
dist/
browser-tests/
docs/
scripts/
package.json
tsconfig.json
vite.config.ts
vitest.config.ts
```

There is no separate v3 project inside the repository.

## Documentation

- [Upgrade from older versions](docs/V3_UPGRADE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Release checklist](docs/V3_RELEASE_CHECKLIST.md)
- [Release process](RELEASING.md)
- [Contributing](CONTRIBUTING.md)

## Important design rule

Heading and Gallery are standalone Summernote plugins. Bricks only composes buttons that are already registered with Summernote.

`SNB-components` remains independent and is not required by Bricks, Heading or Gallery.

## License

MIT
