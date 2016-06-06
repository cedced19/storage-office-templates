var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var multer = require('multer')({ dest: './uploads/'});
var isOffice = require('is-office');
var existsFile = require('exists-file');
var filePreview = require('filepreview');
var fs = require('fs');
var Promise = require('promise');

/* GET Files */
router.get('/', auth, function(req, res, next) {
    req.app.models.files.find().exec(function(err, models) {
        if (err) return next(err);
        models.forEach(function(model){
            delete model.path;
        });
        res.json(models);
    });
});

/* POST Files: create a file */
router.post('/', auth, multer.single('file'), function(req, res, next) {

    if (req.file === undefined) {
      err = new Error('You must upload a file.');
      err.status = 400;
      return next(err);
    }

    req.app.models.files.create({
      title: req.body.title,
      file: req.file.originalname,
      description: req.body.description,
      path: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype
    }, function(err, model) {
        if(err) return next(err);
        delete model.path;
        res.json(model);
    });
});

/* GET File */
router.get('/:id', auth, function(req, res, next) {
    req.app.models.files.findOne({ id: req.params.id }, function(err, model) {
        if(err || model === '' || model === null || model === undefined) return next(err);
        delete model.path;
        res.json(model);
    });
});

/* DELETE File */
router.delete('/:id', auth, function(req, res, next) {
      req.app.models.files.findOne({ id: req.params.id })
      .exec(function(err, file) {
            if (err) return next(err);
            var path = './uploads/' + file.path;
            var pExistsFile = Promise.denodeify(existsFile);
            var pDeleteFile = Promise.denodeify(fs.unlink);

            pExistsFile(path) // Check if file
              .then(function (exist) {
                if (exist) return pDeleteFile(path);  // Delete file
              })
              .then(function () { // Check if preview
                return pExistsFile(path + '.png');
              })
              .then(function (exist) {
                if (exist) return pDeleteFile(path + '.png');  // Delete preview
              })
              .then(function () {
                req.app.models.files.destroy({ id: req.params.id }).exec(function(err) {
                    if (err) return next(err);
                    res.json({ status: true });
                });
              }, function (err) {
                return next(err);
              });
        });

});

/* PUT File */
router.put('/:id', auth, function(req, res, next) {
    delete req.body.id;
    req.app.models.files.update({ id: req.params.id }, req.body, function(err, model) {
        if(err) return next(err);
        res.json(model[0]);
    });
});

/* PREVIEW File */
router.get('/preview/:id', auth, function(req, res, next) {
  req.app.models.files.findOne({ id: req.params.id }, function(err, model) {
      if(err) return next(err);
      if(model === '' || model === null || model === undefined) return next(err);

      if (isOffice(model.type) || /pdf/.test(model.type)) {

        if (existsFile.sync('./uploads/' + model.path + '.png')) {

          res.setHeader('Content-Type', 'image/png');
          res.sendFile(model.path + '.png', {root: './uploads/'});

        } else {

          filePreview.generate('./uploads/' + model.path, './uploads/' + model.path + '.png', function(err) {
            if(err) return next(err);
            res.setHeader('Content-Type', 'image/png');
            res.sendFile(model.path + '.png', {root: './uploads/'});
          });

        }

      } else {
        res.setHeader('Content-Type', model.type);
        res.sendFile(model.path, {root: './uploads/'});
      }

  });
});

/* DOWNLOAD File */
router.get('/download/:id', auth, function(req, res, next) {
  req.app.models.files.findOne({ id: req.params.id }, function(err, model) {
      if(err) return next(err);
      if(model === '' || model === null || model === undefined) return next(err);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-disposition', 'attachment; filename=' + model.file);
      res.sendFile(model.path, {root: './uploads/'});
  });
});

module.exports = router;
