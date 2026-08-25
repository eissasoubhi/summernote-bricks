# Summernote Bricks

Summernote Bricks is a small Summernote plugin that groups buttons from other Summernote plugins into one dropdown.

**Bricks does not contain Heading, Gallery, or any other child plugin.** Those plugins are standalone projects. Install only the ones you need, then use Bricks when you want to group their buttons together.

## The idea in 10 seconds

```text
summernote-heading ─┐
summernote-gallery ─┼──> Summernote Bricks dropdown
another plugin ─────┘
```

- Want **Heading only**? Use [`summernote-heading`](https://github.com/eissasoubhi/summernote-heading). You do not need Bricks.
- Want **Gallery only**? Use [`summernote-gallery`](https://github.com/eissasoubhi/summernote-gallery). You do not need Bricks.
- Want **Heading + Gallery in one clean toolbar menu**? Install both standalone plugins and add Summernote Bricks.
- Have your own Summernote button? Bricks can group it too.

Bricks is therefore a **composer**, not a plugin bundle and not a replacement for Summernote.

## Quick start

### 1. Install what you need

Example with Heading + Gallery + Bricks:

```bash
npm install jquery bootstrap summernote summernote-heading@next summernote-gallery@next summernote-bricks@next
```

If you do not use Heading or Gallery, simply leave that package out.

### 2. Load the plugins before Bricks

For a classic browser setup, the load order is intentionally simple:

```html
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="node_modules/summernote/dist/summernote-bs5.min.css">

<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="node_modules/summernote/dist/summernote-bs5.min.js"></script>

<script src="node_modules/summernote-heading/dist/summernote-heading.browser.js"></script>
<script src="node_modules/summernote-gallery/dist/summernote-gallery.browser.js"></script>
<script src="node_modules/summernote-bricks/dist/summernote-bricks.browser.js"></script>
```

The `*.browser.js` files are the human-friendly browser entrypoints. The package can still contain ESM/CommonJS artifacts for build tools, but you do not need to understand those formats to use the plugin in a normal page.

### 3. Put Bricks in the toolbar

```html
<div id="editor"></div>

<script>
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
</script>
```

That is the complete relationship: Heading and Gallery register their own Summernote buttons first; Bricks then places those existing buttons inside its dropdown.

See the [complete installation example](docs/COMPLETE_EXAMPLE.md) for a copy-paste HTML page and the [getting started guide](docs/GETTING_STARTED.md) for more options.

## Use Bricks with another plugin

Bricks is not limited to this repository family. Any plugin that registers a normal Summernote button can be composed.

If another plugin registers:

```js
context.memo('button.myCompanyButton', () => /* button */);
```

then use:

```js
$('#editor').summernote({
  toolbar: [['extensions', ['summernoteBricks']]],
  summernoteBricks: {
    subBricks: ['myCompanyButton'],
  },
});
```

Or give it a friendly alias:

```js
summernoteBricks: {
  subBricks: ['my-company-plugin'],
  brickAliases: {
    'my-company-plugin': 'myCompanyButton',
  },
}
```

If a configured child button is missing, Bricks fails with a clear configuration error instead of silently hiding the problem.

## Ecosystem

| Project | What it does | Needs Bricks? |
| --- | --- | --- |
| [`summernote-heading`](https://github.com/eissasoubhi/summernote-heading) | Adds semantic heading blocks to Summernote | No |
| [`summernote-gallery`](https://github.com/eissasoubhi/summernote-gallery) | Adds gallery editing to Summernote | No |
| [`summernote-bricks`](https://github.com/eissasoubhi/summernote-bricks) | Groups registered Summernote buttons in one dropdown | — |
| [`SNB-components`](https://github.com/eissasoubhi/SNB-components) | Optional shared-components project | No |

The standalone-plugin rule is deliberate: each plugin remains useful on its own, applications install only what they need, and Bricks stays small and generic.

## Compatibility

Current package version: `3.0.0-rc.2`.

Supported hosts:

- Summernote `>=0.9.1 <0.10`
- jQuery `>=3.6.0 <4`
- Summernote BS3, BS4, BS5, and Lite builds
- Chromium, Firefox, and WebKit in the maintained browser matrix

## Development

```bash
npm ci
npm run check
```

V3 source, tests, and build configuration live directly at the repository root:

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

- [Complete example](docs/COMPLETE_EXAMPLE.md) — a full Heading + Gallery + Bricks page
- [Getting started](docs/GETTING_STARTED.md) — installation, load order, configuration, and troubleshooting
- [V3 upgrade guide](docs/V3_UPGRADE.md) — moving an existing application to V3
- [Architecture](docs/ARCHITECTURE.md) — package boundaries and design rules
- [Contributing](CONTRIBUTING.md) — local development and pull-request expectations
- [Releasing](RELEASING.md) — release gates and publication process

## License

MIT
