module.exports = ['$routeParams', '$scope', '$location', '$http', '$rootScope', 'notie', '$translate', function($routeParams, $scope, $location, $http, $rootScope, notie, $translate) {

        if ($routeParams.id === 'me') {
            $scope.email = $rootScope.user.email;
        } else if (!$rootScope.user.admin) {
            $location.path('/');
        } else if ($rootScope.user.id == $routeParams.id) {
            $scope.email = $rootScope.user.email;
        } else {
            $http.get('/api/users/' + $routeParams.id).success(function(data) {
                $scope.email = data.email;
                $scope.admin = data.admin;
                $scope.promoteUser = function () {
                  $http.put('/api/users/' + $routeParams.id, {
                      admin: !$scope.admin
                  }).success(function(data) {
                    $translate('user_updated').then(function (translation) {
                      notie.alert(1, translation, 3);
                    });
                    $scope.admin = data.admin;
                  }).error($rootScope.$error);
                };
            }).error($rootScope.$error);
        }

        $scope.updateEmail = function () {
          $http.put('/api/users/' + $routeParams.id, {
              email: $scope.email
          }).success(function(data) {
            $translate('user_updated').then(function (translation) {
              notie.alert(1, translation, 3);
            });
          }).error($rootScope.$error);
        };

        $scope.updatePassword = function () {
          $translate(['user_updated', 'old_password_doesnt_match', 'confirm_password_doesnt_match']).then(function (translations) {
            if ($scope.password == $scope.confirmpassword) {
              $http.put('/api/users/password/' + $routeParams.id, {
                  password: $scope.password,
                  oldpassword: $scope.oldpassword
              }).success(function(data) {
                  notie.alert(1, translations['user_updated'], 3);
              }).error(function (data, code) {
                  if (code == 401) {
                    notie.alert(3, translations['old_password_doesnt_match'], 3);
                  } else {
                    $rootScope.$error();
                  }
              });
            } else {
              notie.alert(3, translations['confirm_password_doesnt_match'], 3);
            }
            $scope.oldpassword = '';
            $scope.password = '';
            $scope.confirmpassword = '';
        });
      };

}];
