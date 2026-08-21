# Contributing to Summernote Bricks

## Local setup

Use Node 22 or 24.

```bash
npm ci
npm run check
```

`npm run check` runs strict TypeScript checking, Vitest, the Vite/declaration build, and package validation.

## Repository layout

```text
src/            runtime TypeScript
test/           unit and release-validator tests
browser-tests/  Playwright compatibility tests
dist/           generated package artifacts
scripts/        package and release validators
docs/           documentation
```

There is no separate V3 tooling source tree. `src/` and `test/` are the current V3 implementation.

## Design rules

- Keep Heading and Gallery usable without Bricks.
- Compose standard Summernote buttons instead of importing child-plugin internals.
- Keep `SNB-components` optional unless a future change demonstrates a real shared-runtime need.
- Preserve documented package entrypoints, configuration names, and host dependency ranges unless the change is intentionally breaking.
- Keep persisted-content migrations explicit and controlled by the application.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing package boundaries or plugin lifecycle behavior.

## Tests

For runtime or configuration changes, add/update Vitest coverage.

For browser lifecycle, Summernote compatibility, packaging, or cross-plugin composition changes, the maintained Playwright matrix must stay green.

## Pull requests

Keep a PR focused on one coherent change. Synchronize it with the current target branch before merge and require the relevant CI/browser checks to be green.

## Documentation

Update documentation in the same PR when behavior, configuration, compatibility, installation, or repository structure changes.

Prefer a short working example before a long explanation.

## Releases

Release rules and publication gates live in [RELEASING.md](RELEASING.md) and [docs/V3_RELEASE_CHECKLIST.md](docs/V3_RELEASE_CHECKLIST.md).

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
