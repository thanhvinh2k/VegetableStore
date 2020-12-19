'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');

let source = 'assets/',
    dest = 'public/dist/';

// Our scss source folder: .scss files
let scss = {
    in: source + 'sass/main.scss',
    out: dest + 'css/',
    sassOpts: {
        outputStyle: 'nested',
        precison: 3,
        errLogToConsole: true,
    },
};

// Compile scss
gulp.task('sass', () => {
    return gulp.src(scss.in).pipe(sass(scss.sassOpts)).pipe(minifyCSS()).pipe(gulp.dest(scss.out));
});

// Build task
gulp.task('build', gulp.series('sass'));

// Watch task
gulp.task('watch', () => {
    gulp.watch(source + 'sass/**/*', gulp.series('sass'));
});

// Development task
gulp.task('dev', gulp.series('sass', 'watch'));