require('angular'); /*global angular*/
require('angular-route');
require('angular-sanitize');
require('angular-touch');
require('ng-notie');

var app = angular.module('SOT', ['ngNotie', 'ngSanitize', 'ngRoute', 'ngTouch']);
app.config(['$routeProvider', function($routeProvider){
        $routeProvider
        .when('/users', {
            templateUrl: '/views/users-list.html',
            controller: 'SOTUsersListCtrl'
        })
        .when('/users/new', {
            templateUrl: '/views/users-new.html',
            controller: 'SOTUsersNewCtrl'
        })
        .when('/users/:id', {
            templateUrl: '/views/users-id.html',
            controller: 'SOTUsersIdCtrl'
        })
        .when('/signup', {
            templateUrl: '/views/signup.html',
            controller: 'SOTSignupCtrl'
        })
        .when('/login', {
            templateUrl: '/views/login.html',
            controller: 'SOTLoginCtrl'
        })
        .when('/', {
            templateUrl: '/views/files-list.html',
            controller: 'SOTFilesListCtrl'
        })
        .when('/files/new', {
            templateUrl: '/views/files-new.html',
            controller: 'SOTFilesNewCtrl'
        })
        .when('/files/:id', {
            templateUrl: '/views/files-id.html',
            controller: 'SOTFilesIdCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);
app.run(['$rootScope', '$location', '$http', 'notie', function ($rootScope, $location, $http, notie) {
        $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
          document.getElementById('checkbox-toggle').checked = false;
        });

        $rootScope.$logout = function () {
          $http.get('/logout').success(function () {
            $rootScope.user = false;
            $location.path('/login');
          });
        };

        $http.get('/authenticated').success(function (data) {
          if (data.status) {
              $rootScope.user = data.user;
          } else {
              $rootScope.user = false;
          }
        });

        $rootScope.$error = function () {
          $http.get('/authenticated').success(function (data) {
            if (!data.status) {
                $rootScope.user = false;
            }
            notie.alert(3, 'Something went wrong!', 3);
          }).error(function () {
            notie.alert(3, 'Cannot access to the server.', 3);
          });
        };

        $rootScope.$login = function (cb) {
          $http.get('/authenticated').success(function (data) {
            if (!data.status) {
              notie.input('You must authenticate to do that', 'Continue', 'Cancel', 'text', 'Name', function (name) {
                notie.input('You must authenticate to do that', 'Login', 'Cancel', 'password', 'Password', function (password) {
                  $http.post('/login', {
                      name: name,
                      password: password
                  }).success(function(data) {
                      $rootScope.user = data;
                      cb();
                  }).error(function () {
                      notie.alert(3, 'Invalid name or password.', 3);
                  });
                });
              });
            } else {
              cb();
            }
          });
      };

}]);


app.controller('SOTUsersListCtrl', require('./controllers/users-list.js'));
app.controller('SOTUsersIdCtrl', require('./controllers/users-id.js'));
app.controller('SOTUsersNewCtrl', require('./controllers/users-new.js'));
app.controller('SOTSignupCtrl', require('./controllers/signup.js'));
app.controller('SOTLoginCtrl', require('./controllers/login.js'));
app.controller('SOTFilesListCtrl', require('./controllers/files-list.js'));
app.controller('SOTFilesIdCtrl', require('./controllers/files-id.js'));
app.controller('SOTFilesNewCtrl', require('./controllers/files-new.js'));
