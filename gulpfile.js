var gulp = require('gulp');
var include = require('gulp-include');
//var mocha = require('gulp-mocha');
var mochaPhantomjs = require('gulp-mocha-phantomjs');
var less = require('gulp-less');
var concat = require('gulp-concat');

// TODO semver implementation for build file
var config = {
  lib: './src/storm-color-picker.js',
  watch: ['./src/**/*.js'],
  styles: [
    './src/components/slider/slider.less',
    './src/components/template/template.less'
  ],
  buildPath: './build',
  tests: './test/**/*.js'
};

/*********
 * default
 *********/
gulp.task('default', ['scripts', 'styles', 'test']);

/*********
 * watch
 *********/
gulp.task('watch', ['scripts', 'styles'], function () {
  //return gulp.watch(config.watch, ['scripts', 'test']);
  return gulp.watch(config.watch, ['scripts']);
});

/*********
 * scripts
 *********/
gulp.task('scripts', function () {
  gulp.src(config.lib)
    .pipe(include())
    .pipe(gulp.dest(config.buildPath));
});

/*********
 * styles
 *********/
gulp.task('styles', function() {
  gulp.src(config.styles)
    .pipe(less())
    .pipe(concat('storm-color-picker.css'))
    .pipe(gulp.dest(config.buildPath));
});

/*********
 * tests
 *********/
gulp.task('test', function () {
  return gulp.src('test/**/*.html', {read: false})
    .pipe(mochaPhantomjs({reporter: 'spec'}));
});
