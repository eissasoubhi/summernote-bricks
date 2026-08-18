# Summernote Bricks

Summernote Bricks is an **optional composer for standalone Summernote plugins**. It groups compatible “bricks” under one toolbar dropdown while keeping each brick independently installable and usable.

The project is being modernized from the historical v1 implementation. The current v2 development line already composes two standalone bricks:

- [summernote-gallery](https://github.com/eissasoubhi/summernote-gallery) — select server-hosted images and insert them into Summernote.
- [summernote-heading](https://github.com/eissasoubhi/summernote-heading) — create and edit reusable heading blocks.

> **Status:** the v2 code lives on `develop` and is a modernization/pre-release line. The historical `master` branch remains the v1 line until the v2 compatibility and release gates are complete.

## Product model

```text
Summernote
    |
    +-- summernote-gallery   (standalone)
    +-- summernote-heading   (standalone)
    +-- future brick         (standalone)
    |
    `-- summernote-bricks    (optional registry + dropdown composer)
```

A brick must not depend on `summernote-bricks` to work. The aggregator is convenience UX, not the owner of brick behavior.

## Install

```bash
npm install summernote-bricks
```

The current v2 package includes the official Gallery and Heading bricks as dependencies.

Load jQuery, Bootstrap and Summernote first, then load the Bricks browser bundle:

```html
<script src="path/to/jquery.js"></script>
<script src="path/to/bootstrap.js"></script>
<script src="path/to/summernote.js"></script>
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

The configured bricks are registered and rendered inside the Bricks dropdown.

## Register a custom brick

The v2 registry accepts additional **factory functions** through `brickFactories`. A factory can initialize its plugin with whatever constructor arguments it needs, so future/private bricks do **not** require a new `switch` case in Summernote Bricks.

```js
import MySummernotePlugin from './MySummernotePlugin';

$('#summernote').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']]
  ],
  summernoteBricks: {
    subBricks: [
      'summernote-gallery',
      'my-company-brick'
    ],
    brickFactories: {
      'my-company-brick': () => new MySummernotePlugin('myCompanyBrick')
    }
  }
});
```

A factory must return an integration object exposing `getPlugin()` and `createButton()`, matching the surface already used by the official Gallery and Heading module wrappers.

The public brick contract will be formalized further before the stable v2 release. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Development

The current development branch still uses the legacy v2 toolchain (Node 16 + Webpack 4). That is intentionally tracked as a migration item rather than hidden behind compatibility flags.

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

Watch source changes:

```bash
npm run dev
```

## Quality gates

Before a stable v2 release, the ecosystem is expected to have:

- deterministic builds;
- package entrypoint smoke tests;
- unit tests for registry/configuration logic;
- integration tests for Summernote plugin registration and multiple editors;
- browser tests for the supported Summernote/Bootstrap combinations;
- documented package and release compatibility;
- npm package validation before publishing.

The umbrella roadmap is tracked in [issue #3](https://github.com/eissasoubhi/summernote-bricks/issues/3).

## Repository roles

| Repository | Responsibility |
| --- | --- |
| `summernote-bricks` | Registry, composition and shared Bricks dropdown UX |
| `summernote-gallery` | Gallery-specific behavior and public standalone package |
| `summernote-heading` | Heading-specific behavior and public standalone package |
| `snb-components` | Shared lower-level runtime/contracts used by bricks |

Reusable behavior should move down to the shared runtime rather than being copied between Gallery and Heading. Product-specific behavior should stay inside its brick.

## Compatibility

Compatibility is being made explicit as part of the modernization work. Do not infer support only from Bootstrap/Summernote upstream support: the Bricks shared runtime currently contains Bootstrap-specific modal behavior that must be tested and adapted before Bootstrap 5 can be claimed as supported.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Architecture changes should preserve the standalone nature of individual bricks and avoid adding concrete brick behavior to the registry core.

## Releases

See [`RELEASING.md`](RELEASING.md). The target release flow is CI-gated semantic versioning, GitHub Releases and npm publishing with trusted CI identity once the npm packages are configured for it.

## License

MIT — see [`LICENSE`](LICENSE).
