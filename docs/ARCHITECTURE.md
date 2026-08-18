# Summernote Bricks architecture

## Goals

Summernote Bricks is an ecosystem, not a monolithic editor plugin. The architecture should make it cheap to add a new brick while keeping every brick independently useful.

The design optimizes for four properties:

1. **Standalone bricks** — Gallery, Heading and future plugins work without the aggregator.
2. **Use upstream contracts first** — Bricks composes standard Summernote button memos rather than inventing a parallel constructor framework.
3. **Shared infrastructure without duplication** — reusable modal/editor/validation behavior belongs in the shared runtime.
4. **Explicit compatibility** — Summernote, Bootstrap, jQuery and browser compatibility is tested rather than assumed.

## Package boundaries

### `summernote-bricks`

Owns:

- the Bricks toolbar/dropdown UX;
- optional aliases from product/package names to Summernote button names;
- composition of already-registered Summernote plugin buttons;
- ecosystem-level examples and compatibility tests.

Must not own:

- Gallery/Heading instantiation;
- Gallery data loading;
- Heading rendering;
- brick-specific modal forms;
- server APIs;
- generic modal/validation/editor abstractions that can be shared.

### `summernote-gallery`

Owns Gallery-specific source loading, selection UX, image data and Gallery templates. It registers its own `summernoteGallery` button with Summernote.

### `summernote-heading`

Owns Heading-specific form data, templates and editing behavior. It registers its own `summernoteHeading` button with Summernote.

### `snb-components`

Contains shared lower-level runtime concepts such as editor helpers, editable brick behavior, modal abstractions, validation, messaging and extensions.

Because public bricks rely on it, changes to its effective public API are ecosystem changes even while its repository remains private.

## Composition contract

Summernote already exposes a memo mechanism:

```text
context.memo('button.somePlugin', factory)
context.memo('button.somePlugin') -> factory
```

Bricks builds on that contract.

`BrickRegistry` is only an alias map:

```text
register(alias, summernoteButtonName)
resolve(aliasOrButtonName)
has(alias)
names()
```

Official convenience aliases are:

```text
summernote-gallery -> summernoteGallery
summernote-heading -> summernoteHeading
```

An unrecognized name is treated as a direct Summernote button name. Therefore a third-party plugin does not need a Bricks-specific class, interface or release in this repository.

Consumers can also define aliases with `summernoteBricks.brickAliases`.

## Initialization lifecycle

The historical v1 plugin initialized global Summernote UI state too early. The earlier v2 prototype worked around timing by replacing `$.fn.summernote` and injecting concrete sub-plugins before delegating to Summernote.

The current architecture removes that decorator. Bricks is registered through the normal Summernote plugin registry and memoizes only its own toolbar button. The Bricks button factory resolves the configured child-button memos when Summernote renders the toolbar.

This keeps lifecycle ownership with Summernote and removes deep imports/concrete plugin construction from the aggregator.

Integration tests must still prove:

- all plugin modules are registered before editor initialization;
- child button memos can be resolved when Bricks renders;
- multiple editors on the same page are isolated correctly;
- destroying and recreating an editor does not leak state;
- custom direct button names and aliases work;
- standalone Gallery/Heading behavior remains unchanged.

## Bootstrap compatibility

Do not equate Summernote's Bootstrap support with Bricks ecosystem support.

The shared runtime currently calls the jQuery Bootstrap modal API (`$modal.modal(...)`). Bootstrap 5 removed that jQuery plugin API, so Bootstrap 5 support requires a modal adapter or a shared runtime refactor.

Recommended abstraction:

```text
ModalController
  open(element)
  close(element)
  onHidden(element, callback)
```

Adapters can then implement Bootstrap 3/4 jQuery behavior and Bootstrap 5 native behavior separately. Gallery and Heading should not duplicate this compatibility logic.

## Dependency direction

Allowed:

```text
summernote-gallery  ---> snb-components
summernote-heading  ---> snb-components
summernote-bricks   ---> Summernote context/button contract
```

Avoid:

```text
summernote-bricks ---> concrete brick internals
gallery ---> heading
heading ---> gallery
snb-components ---> concrete bricks
```

The `summernote-gallery` / `summernote-heading` dependency declarations that remain in the current v2 package are transitional convenience dependencies. Once the lockfile/toolchain migration is isolated and validated, they should be reconsidered as optional/peer/example dependencies rather than runtime imports.

## Repository strategy

Keep the public packages in separate repositories for now. They already have independent users, history and release versions. Standardize CI, contribution rules and release conventions instead of forcing a monorepo migration immediately.

Re-evaluate a monorepo only if most future changes consistently require synchronized commits/releases across all packages.

## Release compatibility

Breaking changes to any of these require a major version:

- Summernote option names or data shapes;
- generated/persisted brick HTML that consumers may store;
- package entrypoints;
- supported host dependency ranges when existing users are dropped;
- the naming/shape of documented Bricks composition options.

Internal refactors that preserve those contracts can remain minor/patch releases according to semantic versioning.
