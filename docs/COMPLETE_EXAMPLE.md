# Complete Heading + Gallery + Bricks example

This example shows the full relationship between the three standalone packages in a normal Summernote page.

## Install

```bash
npm install jquery bootstrap summernote summernote-heading@next summernote-gallery@next summernote-bricks@next
```

## Full page

Create `index.html` in your application and serve the project directory with your usual local web server.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Summernote Bricks example</title>

  <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="node_modules/summernote/dist/summernote-bs5.min.css">
</head>
<body class="p-4">
  <div id="editor">
    <h2>Hello Summernote</h2>
    <p>Heading and Gallery are standalone plugins. Bricks only groups their buttons.</p>
  </div>

  <script src="node_modules/jquery/dist/jquery.min.js"></script>
  <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
  <script src="node_modules/summernote/dist/summernote-bs5.min.js"></script>

  <!-- Standalone plugins: each one works without Bricks. -->
  <script src="node_modules/summernote-heading/dist/summernote-heading.browser.js"></script>
  <script src="node_modules/summernote-gallery/dist/summernote-gallery.browser.js"></script>

  <!-- Composer: loaded after the buttons it will group. -->
  <script src="node_modules/summernote-bricks/dist/summernote-bricks.browser.js"></script>

  <script>
    $('#editor').summernote({
      height: 300,
      toolbar: [
        ['style', ['bold', 'italic', 'underline']],
        ['extensions', ['summernoteBricks']],
      ],
      summernoteBricks: {
        buttonLabel: 'Bricks',
        tooltip: 'More content blocks',
        subBricks: [
          'summernote-heading',
          'summernote-gallery',
        ],
      },
    });
  </script>
</body>
</html>
```

## What happens when the page loads?

1. jQuery loads.
2. Summernote loads and creates its plugin system.
3. `summernote-heading` registers the `summernoteHeading` button.
4. `summernote-gallery` registers the `summernoteGallery` button.
5. `summernote-bricks` registers the `summernoteBricks` dropdown.
6. When the editor starts, Bricks takes the already-registered Heading and Gallery buttons and places them inside that dropdown.

Bricks never downloads or embeds the child plugins. The application owns the list of installed plugins.

## Use only one plugin

If you only want Heading, remove Gallery from both the installation and the page:

```bash
npm install jquery bootstrap summernote summernote-heading@next
```

Then use the Heading button directly in the normal Summernote toolbar. You do not need `summernote-bricks`.

The same rule applies to Gallery.

## Add another Summernote plugin

A third-party or application-specific plugin can join the Bricks dropdown as long as it registers a normal Summernote button.

For example, if it registers `button.myCompanyButton`:

```js
summernoteBricks: {
  subBricks: [
    'summernote-heading',
    'summernote-gallery',
    'myCompanyButton',
  ],
}
```

No Bricks-specific adapter is required.

## Repository links

- [summernote-heading](https://github.com/eissasoubhi/summernote-heading) — standalone Heading plugin
- [summernote-gallery](https://github.com/eissasoubhi/summernote-gallery) — standalone Gallery plugin
- [summernote-bricks](https://github.com/eissasoubhi/summernote-bricks) — optional composer for registered plugin buttons
