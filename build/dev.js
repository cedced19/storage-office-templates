var fs = require('fs');
var p = require('path');
var bs = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');

var path = function (d) {
  return p.resolve(__dirname, d);
};

var b = browserify({ cache: {}, entries: [path('../public/javascripts/index.js')], packageCache: {} });
b.plugin(watchify);

var bundleJs = function () {
  bs.notify('Compiling...');
  b.bundle().pipe(fs.createWriteStream(path('../public/javascripts/scripts.js')));
  bs.reload();
};

var dev = function () {
  bs.init({
      proxy: 'http://localhost:' + (process.env.PORT || '8880'),
      middleware: [
          {
              route: '/stylesheets/styles.css',
              handle: function (req, res, next) {
                 fs.createReadStream(path('../public/stylesheets/index.css')).pipe(res);
              }
          }
      ]
  });

  bs.watch(path('../public/stylesheets/index.css')).on('change', bs.reload);
  bs.watch(path('../public/views/*.html')).on('change', bs.reload);
  bs.watch(path('../views/*.ejs')).on('change', bs.reload);

  b.on('update', bundleJs);
  bundleJs();
};

if (module.parent) {
  module.exports = dev;
} else {
  dev();
}
