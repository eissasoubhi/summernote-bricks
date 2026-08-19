# Summernote Bricks

Summernote Bricks is an **optional composer for standalone Summernote plugins**. It groups compatible plugin buttons under one toolbar dropdown without owning or instantiating the plugins themselves.

The current v2 development line is designed around two official standalone bricks:

- [summernote-gallery](https://github.com/eissasoubhi/summernote-gallery) — select server-hosted images and insert them into Summernote.
- [summernote-heading](https://github.com/eissasoubhi/summernote-heading) — create and edit reusable heading blocks.

> **Status:** v2 lives on `develop` and is a modernization/pre-release line. The historical `master` branch remains the v1 line until the compatibility and release gates are complete.

## Product model

```text
                  standard Summernote plugin API
                           |
           +---------------+---------------+
           |                               |
 summernote-gallery                summernote-heading
   registers button                  registers button
 `summernoteGallery`               `summernoteHeading`
           |                               |
           +---------------+---------------+
                           |
                    summernote-bricks
                  groups existing buttons
```

A brick must work without `summernote-bricks`. Bricks is convenience UX, not the runtime owner of Gallery, Heading or future plugins.

## Install

```bash
npm install summernote-bricks summernote-gallery summernote-heading
```

Load jQuery, your supported Bootstrap/Summernote build, the standalone brick bundles and then the Bricks bundle **before initializing the editor**:

```html
<script src="path/to/jquery.js"></script>
<script src="path/to/bootstrap.js"></script>
<script src="path/to/summernote.js"></script>

<script src="node_modules/summernote-gallery/dist/snb-gallery-brick.min.js"></script>
<script src="node_modules/summernote-heading/dist/summernote-heading.min.js"></script>
<script src="node_modules/summernote-bricks/dist/summernote-extensions.min.js"></script>
```

## Configure the toolbar

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

The two package-style names above are convenience aliases for the standard Summernote button memo names `summernoteGallery` and `summernoteHeading`.

## Add a future/custom brick

Summernote Bricks does not need to import or instantiate a custom plugin. If your plugin registers a normal Summernote button memo, list that button name directly:

```js
// My plugin registers: context.memo('button.myCompanyBrick', ...)

$('#summernote').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']]
  ],
  summernoteBricks: {
    subBricks: [
      'summernoteGallery',
      'myCompanyBrick'
    ]
  }
});
```

If you prefer a stable product/package alias, configure it without changing Bricks core:

```js
summernoteBricks: {
  subBricks: ['my-company-brick'],
  brickAliases: {
    'my-company-brick': 'myCompanyBrick'
  }
}
```

This deliberately reuses Summernote's own plugin/memo contract instead of publishing a second framework-specific brick constructor API.

## Why this architecture

The earlier v2 prototype imported internal files from Gallery/Heading and monkey-patched `$.fn.summernote` so it could instantiate those plugins before Summernote started. That created three problems:

1. deep imports broke when npm package contents changed;
2. Bricks had to know every concrete plugin;
3. global Summernote initialization became order-sensitive and hard to test.

The current design registers Bricks through the normal `$.summernote.plugins` extension point and reads already-registered button memos from the Summernote context when its dropdown is rendered.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the architectural boundaries and compatibility plan.

## Development

The current `develop` branch still uses the legacy v2 toolchain (Node 16 + Webpack 4). That migration is intentionally isolated from the architecture work so failures are attributable and reviewable.

```bash
npm ci
npm run build
npm test
npm pack --dry-run
```

Run the demo locally:

```bash
npm run start
```

Watch changes:

```bash
npm run dev
```

## Quality gates before stable v2

- modern Node LTS + build toolchain;
- unit tests for aliases/button resolution;
- integration tests for normal Summernote plugin registration;
- multiple-editor and destroy/recreate tests;
- browser tests for every supported Summernote/Bootstrap combination;
- public package entrypoints for official bricks;
- no deep imports between packages;
- documented v1 migration;
- packed-tarball release-candidate validation.

The umbrella roadmap is tracked in [issue #3](https://github.com/eissasoubhi/summernote-bricks/issues/3).

## Repository roles

| Repository | Responsibility |
| --- | --- |
| `summernote-bricks` | Optional composition/dropdown UX for registered Summernote plugin buttons |
| `summernote-gallery` | Gallery-specific behavior and standalone public package |
| `summernote-heading` | Heading-specific behavior and standalone public package |
| `snb-components` | Shared lower-level editor/modal/validation/extension runtime |

## Compatibility

Do not infer Bricks compatibility only from upstream Summernote support. The shared SNB runtime currently contains Bootstrap jQuery-modal assumptions, so Bootstrap 5 needs an explicit adapter/refactor and browser tests before the ecosystem can claim it as supported.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Future bricks should use standard Summernote plugin registration instead of adding concrete dependencies to Bricks core.

## Releases

See [`RELEASING.md`](RELEASING.md). The target flow is CI-gated semantic versioning, GitHub Releases and npm trusted publishing once package-side trusted publishers are configured.

## License

MIT — see [`LICENSE`](LICENSE).
