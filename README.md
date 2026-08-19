# Summernote Bricks

Summernote Bricks is an **optional composer for registered Summernote plugin buttons**. It groups compatible standalone plugins under one toolbar dropdown without owning their runtime or persisted content.

## v3 status

The `develop` branch contains the consolidated **3.0.0 release-candidate source line**. The historical `master` branch remains the published legacy line until the v3 promotion gates are complete.

**No v3 npm package or GitHub Release has been published yet.** Do not assume that `npm install summernote-bricks@3` is available until a release is explicitly approved.

The maintained v3 reference platform is **Summernote 0.9.1**. Browser integration is validated across:

- Summernote BS3, BS4, BS5 and Lite builds;
- Chromium, Firefox and WebKit;
- standalone Heading and Gallery usage;
- Bricks + Heading + Gallery composition;
- multiple editors, create/edit, undo, focus/accessibility, destroy/recreate and semantic HTML round-trips.

## Ecosystem model

```text
                   standard Summernote plugin API
                            |
            +---------------+---------------+
            |                               |
  summernote-gallery                 summernote-heading
  registers button                   registers button
  summernoteGallery                  summernoteHeading
            |                               |
            +---------------+---------------+
                            |
                     summernote-bricks
                   groups existing buttons
```

A brick must work without `summernote-bricks`. Bricks is convenience UX, not the runtime owner of Gallery, Heading or future plugins.

`SNB-components` is an independent optional shared-core project. Heading and Gallery do not currently depend on it, and v3 does not add that coupling without demonstrated shared runtime value.

## Host dependencies

The v3 package contract declares jQuery and Summernote as host peer dependencies:

```json
{
  "jquery": ">=3.6.0 <4",
  "summernote": ">=0.9.1 <0.10"
}
```

Concrete Bootstrap requirements come from the Summernote build you choose. Bricks itself does not call Bootstrap modal APIs directly.

## Browser usage

Load jQuery, the matching Summernote build, each standalone plugin bundle, and then Bricks **before initializing the editor**.

The v3 release-candidate build outputs are:

```text
summernote-heading/dist/index.umd.cjs
summernote-gallery/dist/index.umd.cjs
summernote-bricks/dist/summernote-bricks.umd.cjs
```

Example once those packages are available from your chosen source:

```html
<script src="path/to/jquery.js"></script>
<script src="path/to/summernote.js"></script>
<script src="path/to/summernote-heading/dist/index.umd.cjs"></script>
<script src="path/to/summernote-gallery/dist/index.umd.cjs"></script>
<script src="path/to/summernote-bricks/dist/summernote-bricks.umd.cjs"></script>
```

Then configure the normal Summernote toolbar:

```js
$('#summernote').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']]
  ],
  summernoteBricks: {
    buttonLabel: '<i class="fa fa-puzzle-piece"></i> Bricks',
    subBricks: [
      'summernote-gallery',
      'summernote-heading'
    ]
  }
});
```

The package-style aliases resolve to the standard Summernote button memo names `summernoteGallery` and `summernoteHeading`.

## Custom bricks

Bricks does not need to import or instantiate a custom plugin. If your plugin registers a normal Summernote button memo, list that button name directly:

```js
// Your plugin registers: context.memo('button.myCompanyBrick', ...)

$('#summernote').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']]
  ],
  summernoteBricks: {
    subBricks: ['summernoteGallery', 'myCompanyBrick']
  }
});
```

You can also provide a stable alias without changing Bricks core:

```js
summernoteBricks: {
  subBricks: ['my-company-brick'],
  brickAliases: {
    'my-company-brick': 'myCompanyBrick'
  }
}
```

This deliberately reuses Summernote's plugin/memo contract instead of publishing a second framework-specific constructor API.

## Persisted content

The v3 ecosystem keeps editor implementation details out of saved content. Heading and Gallery persist semantic HTML marked with `data-snb-brick` and `data-snb-version`; editor controls and implementation `<style>` blocks are not persisted.

Legacy content conversion is explicit and opt-in. See [`docs/V3_UPGRADE.md`](docs/V3_UPGRADE.md) before migrating existing installations.

## Development

The consolidated Bricks v3 root uses strict TypeScript, Vite and Vitest on current Node LTS lines.

```bash
npm ci
npm run check
```

`npm run check` performs typechecking, unit tests, the Vite/TypeScript build and package-shape validation.

The maintained browser harness lives in `browser-tests/` and exercises the real packed Bricks, Heading and Gallery artifacts across the supported Summernote/browser matrix in GitHub Actions.

## Architecture and release gates

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — package boundaries and Summernote-native architecture.
- [`docs/PRODUCT_ROADMAP.md`](docs/PRODUCT_ROADMAP.md) — product direction.
- [`docs/V3_UPGRADE.md`](docs/V3_UPGRADE.md) — installation, legacy migration and rollback guidance.
- [`RELEASING.md`](RELEASING.md) — release process.
- [Issue #3](https://github.com/eissasoubhi/summernote-bricks/issues/3) — authoritative ecosystem roadmap and current promotion gates.

A public v3 release requires green deterministic package validation, the full maintained browser matrix, documented migration/rollback, and explicit release approval. Source consolidation does **not** publish npm packages or GitHub Releases automatically.

## Repository roles

| Repository | Responsibility |
| --- | --- |
| `summernote-bricks` | Optional composition/dropdown UX for registered Summernote plugin buttons |
| `summernote-gallery` | Standalone backend-agnostic Gallery plugin |
| `summernote-heading` | Standalone semantic Heading plugin |
| `SNB-components` | Independent optional shared core |

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Future bricks should use standard Summernote plugin registration instead of adding concrete dependencies to Bricks core.

## Security

See [`SECURITY.md`](SECURITY.md).

## License

MIT — see [`LICENSE`](LICENSE).
