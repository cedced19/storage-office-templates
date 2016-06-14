var express = require('express');
var router = express.Router();
var admin = require('../policies/admin.js');
var auth = require('../policies/auth.js');
var hash = require('password-hash-and-salt');

/* GET Users */
router.get('/', admin, function(req, res, next) {
    req.app.models.users.find().exec(function(err, models) {
        if(err) return next(err);
        models.forEach(function(model){
            delete model.password;
        });
        res.json(models);
    });
});

/* POST Users: create a user */
router.post('/', admin, function(req, res, next) {
    if (typeof req.body.admin === 'undefined') req.body.admin = false;
    req.app.models.users.create(req.body, function(err, model) {
        if(err) return next(err);
        res.json(model);
    });
});

/* GET An user */
router.get('/:id', admin, function(req, res, next) {
    req.app.models.users.findOne({ id: req.params.id }, function(err, model) {
        if(err) return next(err);
        if(model === '' || model === null || model === undefined) return next(err);
        delete model.password;
        res.json(model);
    });
});

/* DELETE An user */
router.delete('/:id', admin, function(req, res, next) {
    if (req.user.id == req.params.id) {
      var err = new Error('You can\'t delete yourself.');
      err.status = 401;
      return next(err);
    }
    req.app.models.users.destroy({ id: req.params.id }, function(err) {
        if(err) return next(err);
        res.json({ status: true });
    });
});

/* PUT The current user */
router.put('/me', auth, function(req, res, next) {
    delete req.body.id;

    // Test if there is a password
    if (req.body.password || req.body.oldpassword) {
      var err = new Error('You can\'t change password without verification against the old password.');
      err.status = 401;
      return next(err);
    }

    // Test if the user want to change his level
    if (req.body.admin) {
      var err = new Error('You can\'t change your permission level.');
      err.status = 401;
      return next(err);
    }

    req.app.models.users.update({ id: req.user.id }, req.body, function(err, model) {
      if(err) return next(err);
      delete model[0].password;
      res.json(model[0]);
    });

});

/* PUT An user */
router.put('/:id', admin, function(req, res, next) {
    delete req.body.id;

    // Test if there is a password
    if (req.body.password || req.body.oldpassword) {
      var err = new Error('You can\'t change password without verification against the old password.');
      err.status = 401;
      return next(err);
    }

    // If an administrator want to change his level he can't
    if (req.user.id == req.params.id) {
      var err = new Error('You can\'t change your permission level.');
      err.status = 401;
      return next(err);
    }

    req.app.models.users.update({ id: req.params.id }, req.body, function(err, model) {
      if(err) return next(err);
      delete model[0].password;
      res.json(model[0]);
    });

});

/* PUT The current user's password */
router.put('/password/me', auth, function(req, res, next) {
    delete req.body.id;

    // Test old password
    req.app.models.users.findOne({ id: req.user.id }, function (err, model) {
      if (err) { return next(err); }
      if (!model) {
        return next(new Error('User not found.'));
      }

      hash(req.body.oldpassword).verifyAgainst(model.password, function(err, verified) {
          if (err) {
            return next(err);
          } else if (!verified) {
            err = new Error('Old password does not match.');
            err.status = 401;
            return next(err);
          } else {
          req.app.models.users.update({ id: req.user.id }, {
            password : req.body.password
          }, function(err, model) {
                if(err) return next(err);
                delete model[0].password;
                res.json(model[0]);
            });
          }
      });

    });

});

/* PUT An user's password */
router.put('/password/:id', admin, function(req, res, next) {
    delete req.body.id;

    // Test old password
    req.app.models.users.findOne({ id: req.params.id }, function (err, model) {
      if (err) { return next(err); }
      if (!model) {
        return next(new Error('User not found.'));
      }

      hash(req.body.oldpassword).verifyAgainst(model.password, function(err, verified) {
          if (err) {
            return next(err);
          } else if (!verified) {
            err = new Error('Old password does not match.');
            err.status = 401;
            return next(err);
          } else {
          req.app.models.users.update({ id: req.params.id }, {
            password : req.body.password
          }, function(err, model) {
                if(err) return next(err);
                delete model[0].password;
                res.json(model[0]);
            });
          }
      });

    });

});

module.exports = router;
