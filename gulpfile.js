var path = require('path');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var del = require('del');
var fs = require('fs');
var isparta = require('isparta');
var request = require('request');
var moment = require('moment');

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-core/register');

gulp.task('static', function() {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('nsp', function(cb) {
  nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('pre-test', function() {
  return gulp.src('lib/**/*.js')
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function(cb) {
  var mochaErr;

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function(err) {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', function() {
      cb(mochaErr);
    });
});

gulp.task('babel', function() {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
  return del('dist');
});

gulp.task('prefetch', function() {

  // Finnish Flag days data
  // Data can be re-downloaded from here:
  // According to the terms the URL shouldn't be referenced directly – at least not very often.
  // Thus we download it if we don't have it or it's older than a month
  fs.stat('data/Liputuspäivät.json', function(error, stats) {
    // If our file is older than from this month, re-download it
    if (typeof(stats) === "undefined" || moment().isAfter(stats.mtime, 'month'))
    {
      console.log('Downloading Finnish Flag days data...');
      request('http://www.webcal.fi/cal.php?id=2&format=json&start_year=current_year&end_year=current_year&tz=Europe%2FHelsinki')
        .pipe(fs.createWriteStream('data/Liputuspäivät.json'));
    }
  });

  console.log('Data has been refreshed – server is good to go!');
});

gulp.task('prepublish', ['nsp', 'babel']);
gulp.task('test', ['static', 'test', 'babel']);
gulp.task('default', ['babel']);
