var gulp = require('gulp')
var babel = require('gulp-babel')
var watch = require('gulp-watch')
var plumb = require('gulp-plumber')

var del = require('del')
var lazypipe = require('lazypipe')
var toPromise = require('stream-to-promise')

var src = './src/**'

var optPlugins = [
  'syntax-export-extensions',
  'transform-export-extensions',
  'syntax-object-rest-spread',
  'transform-object-rest-spread'
]
var optES5 = {presets: ['es2015'], plugins: optPlugins}
var optNode4 = {presets: ['es2015-node4'], plugins: optPlugins}
var optNode5 = {presets: ['node5'], plugins: optPlugins}

gulp.task('blame', function () {
  return del('./node_modules')
})

gulp.task('clear', function () {
  return del(['./bin/es5', './bin/node4', './bin/node5'])
})

const buildSrc = function (dest, opt) {
  return lazypipe()
    .pipe(babel, opt)
    .pipe(gulp.dest, './bin/' + dest)()
}

gulp.task('watch', ['build'], function () {
  var watchFor = [
    buildSrc('es5', optES5),
    buildSrc('node4', optNode4),
    buildSrc('node5', optNode5)
  ]

  return Promise.all(watchFor.map(function (el) {
    return toPromise(watch(src).pipe(plumb()).pipe(el))
  }))
})

gulp.task('build', ['buildES5', 'buildNode4', 'buildNode5'])

gulp.task('buildES5', ['clear'], function () {
  return gulp.src(src)
    .pipe(buildSrc('es5', optES5))
})

gulp.task('buildNode4', ['clear'], function () {
  return gulp.src(src)
    .pipe(buildSrc('node4', optNode4))
})

gulp.task('buildNode5', ['clear'], function () {
  return gulp.src(src)
    .pipe(buildSrc('node5', optNode5))
})
