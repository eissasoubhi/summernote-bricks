# SNB Core

Private migration-stage shared infrastructure for the Summernote Bricks ecosystem.

The core is intentionally small. It may own only contracts and helpers that are genuinely shared by Bricks and standalone plugins, such as plugin lifecycle/context types, a plugin registry, Summernote 0.9.x compatibility adapters, and common UI/DOM/configuration helpers when duplication is proven.

It must not contain Heading, Gallery, persisted-content, or other feature logic.

This package is currently `private` and is not part of the release train. Making it publishable requires a separate reviewed decision, package/reproducibility gates, and consumer evidence.
