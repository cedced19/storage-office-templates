// test if user is authenticated and if user is an administrator
module.exports = function(req, res, next) {
   if (req.isAuthenticated() && req.user.admin) {
        next();
  } else {
        var err = new Error('You don\'t have the required abilities.');
        err.status = 401;
        next(err);
  }
};
