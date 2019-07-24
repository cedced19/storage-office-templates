require('angular'); /*global angular*/
require('angular-route');
require('angular-sanitize');
require('ng-notie');
require('angular-translate');
require('angular-translate-loader-static-files');
require('angular-translate-loader-url');
require('ng-file-upload');
require('angular-local-storage');

var app = angular.module('SOT', ['ngNotie', 'ngSanitize', 'ngRoute', 'pascalprecht.translate', 'ngFileUpload', 'LocalStorageModule']);
app.config(['$routeProvider', '$translateProvider', 'localStorageServiceProvider',  function($routeProvider, $translateProvider, localStorageServiceProvider) {
        // Route configuration
        $routeProvider
        .when('/management', {
            templateUrl: '/views/management.html',
            controller: 'SOTManagementCtrl'
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
        .when('/languages', {
            templateUrl: '/views/languages.html',
            controller: 'SOTLanguagesCtrl'
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

        // Localstorage configuration
        localStorageServiceProvider.setPrefix('storage-office-templates');

        // i18n configuration
        $translateProvider
        .useStaticFilesLoader({
            prefix: '/langs/locale-',
            suffix: '.json'
        })
        .registerAvailableLanguageKeys(['en', 'fr'], {
          'fr_*': 'fr',
          'en_*': 'en',
       	  '*': 'en'
        })
        .useSanitizeValueStrategy(null)
        .determinePreferredLanguage()
        .fallbackLanguage('en');
}]);
app.run(['$rootScope', '$location', '$http', '$translate', 'notie', 'localStorageService', function ($rootScope, $location, $http, $translate, notie, localStorageService) {


        $rootScope.$logout = function () { // Logout function
          $http.get('/logout').success(function () {
            $rootScope.user = false;
            $location.path('/login');
          });
        };

        $rootScope.$goPath = function (path) { // Change path from view
          $location.path(path);
        }

        $rootScope.$error = function () { // Send message error
          $http.get('/authenticated').success(function (data) {
            if (!data.status) {
                $rootScope.user = false;
            }
            $translate('error_occured').then(function (error) {
              notie.alert(3, error , 3);
            });

          }).error(function () {
            $translate('http_error').then(function (error) {
              notie.alert(3, error, 3);
            });
          });
        };

        $http.get('/authenticated').success(function (data) { // Get user informations
          if (data.status) {
              $rootScope.user = data.user;
          } else {
              $rootScope.user = false;
          }
        });

        var lang = localStorageService.get('lang');
        if (lang) {
          $translate.use(lang);
        }
}]);

app.filter('bytes', function() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	}
});

app.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                scope.$apply(attrs.imageonload)(false);
            });
            element.bind('error', function(){
              scope.$apply(attrs.imageonload)(true);
            });
        }
    };
});

app.controller('SOTManagementCtrl', require('./controllers/management.js'));
app.controller('SOTUsersIdCtrl', require('./controllers/users-id.js'));
app.controller('SOTUsersNewCtrl', require('./controllers/users-new.js'));
app.controller('SOTSignupCtrl', require('./controllers/signup.js'));
app.controller('SOTLoginCtrl', require('./controllers/login.js'));
app.controller('SOTFilesListCtrl', require('./controllers/files-list.js'));
app.controller('SOTFilesIdCtrl', require('./controllers/files-id.js'));
app.controller('SOTFilesNewCtrl', require('./controllers/files-new.js'));
app.controller('SOTLanguagesCtrl', require('./controllers/languages.js'));
