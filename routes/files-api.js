var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var multer = require('multer')({ dest: './uploads/'});
var existsFile = require('exists-file');
var fs = require('fs');
var Promise = require('promise');
var randomstring = require('randomstring');
var documentPreview = require('machinepack-document-preview');

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

    if (typeof req.body.shareId === 'undefined') {
      req.body.shareId = randomstring.generate(20);
    }

    if (typeof req.body.shareState === 'undefined') {
      req.body.shareState = false;
    }

    req.app.models.files.create({
      title: req.body.title,
      file: req.file.originalname,
      description: req.body.description,
      shareId: req.body.shareId,
      shareState: req.body.shareState,
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

/* GET Shared file */
router.get('/share/:id', function(req, res, next) {
    req.app.models.files.findOne({ shareId: req.params.id }, function(err, model) {
        if (err || model === '' || model === null || model === undefined) return next(err);
        if (!model.shareState) {
          err = new Error('This file isn\'t shared.');
          err.status = 401;
          return next(err);
        }
        delete model.path;
        delete model.id;
        delete model.shareState;
        delete model.shareId;
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
         if(err || model === '' || model === null || model === undefined) return next(err);
        res.json(model[0]);
    });
});

/* Generate preview */
var preview = function (req, res, next, model) {
  var previewPath = './uploads/' + model.path + '.png';
  if (existsFile.sync(previewPath)) {
    res.setHeader('Content-Type', 'image/png');
    return res.sendFile(model.path + '.png', {root: './uploads/'});
  }

  documentPreview.generate({
    from: './uploads/' + model.path,
    to: previewPath,
    mime: model.type
  }).exec({

    error: function (errorPreview) {
      req.app.models.files.update({ id: model.id }, {preview: false}, function(errorUpdate, model) {
          if(errorUpdate || model === '' || model === null || model === undefined) return next(errorUpdate);
          next(errorPreview);
      });
    },

    noConvertion: function () {
      res.setHeader('Content-Type', model.type);
      res.sendFile(model.path, {root: './uploads/'});
    },

    success: function () {
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(model.path + '.png', {root: './uploads/'});
    }

  });
};

/* GET Preview of a file */
router.get('/preview/:id', auth, function(req, res, next) {
  req.app.models.files.findOne({ id: req.params.id }, function(err, model) {
      if(err || model === '' || model === null || model === undefined) return next(err);
      preview(req, res, next, model);
  });
});

/* GET Preview of a shared file */
router.get('/share/preview/:id', function(req, res, next) {
  req.app.models.files.findOne({ shareId: req.params.id }, function(err, model) {
      if(err || model === '' || model === null || model === undefined) return next(err);
      if (!model.shareState) {
        err = new Error('This file isn\'t shared.');
        err.status = 401;
        return next(err);
      }
      preview(req, res, next, model);
  });
});

/* Generate download */
var download = function (model, res) {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-disposition', 'attachment; filename=' + model.file);
  res.sendFile(model.path, {root: './uploads/'});
};

/* GET Download a file */
router.get('/download/:id', auth, function(req, res, next) {
  req.app.models.files.findOne({ id: req.params.id }, function(err, model) {
      if(err) return next(err);
      if(model === '' || model === null || model === undefined) return next(err);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-disposition', 'attachment; filename=' + model.file);
      res.sendFile(model.path, {root: './uploads/'});
  });
});

/* GET Download Shared file */
router.get('/share/download/:id', function(req, res, next) {
  req.app.models.files.findOne({ shareId: req.params.id }, function(err, model) {
      if(err) return next(err);
      if(!model.shareState) {
        err = new Error('This file isn\'t shared.');
        err.status = 401;
        return next(err);
      }
      download(model, res);
  });
});

module.exports = router;
