# summernote-heading (staged monorepo package)

This directory is the staged future home of the standalone `summernote-heading` package inside the `summernote-bricks` monorepo.

## Current migration boundary

Only the framework-agnostic Heading content contract is migrated in this phase:

- semantic v3 heading markup
- normalization/parsing/rendering
- explicit legacy-markup migration
- the matching regression tests

The Summernote/jQuery plugin adapter, build, packaging, publication, and release ownership remain in the public `eissasoubhi/summernote-heading` repository until a later cutover PR proves equivalent browser and package behavior.

The package is intentionally `private` during this staged phase so the monorepo cannot accidentally publish a partial Heading implementation.

Imported baseline: `summernote-heading` public `main`, source files from the `3.0.0-rc.1` line. The standalone npm package remains supported and its public history is preserved.
