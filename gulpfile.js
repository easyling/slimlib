var gulp = require('gulp');
var babel = require('gulp-babel');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
var concat = require('gulp-concat')

gulp.task('build', ['docs'], function () {
    'use strict';
    gulp.src('src/slimlib.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('docs', function () {
    'use strict';
    return gulp.src('src/slimlib.js')
        .pipe(concat('slimlib.md'))
        .pipe(gulpJsdoc2md())
        .on('error', function (err) {
            gutil.log('jsdoc2md failed:', err.message)
        })
        .pipe(gulp.dest('docs'))
});

gulp.task('clean', function () {
    'use strict';
    return gulp.src(['dist', 'docs'], {read: false})
        .pipe(clean());
});