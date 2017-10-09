intro
summernote bricks is a module of the summernote plugin to to add a user friendly components to the editor.

requirements 
npm
watchify (for changing the module)
Tested on Windows 10, Google Chrome Version 61 and Firefox 55.0.3 (64-bit) with summernote v0.8.2

installation
npm i summernote-bricks 
$ cd node_modules/summernote-bricks
npm start
go to http://127.0.0.1:9090/ 
usage
    <link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="node_modules/summernote/dist/summernote.css" rel="stylesheet">
    <link href="node_modules/font-awesome/css/font-awesome.min.css" rel="stylesheet">
    <link href="dist/assets/editable-bloc.css" rel="stylesheet">

        <div id="summernote"><span></span></div>

    <script src="node_modules/jquery/dist/jquery.min.js"></script>
    <script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="node_modules/summernote/dist/summernote.min.js"></script>
    <script src="dist/summernote-extensions.dist.js"></script>

    <script>
        jQuery(document).ready(function($) {
             $('#summernote').summernote({
                height: 300,
                toolbar: [
                    ['insert', ['bricks']],
                    ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
                    ['misc', [ 'codeview',]]
                ],
                bricks: {
                    gallery: {
                        modal_body_file: "/php/gallery_dynamic_content.html"
                    },
                    thumbnails: {
                        modal_body_file: "/php/thumbnails_dynamic_content.html"
                    },
                }
            });
        });
    </script>

    it must run on server to work.

contribution
