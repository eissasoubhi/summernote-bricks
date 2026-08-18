# Summernote Bricks architecture

## Goals

Summernote Bricks is an ecosystem, not a single monolithic editor plugin. The architecture should make it cheap to add a new brick while keeping each brick independently useful.

The design optimizes for four properties:

1. **Standalone bricks** — Gallery, Heading and future bricks can be installed without the aggregator.
2. **Small public contracts** — the aggregator depends on a brick integration contract, not brick internals.
3. **Shared infrastructure without duplication** — reusable modal/editor/validation behavior belongs in the shared runtime.
4. **Explicit compatibility** — Summernote, Bootstrap, jQuery and browser compatibility is tested rather than assumed.

## Package boundaries

### `summernote-bricks`

Owns:

- the Bricks toolbar/dropdown UX;
- the registry of named brick factories;
- composition of configured bricks;
- ecosystem-level examples and compatibility tests.

Must not own:

- Gallery data loading;
- Heading rendering;
- brick-specific modal forms;
- server APIs;
- generic modal/validation/editor abstractions that can be shared.

### `summernote-gallery`

Owns Gallery-specific source loading, selection UX, image data and Gallery templates.

### `summernote-heading`

Owns Heading-specific form data, templates and editing behavior.

### `snb-components`

Contains shared lower-level runtime concepts such as editor helpers, editable brick behavior, modal abstractions, validation, messaging and extension contracts.

Because this package is shared by public bricks, changes to its effective public API must be treated as ecosystem changes even while its repository remains private.

## Brick registry

`BrickRegistry` is deliberately small:

```text
register(name, factory)
resolve(name)
create(name)
has(name)
names()
```

Factories are used instead of raw constructors because different standalone plugins can require different initialization arguments. The official registrations currently initialize Gallery as `summernoteGallery` and Heading as `summernoteHeading`.

The registry knows **nothing** about Gallery or Heading behavior. Official bricks are only default registrations.

Consumers can add a custom factory through the `summernoteBricks.brickFactories` option and reference it from `subBricks`.

A factory must return the integration surface currently consumed by the aggregator:

```ts
interface SummernoteBrickIntegration {
  getPlugin(): object;
  createButton(): unknown;
}
```

This is intentionally a small transitional contract. A later major release may formalize a richer descriptor once browser/integration tests exist for Gallery and Heading. Avoid prematurely publishing a large framework API.

## Initialization lifecycle

The historical v1 plugin initialized global Summernote UI state too early. The current v2 aggregator works around plugin registration timing by decorating `$.fn.summernote` before the editor starts.

That decorator is a **known transitional implementation detail**, not the desired long-term public architecture.

Before removing it, tests must prove that:

- sub-plugins are available before toolbar memoization;
- multiple editors on the same page are isolated correctly;
- destroying and recreating an editor does not leak plugin state;
- custom bricks are registered deterministically;
- standalone Gallery/Heading behavior is unchanged.

The preferred end state is normal Summernote plugin registration without globally replacing `$.fn.summernote`, if Summernote's lifecycle permits it.

## Bootstrap compatibility

Do not equate Summernote's Bootstrap support with Bricks support.

The shared runtime currently calls the jQuery Bootstrap modal API (`$modal.modal(...)`). Bootstrap 5 removed the jQuery plugin API, so Bootstrap 5 support requires a modal adapter or a shared runtime refactor.

Recommended abstraction:

```text
ModalController
  open(element)
  close(element)
  onHidden(element, callback)
```

Adapters can then implement Bootstrap 3/4 jQuery behavior and Bootstrap 5 native behavior separately. Gallery and Heading should not each implement this compatibility logic.

## Dependency direction

Allowed:

```text
summernote-gallery  ---> snb-components
summernote-heading  ---> snb-components
summernote-bricks   ---> gallery / heading public integration surfaces
```

Avoid:

```text
gallery ---> heading
heading ---> gallery
snb-components ---> concrete bricks
```

## Repository strategy

Keep the public packages in separate repositories for now. They already have independent users, history and release versions. Standardize CI, contribution rules and release conventions across them instead of forcing a monorepo migration immediately.

Re-evaluate a monorepo only if most future changes consistently require synchronized commits/releases across all packages.

## Release compatibility

Breaking changes to any of these require a major version:

- brick factory/public integration contract;
- Summernote option names or data shapes;
- generated/persisted brick HTML that consumers may store;
- package entrypoints;
- supported host dependency ranges when existing users are dropped.

Internal refactors that preserve those contracts can remain minor/patch releases according to semantic versioning.
