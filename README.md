Summernote Bricks
=================


Introduction
----------

Summernote bricks is a module of the Summernote plugin to add user-friendly components to the editor using bootstrap.

See the demo here https://eissasoubhi.github.io/summernote-bricks/  

Requirements
----------

 - npm
 - Modern browser that supports ECMAScript 6
 - Tested on Windows 10, Google Chrome Version 61 and Firefox 55.0.3 (64-bit) with summernote v0.8.2


Installation
-------------

**Using NPM**

 1. `$ npm i summernote-bricks`
 2. `$ cd node_modules/summernote-bricks`
 3. `$ npm start`

Then go to http://127.0.0.1:9090

**Or using GitHub**

 1. [Download/Clone](https://github.com/eissasoubhi/summernote-bricks) the repo from GitHub
 2. `$ cd summernote-bricks`
 3. `$ npm start`

Then go to http://127.0.0.1:9090

Usage
=====

Add the required files :
**The stylesheet files.**
```HTML
<link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="node_modules/summernote/dist/summernote.css" rel="stylesheet">
<link href="node_modules/font-awesome/css/font-awesome.min.css" rel="stylesheet">
<link href="dist/assets/editable-bloc.css" rel="stylesheet">
```

**Then Summernote tag.**
```HTML
<div id="summernote"><span></span></div>
```
**The script files.**
```HTML
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="node_modules/summernote/dist/summernote.min.js"></script>
<script src="dist/summernote-extensions.dist.js"></script>
```
<a name="initialization"></a>
**Initialize [Summernote](https://github.com/summernote/summernote) with the bricks module.**
```HTML
 <script>

     jQuery(document).ready(function($) {
          $('#summernote').summernote({
             toolbar: [
                 ['insert', ['bricks']],
                 ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
             ],
             // bricks options

             bricks: {
                 gallery: {
                     modal_body_file: "php/gallery_dynamic_content.html"
                 },
                 thumbnails: {
                     modal_body_file: "php/thumbnails_dynamic_content.html"
                 },
             }

         });
     });

 </script>
```
[See more details about Summernote installation and options.](https://github.com/summernote/summernote)


Options
=======

The Summernote-bricks options can be passed with [the Summernote editor options with key "bricks".](#initialization) or you can put them inside the config file src/config/default.js


| Option            | description                                                                                                                                                           | default                                                                       | type      | example                                                                   |
|-----------------  |---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |-----------------------------------------------------------------------------  |--------   |-------------------------------------------------------------------------  |
|<a name="lang_option"></a> modal_body_file   | instead of loading the content from a local HTML file, use this option to load the content from a URL.This option must be set for a specific brick inside an object.  | loads the default brick HTML file **dist/bricks_assets/[brick name]/html.html**   | String    | `thumbnails: {modal_body_file: "php/thumbnails_dynamic_content.html",},`     |
|  lang              | Localization language in the file **src/config/langs.js**. The given value must be in that file as an object.                                                             | en                                                                            | String    | fr                                                                        |
| bricks_assets     | The bricks folder path which contains the HTML and the style files.                                                                                                   | dist/bricks_assets                                                            | String    | dist/bricks_assets                                                        |

To retrieve the configuration values use the helper function :

```javascript
var configs = _helpers.getConfig();
var current_lang = configs.lang; // en
```

Creating custom bricks
======================

Run `$ npm run watch` to set watchify to auto-generate the bundle file **/dist/summernote-extensions.dist.js**.

To Create a modalable brick (opens a modal on click) run `$ gulp brick --type modalable --name [brick name]`.

To Create a simple brick (inserts the content immediately to the editor without opening a modal) run `$ gulp brick --type simple --name [brick name]` or just `$ gulp brick --name [brick name]`. 

Disabling or removing a brick
--------------------

To disable a brick, all you need to do is removing it or commenting it out from the the plugins array in the main js file  **src/summernote-extensions.js**

```javascript
 var plugins = [
     new H2(),
     new Panel(),
     // the Menu brick is disabled
     // new Menu(),
     new Gallery(),
     new Thumbnails(),
     new ContactForm(),
     new Header()
 ];
```

Simple brick example
--------------------

    $ gulp brick --name header

The code above will create the following files :

 - src/classes/Header.class.js
 - dist/bricks_assets/header/html.html
 - dist/bricks_assets/header/style.html

Next :

 1. Require the **Header** class you just created in the file **src/utility/autoload.js**
 2. Then go to the file **src/summernote-extensions.js** and add the same class to the **plugins** array : `new Header()`
```javascript
 var plugins = [
     new H2(),
     new Panel(),
     new Menu(),
     new Gallery(),
     new Thumbnails(),
     new ContactForm(),
     // Header added
     new Header()
 ];
```

 3. Add the brick localization text in the file **src/config/langs.js**
```javascript
 en: {

    header:{
        tooltip: "Add a header",
        label: "Header",
    },

    panel:{
    tooltip: "Add a new panel with text",
    label: "Panel",
 },
```
To edit the inserted HTML go to **dist/bricks_assets/header/html.html** file.
To edit the style of the inserted HTML go to **dist/bricks_assets/header/style.html** file.

Modalable brick example
-----------------------

    $ gulp brick --type modalable --name something

The code above will create the following files :

 - src/classes/Something.class.
 - dist/bricks_assets/something/modal.
 - dist/bricks_assets/something/modal_body.
 - dist/bricks_assets/something/modal_style.
 - dist/bricks_assets/something/html.
 - dist/bricks_assets/something/style.html

Next :

 1. Require the **Something** class you just created in the file
    **src/utility/autoload**.
 2. Then go to the file **src/summernote-extensions.js** and add the same
        class to the **plugins** array : `new Something()`

```javascript
 var plugins = [
     new H2(),
     new Panel(),
     new Menu(),
     new Gallery(),
     new Thumbnails(),
     new ContactForm(),
     // Something added
     new Something()
 ];
```
 3. Add the brick localization text in the file **src/config/langs.js**
 
```javascript
 en: {

     something:{
         tooltip: "Add something",
         label: "Something",
     },

     panel:{
     tooltip: "Add a new panel with text",
     label: "Panel",
 },
```

To edit the inserted HTML go to **dist/bricks_assets/something/html.html file**.

To edit the style of the inserted HTML go to **dist/bricks_assets/something/style.html** file.

To edit the modal go to **dist/bricks_assets/something/modal.html** file.

To edit the modal body HTML go to **dist/bricks_assets/something/modal_body.html** file.

To edit the modal body style go to **dist/bricks_assets/something/modal_style.html** file.

Localization
============

After setting the [lang option](#lang_option) in the [initialization step](#initialization) you can customize the shown text for every brick in the file **src/config/langs.js** .

You may retrieve lines from language file using the _helpers.lang() helper function. The lang() method accepts the key of the translation string as its first argument with the dot notation. For example, let's retrieve the menu tooltip translation string from the **src/config/langs.js** file

```javascript 
_helpers.lang('menu.tooltip');
```

For example if the chosen language is *en* the lang() function expects the langs file to have something like this :

```javascript
// src/config/langs.js

en: {

    menu:{
        tooltip: "Add a new menu",
    },

    ...

```

if it doesn't find the requested translation it returns the key prefixed with the language. Example:  
*en.menu.tooltip*

License
=======


----------
The contents of this repository is licensed under [The MIT License](https://opensource.org/licenses/MIT)
