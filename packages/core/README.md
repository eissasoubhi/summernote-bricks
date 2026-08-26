# SNB Core

Private migration-stage shared infrastructure for the Summernote Bricks ecosystem.

The core is intentionally small. It may own only contracts and helpers that are genuinely shared by Bricks and standalone plugins, such as plugin lifecycle/context types, a plugin registry, Summernote 0.9.x compatibility adapters, and common UI/DOM/configuration helpers when duplication is proven.

It must not contain Heading, Gallery, persisted-content, or other feature logic.

## Relationship to `SNB-components`

`SNB-components` already contains tested Summernote context/UI/history and brick primitives. Core must not independently reimplement those helpers. During migration, a primitive may move from `SNB-components` into this package only when at least two maintained packages genuinely need it, with its tests and behavioral contract preserved. Until that happens, `SNB-components` remains authoritative for its existing code and stays independently releasable.

The plugin registry in this package is a new composition contract for the future Bricks aggregator; it does not replace or duplicate an existing `SNB-components` runtime primitive.

This package is currently `private` and is not part of the release train. Making it publishable requires a separate reviewed decision, package/reproducibility gates, and consumer evidence.
