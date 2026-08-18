# Contributing to Summernote Bricks

Summernote Bricks is the optional aggregator for the Summernote Bricks ecosystem. Changes should keep individual bricks usable on their own.

## Development setup

The current `develop` branch still uses its legacy v2 toolchain (Node 16 + Webpack 4). The toolchain upgrade is intentionally tracked separately so architecture and behavior changes can be reviewed independently.

```bash
npm ci
npm run build
npm test
npm pack --dry-run
```

Run the demo with `npm run start` and watch source changes with `npm run dev`.

## Architecture rules

- The registry core must not contain brick-specific behavior.
- A new third-party brick should be registerable without editing `BrickRegistry`.
- Gallery and Heading must remain standalone packages.
- Shared reusable runtime behavior belongs in `snb-components`.
- Do not remove the current Summernote initialization decorator until integration tests prove an alternative lifecycle works for multiple editor instances.

See `docs/ARCHITECTURE.md` before making cross-package changes.

## Tests

Add unit tests for pure registry/configuration logic. Browser-facing lifecycle changes require integration tests covering multiple editors and plugin initialization before they can be released.

## Pull requests

Keep changes focused. Describe compatibility impact explicitly, especially when changing package entrypoints, options, persisted HTML, Summernote/Bootstrap support, or the brick integration contract.

## Security

Do not publish exploitable details in public issues. See `SECURITY.md`.
