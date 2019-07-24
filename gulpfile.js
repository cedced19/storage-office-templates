var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var log = require('gulplog');
var rename = require('gulp-rename');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var through = require('through');

var isDist = process.argv.indexOf('serve') === -1;

gulp.task('css', function () {
    return gulp.src('public/stylesheets/index.css')
    .pipe(isDist ? csso() : through())
    .pipe(isDist ? autoprefixer('last 2 versions', { map: false }) : through())
    .pipe(rename('styles.css'))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('js', function () {
    var b = browserify({
      entries: 'public/javascripts/index.js',
      debug: true
    });
  
    return b.bundle()
      .pipe(source('public/javascripts/index.js'))
      .pipe(buffer())
      .pipe(isDist ? uglify() : through()) 
        .on('error', log.error)
      .pipe(rename('scripts.js'))
      .pipe(gulp.dest('public/javascripts/'));
});

gulp.task('css-watch', ['css'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('js-watch', ['js'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('reload', function (done) {
    browserSync.reload();
    done();
});


gulp.task('default', ['js', 'css']);

gulp.task('serve', function () {

    browserSync.init({
        proxy: 'http://localhost:' + require('env-port')('8880')
    });

    gulp.watch('public/views/*.html', ['reload']);
    gulp.watch('views/*.ejs', ['reload']);

    gulp.watch('public/stylesheets/index.css', ['css-watch']);
    gulp.watch(['public/javascripts/**/**.js', '!public/javascripts/scripts.js'], ['js-watch']);
});
