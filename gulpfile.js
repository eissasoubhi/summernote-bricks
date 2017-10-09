var yargs = require('yargs');
var gulp = require('gulp');
var template = require('gulp-template');
var rename = require('gulp-rename');
var print = require('gulp-print');

function toCamle (val) {
       return val.charAt(0).toUpperCase() + val.slice(1);
}

gulp.task('brick', function  () {
    var name = yargs.argv.name;
    var type = yargs.argv.type || 'simple';
    var class_name = toCamle(name);

    gulp.src('src/components/classes/'+type+'-brick.class.js')
        .pipe(template({
            name: name,
            class_name: class_name,
        }))
        .pipe(rename(function (path) {
            path.basename = class_name+'.class'
        }))
        .pipe(gulp.dest('src/classes/'))
        .pipe(print(function (filepath) {
            return "Created class: " + class_name;
        }))
        .pipe(print(function (filepath) {
            return "built: " + filepath;
        }));

    gulp.src('src/components/assets/'+type+'/html.html')
        .pipe(template({
            name: name,
            class_name: class_name,
        }))
        .pipe(gulp.dest('dist/bricks_assets/'+name))
        .pipe(print(function (filepath) {
            return "built: " + filepath;
        }));

    gulp.src('src/components/assets/'+type+'/style.html')
        .pipe(template({
            name: name,
            class_name: class_name,
        }))
        .pipe(gulp.dest('dist/bricks_assets/'+name))
        .pipe(print(function (filepath) {
            return "built: " + filepath;
        }));

    if (type == 'modalable') {
        gulp.src('src/components/assets/'+type+'/modal.html')
            .pipe(template({
                name: name,
                class_name: class_name,
            }))
            .pipe(gulp.dest('dist/bricks_assets/'+name))
            .pipe(print(function (filepath) {
                return "built: " + filepath;
            }));

        gulp.src('src/components/assets/'+type+'/modal_body.html')
            .pipe(template({
                name: name,
                class_name: class_name,
            }))
            .pipe(gulp.dest('dist/bricks_assets/'+name))
            .pipe(print(function (filepath) {
                return "built: " + filepath;
            }));

        gulp.src('src/components/assets/'+type+'/modal_style.html')
            .pipe(template({
                name: name,
                class_name: class_name,
            }))
            .pipe(gulp.dest('dist/bricks_assets/'+name))
            .pipe(print(function (filepath) {
                return "built: " + filepath;
            }));
    };
}
);
