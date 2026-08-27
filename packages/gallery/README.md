# summernote-gallery (staged monorepo package)

This directory is the incremental monorepo migration home for the standalone `summernote-gallery` package.

The package remains **private** during migration. The public standalone repository and npm package remain authoritative for publication until behavioral, build, declaration, entrypoint, tarball and clean-consumer equivalence are proven.

The first staged slice contains only the framework-independent Gallery content contract: normalization, semantic v3 render/parse behavior, and explicit legacy migration. jQuery/Summernote runtime behavior and source-loading logic remain in the standalone repository until later bounded slices are proven.

Feature-specific Gallery behavior stays here and must not move into the private SNB Core.
