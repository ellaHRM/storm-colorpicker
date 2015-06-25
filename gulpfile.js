var gulp = require('gulp');
var include = require('gulp-include');

var config = {
  lib: './src/storm-colorpicker.js',
  watch: ['./src/**/*.js'],
  buildPath: './build'
};

/*********
 * default
 *********/
gulp.task('default', ['scripts']);

/*********
 * watch
 *********/
gulp.task('watch', ['scripts'], function() {
  return gulp.watch(config.watch, ['scripts']);
});

/*********
 * scripts
 *********/
gulp.task('scripts', function() {
  gulp.src(config.lib)
    .pipe(include())
    .pipe(gulp.dest(config.buildPath));
});
