'use strict';

var gulp         = require('gulp');
var uglify       = require('gulp-uglify');
var ts           = require('gulp-typescript');
var concat       = require('gulp-concat');
var sourcemaps   = require('gulp-sourcemaps');
var rename       = require('gulp-rename');
var wrap         = require('gulp-wrap');
var bump         = require('gulp-bump');
var gulpKarma    = require('gulp-karma');
var gulpSequence = require('gulp-sequence').use(gulp);
var pkg          = require('./package.json');
var files        = require('./files');

var karmaTestConfig = gulpKarma({configFile: 'karma.conf.js', action: 'run'});

var banner = '/*!\n' +
  ' * <%= pkg.name %>\n' +
  ' * <%= pkg.description %>\n' +
  ' * @version v<%= pkg.version %>\n' +
  ' * @link <%= pkg.homepage %>\n' +
  ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
  ' */\n';

var tsDev = ts.createProject({
  sortOutput:       true,
  sourceRoot:       ''
});

var tsTest = ts.createProject({
  sortOutput:       true,
  sourceRoot:       ''
});

gulp.task('bump', function () {
  return gulp.src('./*.json')
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('buildDev', function () {
  return gulp.src('src/*.ts')
    //.pipe(sourcemaps.init())
    .pipe(ts(tsDev)).js
    .pipe(concat('angular-nz-input-formats.js'))
    .pipe(wrap(banner + '(function(window, angular, undefined){<%= contents %>})(window, window.angular);', {pkg: pkg}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/'));
});

gulp.task('buildTest', function() {
  return gulp.src('test/*.ts')
    .pipe(ts(tsTest)).js
    .pipe(gulp.dest('./test/'));
});

gulp.task('minBuild', function () {
  return gulp.src('./build/' + pkg.name + '.js')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('copyBuild', function () {
  return gulp.src('./build/*')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', function () {
  return gulp.watch(files.mergeFilesFor('src'), ['test']);
});

gulp.task('watch', ['buildDev'], function () {
  return gulp.watch('src/*.ts', ['buildDev']);
});

gulp.task('test', ['buildDev', 'buildTest'], function () {
  return gulp.src(files.mergeFilesFor('karma-src')).pipe(karmaTestConfig);
});

gulp.task('testBuild', function () {
  return gulp.src(files.mergeFilesFor('karma-build')).pipe(karmaTestConfig);
});

gulp.task('testMin', function () {
  return gulp.src(files.mergeFilesFor('karma-min')).pipe(karmaTestConfig);
});

gulp.task('build', gulpSequence('buildDev', 'minBuild', ['testBuild', 'testMin']));

gulp.task('release', gulpSequence('bump', 'build', 'copyBuild'));
